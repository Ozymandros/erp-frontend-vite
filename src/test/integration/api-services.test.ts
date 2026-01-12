/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest"

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  setAuthToken: vi.fn(),
}

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}))

// Import after mocking - services will be instantiated with mocked client
const { usersService } = await import("@/api/services/users.service")
const { rolesService } = await import("@/api/services/roles.service")
const { permissionsService } = await import("@/api/services/permissions.service")

describe("API Services Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("UsersService", () => {
    it("should fetch users with pagination", async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        hasNext: false,
        hasPrevious: false,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await usersService.searchUsers({ page: 1, pageSize: 10, searchTerm: "" })

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/search", {
        params: { page: 1, pageSize: 10, searchTerm: "" },
      })
      expect(result).toEqual(mockResponse)
    })

    it("should create a new user", async () => {
      const newUser = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      }
      const mockResponse = { id: "user-1", ...newUser, isActive: true, roles: [] }
      mockApiClient.post.mockResolvedValue(mockResponse)

      const result = await usersService.createUser(newUser)

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/api/users/create", newUser)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("RolesService", () => {
    it("should fetch roles", async () => {
      const mockResponse: any[] = []
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await rolesService.getRoles()

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/roles")
      expect(result).toEqual(mockResponse)
    })
  })

  describe("PermissionsService", () => {
    it("should fetch permissions", async () => {
      const mockResponse: any[] = []
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await permissionsService.getPermissions()

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/permissions")
      expect(result).toEqual(mockResponse)
    })
  })
})
