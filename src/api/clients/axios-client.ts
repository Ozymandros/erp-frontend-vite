/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  type ApiClient,
  type ApiClientConfig,
  type RequestConfig,
  ApiClientError,
} from "./types";
import { showToastError } from "@/contexts/toast.service";

// Helper to silently log analytics (only in non-test environments)
const silentAnalyticsLog = (data: any) => {
  // Skip in test environments (CI, vitest, etc.)
  if (import.meta.env.MODE === 'test' || import.meta.env.CI || typeof process !== 'undefined' && (process.env.CI || process.env.VITEST)) {
    return;
  }
  fetch('http://127.0.0.1:7243/ingest/f4501e27-82bc-42a1-8239-00d978106f66', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {});
};

export class AxiosApiClient implements ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // #region agent log
        silentAnalyticsLog({
          location: "axios-client.ts:interceptor",
          message: "request interceptor",
          data: {
            url: config.url,
            method: config.method,
            hasAuth: !!this.authToken,
            headers: config.headers ? Object.keys(config.headers) : [],
          },
          timestamp: Date.now(),
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId: "C",
        });
        // #endregion
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        if (this.onRequest) {
          return this.onRequest(config);
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        if (this.onResponse) {
          return this.onResponse(response);
        }
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error);
        if (this.onError) {
          this.onError(apiError);
        }
        return Promise.reject(apiError);
      }
    );
  }

  private handleError(error: AxiosError): ApiClientError {
    if (error.response) {
      const { status, data } = error.response;
      const errorData = data as any;

      // Check for ASP.NET Core ProblemDetails format
      let message = errorData?.message || error.message || "An error occurred";
      let details = errorData?.details;

      // Handle ProblemDetails validation errors
      if (errorData?.title || errorData?.errors) {
        message = errorData?.title || errorData?.detail || message;
        // Extract validation errors from ProblemDetails.errors
        if (errorData?.errors && typeof errorData.errors === "object") {
          details = errorData.errors;
          // Build a user-friendly message from validation errors
          const validationMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => {
              const fieldMessages = Array.isArray(messages)
                ? messages
                : [messages];
              return `${field}: ${fieldMessages.join(", ")}`;
            })
            .join("; ");
          if (validationMessages) {
            message = validationMessages;
          }
        }
      }

      // Special handling for 403 Forbidden (authorization/permission errors)
      if (status === 403) {
        message =
          errorData?.detail ||
          errorData?.title ||
          "Access denied. You don't have permission to access this resource. Please contact your administrator if you believe this is an error.";
        // Don't show toast for 403 - let components handle it gracefully
      }

      const apiErr = new ApiClientError(
        message,
        status,
        errorData?.code || errorData?.type,
        details
      );

      // show typed toast (queued if provider not ready)
      // Skip toast for 403 errors - they should be handled by components with user-friendly messages
      if (status !== 403) {
        try {
          console.debug(
            "[AxiosApiClient] emitting toast error",
            status,
            apiErr.message
          );
          showToastError(status ? `Error ${status}` : "Error", apiErr.message);
        } catch (e) {
          // ignore
        }
      }

      return apiErr;
    } else if (error.request) {
      const netErr = new ApiClientError(
        "No response received from server",
        undefined,
        "NETWORK_ERROR"
      );
      try {
        console.debug(
          "[AxiosApiClient] emitting network toast",
          netErr.message
        );
        showToastError("Network Error", netErr.message);
      } catch (e) {}
      return netErr;
    } else {
      const reqErr = new ApiClientError(
        error.message || "Request setup failed",
        undefined,
        "REQUEST_ERROR"
      );
      try {
        console.debug(
          "[AxiosApiClient] emitting request toast",
          reqErr.message
        );
        showToastError("Request Error", reqErr.message);
      } catch (e) {}
      return reqErr;
    }
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    if (import.meta.env.DEV) {
      const fullUrl = this.client.defaults.baseURL + url;
      console.debug("[AxiosApiClient] GET", url, "→ Full URL:", fullUrl);
    }
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    // #region agent log
    silentAnalyticsLog({
      location: "axios-client.ts:post",
      message: "POST request",
      data: {
        url: url,
        baseURL: this.client.defaults.baseURL,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        headers: config?.headers ? Object.keys(config.headers) : [],
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "B",
    });
    // #endregion
    if (import.meta.env.DEV) {
      const fullUrl = this.client.defaults.baseURL + url;
      console.debug("[AxiosApiClient] POST", url, "→ Full URL:", fullUrl);
    }
    const response = await this.client.post<T>(url, data, config);
    // #region agent log
    silentAnalyticsLog({
      location: "axios-client.ts:post:after",
      message: "POST response",
      data: { status: response.status, url: url },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "B",
    });
    // #endregion
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  onRequest?: (config: any) => any;
  onResponse?: (response: any) => any;
  onError?: (error: any) => any;
}
