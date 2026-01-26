/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ApiClient, type ApiClientConfig, type RequestConfig, ApiClientError } from "./types"
import { showToastError } from '@/contexts/toast.service'

export class DaprHttpClient implements ApiClient {
  private timeout: number
  private defaultHeaders: Record<string, string>
  private authToken: string | null = null
  private daprAppId: string
  private daprPort: number

  constructor(config: ApiClientConfig & { daprAppId?: string; daprPort?: number }) {
    this.timeout = config.timeout || 30000
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    }
    this.daprAppId = config.daprAppId || "auth-service"
    this.daprPort = config.daprPort || 3500
  }

  private getDaprUrl(url: string): string {
    // Dapr HTTP proxy format: http://localhost:<daprPort>/v1.0/invoke/<appId>/method/<method-name>
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url
    return `http://localhost:${this.daprPort}/v1.0/invoke/${this.daprAppId}/method/${cleanUrl}`
  }

  private getHeaders(config?: RequestConfig): Record<string, string> {
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    }

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }

    return headers
  }

  private async request<T>(method: string, url: string, data?: any, config?: RequestConfig): Promise<T> {
    const daprUrl = this.getDaprUrl(url)
    const headers = this.getHeaders(config)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const options: RequestInit = {
        method,
        headers,
        signal: config?.signal || controller.signal,
      }

      if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = JSON.stringify(data)
      }

      // Add query parameters
      let finalUrl = daprUrl
      if (config?.params) {
        const searchParams = new URLSearchParams()
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          finalUrl += `?${queryString}`
        }
      }

      if (this.onRequest) {
        this.onRequest({ url: finalUrl, ...options })
      }

      const response = await fetch(finalUrl, options)
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Check for ASP.NET Core ProblemDetails format
        let message = errorData.message || `HTTP ${response.status}: ${response.statusText}`
        let details = errorData.details

        // Handle ProblemDetails validation errors
        if (errorData?.title || errorData?.errors) {
          message = errorData?.title || errorData?.detail || message
          // Extract validation errors from ProblemDetails.errors
          if (errorData?.errors && typeof errorData.errors === 'object') {
            details = errorData.errors
            // Build a user-friendly message from validation errors
            const validationMessages = Object.entries(errorData.errors)
              ?.map(([field, messages]: [string, any]) => {
                const fieldMessages = Array.isArray(messages) ? messages : [messages]
                return `${field}: ${fieldMessages.join(', ')}`
              })
              .join('; ')
            if (validationMessages) {
              message = validationMessages
            }
          }
        }
        
        throw new ApiClientError(
          message,
          response.status,
          errorData.code || errorData.type,
          details,
        )
      }

      const responseData = await response.json()

      if (this.onResponse) {
        this.onResponse(responseData)
      }

      return responseData as T
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        const timeoutError = new ApiClientError("Request timeout", undefined, "TIMEOUT_ERROR")
        if (this.onError) {
          this.onError(timeoutError)
        }
        try {
          console.debug('[DaprHttpClient] emitting timeout toast', timeoutError.message)
          showToastError('Request timeout', timeoutError.message)
        } catch (e) {}
        throw timeoutError
      }

      if (error instanceof ApiClientError) {
        if (this.onError) {
          this.onError(error)
        }
        try {
          console.debug('[DaprHttpClient] emitting error toast', error.message)
          showToastError('Error', error.message)
        } catch (e) {}
        throw error
      }

      const networkError = new ApiClientError(error.message || "Network request failed", undefined, "NETWORK_ERROR")
      if (this.onError) {
        this.onError(networkError)
      }
      try {
        console.debug('[DaprHttpClient] emitting network toast', networkError.message)
        showToastError('Network Error', networkError.message)
      } catch (e) {}
      throw networkError
    }
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config)
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>("POST", url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>("PUT", url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>("PATCH", url, data, config)
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config)
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  onRequest?: (config: any) => any
  onResponse?: (response: any) => any
  onError?: (error: any) => any
}
