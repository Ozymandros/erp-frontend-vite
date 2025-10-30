import { describe, it, expect, beforeEach, vi } from "vitest"
import { usersService } from "@/api/services/users.service"
import { rolesService } from "@/api/services/roles.service"
import { permissionsService } from "@/api/services/permissions.service"
import * as apiClients from "@/api/clients"

vi.mock("@/api/clients")

describe("API Services Integration", () => {
  const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    setAuthToken: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiClients.getApiClient as any).mockReturnValue(mockApiClient)
  })

  describe("UsersService", () => {
    it("should fetch users with pagination", async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await usersService.getUsers({ page: 1, pageSize: 10 })

      expect(mockApiClient.get).toHaveBeenCalledWith("/users", {
        params: { page: 1, pageSize: 10 },
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

      expect(mockApiClient.post).toHaveBeenCalledWith("/users", newUser)
      expect(result).toEqual(mockResponse)
    })
  })

  describe("RolesService", () => {
    it("should fetch roles", async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await rolesService.getRoles()

      expect(mockApiClient.get).toHaveBeenCalledWith("/roles", { params: undefined })
      expect(result).toEqual(mockResponse)
    })
  })

  describe("PermissionsService", () => {
    it("should fetch permissions", async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      }
      mockApiClient.get.mockResolvedValue(mockResponse)

      const result = await permissionsService.getPermissions()

      expect(mockApiClient.get).toHaveBeenCalledWith("/permissions", { params: undefined })
      expect(result).toEqual(mockResponse)
    })
  })
})
