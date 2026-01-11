import type { ApiClient } from "./types"
import { AxiosApiClient } from "./axios-client"
import { DaprHttpClient } from "./dapr-client"

/**
 * Environment configuration
 * 
 * Note: VITE_API_BASE_URL should NOT include /api suffix.
 * All endpoints in src/api/constants/endpoints.ts already include
 * the full gateway path (e.g., /auth/api/, /inventory/api/inventory/).
 * 
 * Examples:
 * - Gateway mode: VITE_API_BASE_URL=http://localhost:5000
 * - Direct service: VITE_API_BASE_URL=http://localhost:8080
 */
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"

// Remove trailing slash if present
API_BASE_URL = API_BASE_URL.replace(/\/$/, "")

// Remove /api suffix if accidentally included to prevent double /api in URLs
if (API_BASE_URL.endsWith("/api")) {
  API_BASE_URL = API_BASE_URL.slice(0, -4)
  console.warn(
    "[API Client] Removed /api suffix from VITE_API_BASE_URL. " +
    "The base URL should not include /api as endpoints already have full gateway paths."
  )
}

// Debug logging in development
if (import.meta.env.DEV) {
  console.log("[API Client] Base URL configured:", API_BASE_URL)
  console.log("[API Client] VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL || "(not set, using default)")
}
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
