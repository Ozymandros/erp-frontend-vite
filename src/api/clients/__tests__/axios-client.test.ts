/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import axios from "axios"
import { AxiosApiClient } from "../axios-client"
import { ApiClientError } from "../types"

vi.mock("axios")
vi.mock("@/contexts/toast.service", () => ({
  showToastError: vi.fn(),
}))

// Store interceptor callbacks so we can run them in the mock (axios mock bypasses real interceptor chain)
let requestFulfilled: ((config: any) => any) | null = null
let responseFulfilled: ((response: any) => any) | null = null
let responseRejected: ((error: any) => any) | null = null

const adapterGet = vi.fn()
const adapterPost = vi.fn()
const adapterPut = vi.fn()
const adapterPatch = vi.fn()
const adapterDelete = vi.fn()

function wrapWithInterceptors(
  adapter: ReturnType<typeof vi.fn>,
  method: string
): ReturnType<typeof vi.fn> {
  return vi.fn(async (url: string, dataOrConfig?: any, config?: any) => {
    const isGetOrDelete = method === "get" || method === "delete"
    const reqConfig: any = {
      url,
      method,
      headers: (isGetOrDelete ? dataOrConfig?.headers : config?.headers) || {},
    }
    if (requestFulfilled) {
      const r = requestFulfilled(reqConfig)
      Object.assign(reqConfig, r)
    }
    try {
      const args = isGetOrDelete ? [url, dataOrConfig] : [url, dataOrConfig, config]
      const res = await (adapter as (...a: unknown[]) => Promise<unknown>)(...args)
      return responseFulfilled ? responseFulfilled(res) : res
    } catch (err: any) {
      if (responseRejected) await responseRejected(err)
      throw err
    }
  })
}

