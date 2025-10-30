import type { ApiClient } from "./types"
import { AxiosApiClient } from "./axios-client"
import { DaprHttpClient } from "./dapr-client"
// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
const USE_DAPR = (import.meta.env.VITE_USE_DAPR ?? "").toLowerCase() === "true"
const DAPR_APP_ID = import.meta.env.VITE_DAPR_APP_ID || "auth-service"
const DAPR_PORT = Number.parseInt(import.meta.env.VITE_DAPR_PORT || "3500", 10)

// Factory function to create the appropriate API client
export function createApiClient(): ApiClient {
  if (USE_DAPR) {
    console.log("[API Client] Using Dapr HTTP Proxy")
    return new DaprHttpClient({
      baseURL: API_BASE_URL,
      daprAppId: DAPR_APP_ID,
      daprPort: DAPR_PORT,
    })
  } else {
    console.log("[API Client] Using Axios")
    return new AxiosApiClient({
      baseURL: API_BASE_URL,
    })
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = createApiClient()
  }
  return apiClientInstance
}

// Reset function for testing
export function resetApiClient(): void {
  apiClientInstance = null
}

export * from "./types"
