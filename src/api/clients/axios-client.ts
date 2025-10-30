import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { type ApiClient, type ApiClientConfig, type RequestConfig, ApiClientError } from "./types"

export class AxiosApiClient implements ApiClient {
  private client: AxiosInstance
  private authToken: string | null = null

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`
        }
        if (this.onRequest) {
          return this.onRequest(config)
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (this.onResponse) {
          return this.onResponse(response)
        }
        return response
      },
      (error: AxiosError) => {
        const apiError = this.handleError(error)
        if (this.onError) {
          this.onError(apiError)
        }
        return Promise.reject(apiError)
      },
    )
  }

  private handleError(error: AxiosError): ApiClientError {
    if (error.response) {
      const { status, data } = error.response
      const errorData = data as any

      return new ApiClientError(
        errorData?.message || error.message || "An error occurred",
        status,
        errorData?.code,
        errorData?.details,
      )
    } else if (error.request) {
      return new ApiClientError("No response received from server", undefined, "NETWORK_ERROR")
    } else {
      return new ApiClientError(error.message || "Request setup failed", undefined, "REQUEST_ERROR")
    }
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  onRequest?: (config: any) => any
  onResponse?: (response: any) => any
  onError?: (error: any) => any
}