describe("AxiosApiClient", () => {
  let client: AxiosApiClient
  const mockAxiosInstance = {
    get: wrapWithInterceptors(adapterGet, "get"),
    post: wrapWithInterceptors(adapterPost, "post"),
    put: wrapWithInterceptors(adapterPut, "put"),
    patch: wrapWithInterceptors(adapterPatch, "patch"),
    delete: wrapWithInterceptors(adapterDelete, "delete"),
    interceptors: {
      request: {
        use: vi.fn((fulfilled: any) => {
          requestFulfilled = fulfilled
          return 0
        }),
      },
      response: {
        use: vi.fn((fulfilled: any, rejected: any) => {
          responseFulfilled = fulfilled
          responseRejected = rejected
          return 0
        }),
      },
    },
    defaults: { baseURL: "http://localhost:8080" },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "debug").mockImplementation(() => {})
    requestFulfilled = null
    responseFulfilled = null
    responseRejected = null
    ;(axios.create as any).mockReturnValue(mockAxiosInstance)
    client = new AxiosApiClient({
      baseURL: "http://localhost:8080",
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("HTTP Methods", () => {
    it("should make GET request", async () => {
      const mockData = { id: 1, name: "Test" }
      adapterGet.mockResolvedValue({ data: mockData })

      const result = await client.get("/test")

      expect(adapterGet).toHaveBeenCalledWith("/test", undefined)
      expect(result).toEqual(mockData)
    })

    it("should make GET request with config", async () => {
      const mockData = { id: 1 }
      adapterGet.mockResolvedValue({ data: mockData })

      const result = await client.get("/test", { params: { q: "x" } })

      expect(adapterGet).toHaveBeenCalledWith("/test", { params: { q: "x" } })
      expect(result).toEqual(mockData)
    })

    it("should make POST request", async () => {
      const mockData = { id: 1, name: "Test" }
      const postData = { name: "Test" }
      adapterPost.mockResolvedValue({ data: mockData })

      const result = await client.post("/test", postData)

      expect(adapterPost).toHaveBeenCalledWith("/test", postData, undefined)
      expect(result).toEqual(mockData)
    })

    it("should make PUT request", async () => {
      const mockData = { id: 1, name: "Updated" }
      const putData = { name: "Updated" }
      adapterPut.mockResolvedValue({ data: mockData })

      const result = await client.put("/test/1", putData)

      expect(adapterPut).toHaveBeenCalledWith("/test/1", putData, undefined)
      expect(result).toEqual(mockData)
    })

    it("should make PATCH request", async () => {
      const mockData = { id: 1, status: "partial" }
      adapterPatch.mockResolvedValue({ data: mockData })

      const result = await client.patch("/test/1", { status: "partial" })

      expect(adapterPatch).toHaveBeenCalledWith("/test/1", { status: "partial" }, undefined)
      expect(result).toEqual(mockData)
    })

    it("should make DELETE request", async () => {
      adapterDelete.mockResolvedValue({ data: null })

      await client.delete("/test/1")

      expect(adapterDelete).toHaveBeenCalledWith("/test/1", undefined)
    })
  })

  describe("Authentication", () => {
    it("should set auth token", () => {
      client.setAuthToken("test-token")
      expect(client["authToken"]).toBe("test-token")
    })

    it("should clear auth token", () => {
      client.setAuthToken("test-token")
      client.setAuthToken(null)
      expect(client["authToken"]).toBeNull()
    })

    it("should add Authorization header when token is set", async () => {
      client.setAuthToken("my-bearer-token")
      adapterGet.mockResolvedValue({ data: {} })

      await client.get("/test")

      expect(adapterGet).toHaveBeenCalled()
      const config = requestFulfilled
        ? requestFulfilled({ url: "/test", method: "get", headers: {} as any })
        : null
      expect(config?.headers?.Authorization).toBe("Bearer my-bearer-token")
    })
  })

  describe("Error Handling", () => {
    it("should handle network errors (no response)", async () => {
      const networkError = { request: {}, message: "Network Error" }
      adapterGet.mockRejectedValue(networkError)

      const err = await client.get("/test").catch((e) => e)

      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.code).toBe("NETWORK_ERROR")
      expect(err.message).toBe("No response received from server")
    })

    it("should handle request setup errors", async () => {
      const setupError = { message: "Request setup failed" }
      adapterGet.mockRejectedValue(setupError)

      const err = await client.get("/test").catch((e) => e)

      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.code).toBe("REQUEST_ERROR")
      expect(err.message).toBe("Request setup failed")
    })

    it("should handle 4xx/5xx with response and ProblemDetails", async () => {
      const axiosError = {
        response: {
          status: 400,
          data: {
            title: "Bad Request",
            detail: "Invalid input",
            errors: { name: ["Name is required"], email: ["Invalid email"] },
          },
        },
        message: "Request failed",
      }
      adapterGet.mockRejectedValue(axiosError)

      const err = await client.get("/test").catch((e) => e)

      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.statusCode).toBe(400)
      expect(err.message).toContain("name")
      expect(err.message).toContain("email")
      expect(err.details).toEqual({ name: ["Name is required"], email: ["Invalid email"] })
    })

    it("should handle 403 without showing toast (component handles)", async () => {
      const axiosError = {
        response: {
          status: 403,
          data: {
            title: "Forbidden",
            detail: "Access denied",
          },
        },
        message: "Forbidden",
      }
      adapterGet.mockRejectedValue(axiosError)

      const err = await client.get("/test").catch((e) => e)

      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.statusCode).toBe(403)
      expect(err.message).toBe("Access denied")
    })

    it("should handle 500 with simple message", async () => {
      const axiosError = {
        response: {
          status: 500,
          data: { message: "Internal server error" },
        },
        message: "Request failed",
      }
      adapterGet.mockRejectedValue(axiosError)

      const err = await client.get("/test").catch((e) => e)

      expect(err).toBeInstanceOf(ApiClientError)
      expect(err.statusCode).toBe(500)
      expect(err.message).toBe("Internal server error")
    })

    it("should use error.message when response has no message", async () => {
      const axiosError = {
        response: { status: 404, data: {} },
        message: "Not Found",
      }
      adapterGet.mockRejectedValue(axiosError)

      const err = await client.get("/test").catch((e) => e)

      expect(err.message).toBe("Not Found")
      expect(err.statusCode).toBe(404)
    })
  })

  describe("Interceptors", () => {
    it("should call onRequest when provided", async () => {
      const extraConfig = { headers: { "X-Custom": "value" } }
      client.onRequest = vi.fn((cfg: any) => ({ ...cfg, ...extraConfig }))
      adapterGet.mockResolvedValue({ data: {} })

      await client.get("/test")

      expect(client.onRequest).toHaveBeenCalled()
    })

    it("should call onResponse when provided", async () => {
      client.onResponse = vi.fn((r) => r)
      adapterGet.mockResolvedValue({ data: { ok: true } })

      const result = await client.get("/test")

      expect(client.onResponse).toHaveBeenCalled()
      expect(result).toEqual({ ok: true })
    })

    it("should call onError when provided and request fails", async () => {
      client.onError = vi.fn((e) => e)
      adapterGet.mockRejectedValue({
        response: { status: 500, data: { message: "Server error" } },
        message: "Error",
      })

      const err = await client.get("/test").catch((e) => e)
      expect(err).toBeInstanceOf(ApiClientError)
      expect(client.onError).toHaveBeenCalled()
    })
  })

  describe("Constructor", () => {
    it("should pass timeout and headers from config", () => {
      const createSpy = axios.create as ReturnType<typeof vi.fn>
      createSpy.mockClear()
      new AxiosApiClient({
        baseURL: "https://api.example.com",
        timeout: 5000,
        headers: { "X-Custom": "Header" },
      })

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://api.example.com",
          timeout: 5000,
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Custom": "Header",
          }),
        })
      )
    })
  })
})
