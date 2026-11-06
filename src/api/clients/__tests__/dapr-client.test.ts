/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { DaprHttpClient } from "../dapr-client"
import { ApiClientError } from "../types"

vi.mock("@/contexts/toast.service", () => ({
  showToastError: vi.fn(),
}))

// Mock fetch
global.fetch = vi.fn()

describe("DaprHttpClient", () => {
  let client: DaprHttpClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new DaprHttpClient({
      baseURL: "http://localhost:8080",
      daprAppId: "test-service",
      daprPort: 3500,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("HTTP Methods", () => {
    it("should make GET request through Dapr", async () => {
      const mockData = { id: 1, name: "Test" }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const result = await client.get("test")

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3500/v1.0/invoke/test-service/method/test",
        expect.objectContaining({
          method: "GET",
        }),
      )
      expect(result).toEqual(mockData)
    })

    it("should make POST request through Dapr", async () => {
      const mockData = { id: 1, name: "Test" }
      const postData = { name: "Test" }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const result = await client.post("/test", postData)

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3500/v1.0/invoke/test-service/method/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postData),
        }),
      )
      expect(result).toEqual(mockData)
    })

    it("should append query params for GET", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true }),
      })
      await client.get("/items", { params: { page: 2, tag: null, q: undefined, name: "a b" } })
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
        expect.objectContaining({ method: "GET" }),
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("name=a+b"),
        expect.anything(),
      )
    })

    it("should return blob when responseType is blob", async () => {
      const blob = new Blob(["x"], { type: "text/plain" })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn(),
        blob: async () => blob,
      })
      const out = await client.get("/file", { responseType: "blob" })
      expect(out).toBe(blob)
    })

    it("should return text when responseType is text", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn(),
        text: async () => "plain",
      })
      const out = await client.get("/raw", { responseType: "text" })
      expect(out).toBe("plain")
    })

    it("should make PUT, PATCH, and DELETE requests", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      await client.put("/u", { a: 1 })
      await client.patch("/p", { b: 2 })
      await client.delete("/d")
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PUT", body: JSON.stringify({ a: 1 }) }),
      )
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "PATCH", body: JSON.stringify({ b: 2 }) }),
      )
      expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: "DELETE" }),
      )
    })
  })

  describe("Authentication", () => {
    it("should include auth token in headers", async () => {
      const mockData = { id: 1 }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      client.setAuthToken("test-token")
      await client.get("/test")

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      )
    })
  })

  describe("Error Handling", () => {
    it("should handle HTTP errors", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "Resource not found" }),
      })

      await expect(client.get("/test")).rejects.toThrow("Resource not found")
    })

    it("should parse validation-style error bodies", async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({
          title: "Validation failed",
          errors: { name: ["required"], code: "bad" },
        }),
      })
      await expect(client.get("/bad")).rejects.toThrow(/name: required/)
    })

    it("should handle network errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network Error"))

      await expect(client.get("/test")).rejects.toThrow()
    })

    it("should map non-Error rejections to network ApiClientError", async () => {
      ;(global.fetch as any).mockRejectedValue({})
      await expect(client.get("/weird")).rejects.toThrow(ApiClientError)
    })

    it("should map AbortError from fetch to timeout ApiClientError", async () => {
      const abortErr = new Error("Aborted")
      abortErr.name = "AbortError"
      ;(global.fetch as any).mockRejectedValue(abortErr)
      await expect(client.get("/x")).rejects.toMatchObject({
        code: "TIMEOUT_ERROR",
        message: "Request timeout",
      })
    })

    it("should call onError when fetch rejects with ApiClientError", async () => {
      const onError = vi.fn()
      client.onError = onError
      const apiErr = new ApiClientError("nope")
      ;(global.fetch as any).mockRejectedValue(apiErr)
      await expect(client.get("/x")).rejects.toThrow(ApiClientError)
      expect(onError).toHaveBeenCalledWith(apiErr)
    })
  })

  describe("hooks and defaults", () => {
    it("calls onRequest and onResponse for successful JSON", async () => {
      const onRequest = vi.fn()
      const onResponse = vi.fn()
      client.onRequest = onRequest
      client.onResponse = onResponse
      const data = { id: 1 }
      ;(global.fetch as any).mockResolvedValue({ ok: true, json: async () => data })
      const out = await client.post("/p", { a: 1 })
      expect(out).toEqual(data)
      expect(onRequest).toHaveBeenCalled()
      expect(onResponse).toHaveBeenCalledWith(data)
    })

    it("uses default dapr app id and port when omitted", async () => {
      const defaults = new DaprHttpClient({ baseURL: "http://localhost:8080" })
      ;(global.fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) })
      await defaults.get("/path")
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3500/v1.0/invoke/auth-service/method/path",
        expect.anything(),
      )
    })
  })
})
