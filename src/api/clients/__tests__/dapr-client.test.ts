/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest"
import { DaprHttpClient } from "../dapr-client"

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

  describe("HTTP Methods", () => {
    it("should make GET request through Dapr", async () => {
      const mockData = { id: 1, name: "Test" }
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })

      const result = await client.get("/test")

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

    it("should handle network errors", async () => {
      ;(global.fetch as any).mockRejectedValue(new Error("Network Error"))

      await expect(client.get("/test")).rejects.toThrow()
    })
  })
})
