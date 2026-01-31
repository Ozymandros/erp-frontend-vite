/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type ApiClient,
  type ApiClientConfig,
  type RequestConfig,
  ApiClientError,
} from "./types";
import { showToastError } from "@/contexts/toast.service";

export class DaprHttpClient implements ApiClient {
  private readonly timeout: number;
  private readonly defaultHeaders: Record<string, string>;
  private authToken: string | null = null;
  private readonly daprAppId: string;
  private readonly daprPort: number;

  constructor(
    config: ApiClientConfig & { daprAppId?: string; daprPort?: number },
  ) {
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
    this.daprAppId = config.daprAppId || "auth-service";
    this.daprPort = config.daprPort || 3500;
  }

  private getDaprUrl(url: string): string {
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    return `http://localhost:${this.daprPort}/v1.0/invoke/${this.daprAppId}/method/${cleanUrl}`;
  }

  private getHeaders(config?: RequestConfig): Record<string, string> {
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private buildFinalUrl(url: string, config?: RequestConfig): string {
    const daprUrl = this.getDaprUrl(url);
    if (!config?.params) return daprUrl;

    const searchParams = new URLSearchParams();
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${daprUrl}?${queryString}` : daprUrl;
  }

  private async parseError(response: Response): Promise<ApiClientError> {
    const errorData = await response.json().catch(() => ({}));
    let message =
      errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    let details = errorData.details;

    if (errorData?.title || errorData?.errors) {
      message = errorData?.title || errorData?.detail || message;
      if (errorData?.errors && typeof errorData.errors === "object") {
        details = errorData.errors;
        const validationMessages = Object.entries(errorData.errors)
          ?.map(([field, messages]: [string, any]) => {
            const fieldMessages = Array.isArray(messages)
              ? messages
              : [messages];
            return `${field}: ${fieldMessages.join(", ")}`;
          })
          .join("; ");
        if (validationMessages) message = validationMessages;
      }
    }

    return new ApiClientError(
      message,
      response.status,
      errorData.code || errorData.type,
      details,
    );
  }

  private async handleResponse<T>(
    response: Response,
    config?: RequestConfig,
  ): Promise<T> {
    if (!response.ok) {
      const error = await this.parseError(response);
      throw error;
    }

    if (config?.responseType === "blob") {
      return (await response.blob()) as T;
    }

    if (config?.responseType === "text") {
      return (await response.text()) as T;
    }

    const responseData = await response.json();
    if (this.onResponse) {
      this.onResponse(responseData);
    }
    return responseData as T;
  }

  private handleCatchError(error: any, timeoutId: any): never {
    clearTimeout(timeoutId);

    let apiError: ApiClientError;
    if (error.name === "AbortError") {
      apiError = new ApiClientError(
        "Request timeout",
        undefined,
        "TIMEOUT_ERROR",
      );
      showToastError("Request timeout", apiError.message);
    } else if (error instanceof ApiClientError) {
      apiError = error;
      showToastError("Error", apiError.message);
    } else {
      apiError = new ApiClientError(
        error.message || "Network request failed",
        undefined,
        "NETWORK_ERROR",
      );
      showToastError("Network Error", apiError.message);
    }

    if (this.onError) {
      this.onError(apiError);
    }
    throw apiError;
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    const finalUrl = this.buildFinalUrl(url, config);
    const headers = this.getHeaders(config);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const options: RequestInit = {
        method,
        headers,
        signal: config?.signal || controller.signal,
      };

      if (
        data &&
        (method === "POST" || method === "PUT" || method === "PATCH")
      ) {
        options.body = JSON.stringify(data);
      }

      if (this.onRequest) {
        this.onRequest({ url: finalUrl, ...options });
      }

      const response = await fetch(finalUrl, options);
      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response, config);
    } catch (error: any) {
      return this.handleCatchError(error, timeoutId);
    }
  }


  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("POST", url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("PUT", url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>("PATCH", url, data, config);
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  onRequest?: (config: any) => any;
  onResponse?: (response: any) => any;
  onError?: (error: any) => any;
}
