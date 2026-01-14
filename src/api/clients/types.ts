/* eslint-disable @typescript-eslint/no-explicit-any */
// API Client Interface - abstraction for different HTTP clients

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  signal?: AbortSignal
}

export interface ApiClient {
  // HTTP Methods
  get<T = any>(url: string, config?: RequestConfig): Promise<T>
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T>
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>

  // Token Management
  setAuthToken(token: string | null): void

  // Interceptors
  onRequest?(config: any): any
  onResponse?(response: any): any
  onError?(error: any): any
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}
