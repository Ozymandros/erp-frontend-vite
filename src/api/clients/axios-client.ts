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
  if (
    import.meta.env.MODE === "test" ||
    import.meta.env.CI ||
    (typeof process !== "undefined" && (process.env.CI || process.env.VITEST))
  ) {
    return;
  }
  // Only log if analytics endpoint is configured via environment variable
  const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  if (analyticsEndpoint) {
    fetch(analyticsEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }
};

export class AxiosApiClient implements ApiClient {
  private readonly client: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      // Ensure 204 responses are treated as success
      validateStatus: (status) => status >= 200 && status < 300,
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
      error => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      response => {
        // Handle 204 No Content responses (common for DELETE operations)
        // Axios may return empty string "" for 204 responses
        if (response.status === 204) {
          // Return response with undefined data to avoid JSON parsing issues
          return { ...response, data: undefined };
        }
        // Also handle empty string responses (some servers return "" for successful DELETE)
        if (response.data === "" || response.data === null || response.data === undefined) {
          return { ...response, data: undefined };
        }
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
      },
    );
  }

  /**
   * Safely shows a toast notification, catching any errors.
   */
  private safeShowToast(title: string, message: string): void {
    try {
      console.debug("[AxiosApiClient] emitting toast", title, message);
      showToastError(title, message);
    } catch {
      // Ignore toast errors - UI component may not be mounted
    }
  }

  /**
   * Creates an ApiClientError and optionally shows a toast notification.
   */
  private createErrorWithToast(
    message: string,
    status: number | undefined,
    code: string | undefined,
    details?: Record<string, unknown>,
    showToast = true,
  ): ApiClientError {
    const apiErr = new ApiClientError(message, status, code, details);
    if (showToast) {
      const title = status ? `Error ${status}` : "Error";
      this.safeShowToast(title, message);
    }
    return apiErr;
  }

  /**
   * Extracts validation messages from ProblemDetails.errors object.
   */
  private extractValidationMessages(errors: Record<string, unknown>): string {
    return Object.entries(errors)
      .map(([field, messages]) => {
        const fieldMessages = Array.isArray(messages) ? messages : [messages];
        return `${field}: ${fieldMessages.join(", ")}`;
      })
      .join("; ");
  }

  /**
   * Parses error data from an API response into a message and details.
   */
  private parseErrorData(
    errorData: any,
    fallbackMessage: string,
  ): { message: string; details?: Record<string, unknown> } {
    let message = errorData?.message || fallbackMessage;
    let details = errorData?.details;

    // Handle ASP.NET Core ProblemDetails format
    const hasProblemDetails = errorData?.title || errorData?.errors;
    if (!hasProblemDetails) {
      return { message, details };
    }

    message = errorData?.title || errorData?.detail || message;

    // Extract validation errors from ProblemDetails.errors
    if (errorData?.errors && typeof errorData.errors === "object") {
      details = errorData.errors;
      const validationMessages = this.extractValidationMessages(errorData.errors);
      if (validationMessages) {
        message = validationMessages;
      }
    }

    return { message, details };
  }

  /**
   * Handles API errors and converts them to ApiClientError with appropriate notifications.
   */
  private handleError(error: AxiosError): ApiClientError {
    // Case 1: No response received (network error)
    if (!error.response && error.request) {
      return this.createErrorWithToast(
        "No response received from server",
        undefined,
        "NETWORK_ERROR",
      );
    }

    // Case 2: Request setup failed
    if (!error.response) {
      return this.createErrorWithToast(
        error.message || "Request setup failed",
        undefined,
        "REQUEST_ERROR",
      );
    }

    // Case 3: Server responded with an error
    const { status, data } = error.response;
    const errorData = data as any;

    const { message, details } = this.parseErrorData(errorData, error.message || "An error occurred");

    // Special handling for 403 Forbidden - use specific message and skip toast
    if (status === 403) {
      const forbiddenMessage =
        errorData?.detail ||
        errorData?.title ||
        "Access denied. You don't have permission to access this resource. Please contact your administrator if you believe this is an error.";
      return this.createErrorWithToast(
        forbiddenMessage,
        status,
        errorData?.code || errorData?.type,
        details,
        false, // Don't show toast for 403
      );
    }

    return this.createErrorWithToast(
      message,
      status,
      errorData?.code || errorData?.type,
      details,
    );
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
    config?: RequestConfig,
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
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    if (import.meta.env.DEV) {
      const fullUrl = this.client.defaults.baseURL + url;
      console.debug("[AxiosApiClient] DELETE", url, "→ Full URL:", fullUrl);
    }
    try {
      const response = await this.client.delete<T>(url, config);
      // Handle 204 No Content and empty responses
      // Axios returns empty string "" for 204 responses
      if (response.status === 204 || !response.data || response.data === "") {
        return undefined as T;
      }
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[AxiosApiClient] DELETE error for", url, error);
      }
      throw error;
    }
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  onRequest?: (config: any) => any;
  onResponse?: (response: any) => any;
  onError?: (error: any) => any;
}
