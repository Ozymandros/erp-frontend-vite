import { describe, it, expect, beforeEach, vi } from "vitest"
import axios from "axios"
import { AxiosApiClient } from "../axios-client"

vi.mock("axios")

describe("AxiosApiClient", () => {
  let client: AxiosApiClient
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(axios.create as any).mockReturnValue(mockAxiosInstance)
    client = new AxiosApiClient({
      baseURL: "http://localhost:8080",
    })
  })

  describe("HTTP Methods", () => {
    it("should make GET request", async () => {
      const mockData = { id: 1, name: "Test" }
      mockAxiosInstance.get.mockResolvedValue({ data: mockData })

      const result = await client.get("/test")

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/test", undefined)
      expect(result).toEqual(mockData)
    })

    it("should make POST request", async () => {
      const mockData = { id: 1, name: "Test" }
      const postData = { name: "Test" }
      mockAxiosInstance.post.mockResolvedValue({ data: mockData })

      const result = await client.post("/test", postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/test", postData, undefined)
      expect(result).toEqual(mockData)
    })

    it("should make PUT request", async () => {
      const mockData = { id: 1, name: "Updated" }
      const putData = { name: "Updated" }
      mockAxiosInstance.put.mockResolvedValue({ data: mockData })

      const result = await client.put("/test/1", putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/test/1", putData, undefined)
      expect(result).toEqual(mockData)
    })

    it("should make DELETE request", async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: null })

      await client.delete("/test/1")

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/test/1", undefined)
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
  })

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      const networkError = new Error("Network Error")
      mockAxiosInstance.get.mockRejectedValue(networkError)

      await expect(client.get("/test")).rejects.toThrow()
    })
  })
})
