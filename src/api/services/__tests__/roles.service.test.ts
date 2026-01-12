import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  SearchParams,
  QuerySpec,
  User,
  Permission,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { rolesService } = await import("@/api/services/roles.service");

describe("RolesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRoles", () => {
    it("should fetch all roles", async () => {
      const mockRoles: Role[] = [
        {
          id: "1",
          name: "admin",
        } as Role,
      ];

      mockApiClient.get.mockResolvedValue(mockRoles);

      const result = await rolesService.getRoles();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/roles");
      expect(result).toEqual(mockRoles);
    });
  });

  describe("getRolesPaginated", () => {
    it("should fetch paginated roles", async () => {
      const params: SearchParams = {
        page: 1,
        pageSize: 10,
      };

      const mockResponse: PaginatedResponse<Role> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await rolesService.getRolesPaginated(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/roles/paginated",
        { params }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("searchRoles", () => {
    it("should search roles with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "admin",
      };

      const mockResponse: PaginatedResponse<Role> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await rolesService.searchRoles(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/roles/search", {
        params: querySpec,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getRoleById", () => {
    it("should fetch role by ID", async () => {
      const mockRole: Role = {
        id: "1",
        name: "admin",
      } as Role;

      mockApiClient.get.mockResolvedValue(mockRole);

      const result = await rolesService.getRoleById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/roles/1");
      expect(result).toEqual(mockRole);
    });
  });

  describe("getRoleByName", () => {
    it("should fetch role by name", async () => {
      const mockRole: Role = {
        id: "1",
        name: "admin",
      } as Role;

      mockApiClient.get.mockResolvedValue(mockRole);

      const result = await rolesService.getRoleByName("admin");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/roles/name/admin"
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe("createRole", () => {
    it("should create a new role", async () => {
      const newRole: CreateRoleRequest = {
        name: "editor",
        description: "Editor role",
      };

      const mockRole: Role = {
        id: "2",
        ...newRole,
      } as Role;

      mockApiClient.post.mockResolvedValue(mockRole);

      const result = await rolesService.createRole(newRole);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/roles",
        newRole
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe("updateRole", () => {
    it("should update an existing role", async () => {
      const updateData: UpdateRoleRequest = {
        name: "updated-admin",
        description: "Updated description",
      };

      mockApiClient.put.mockResolvedValue(undefined);

      await rolesService.updateRole("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/auth/api/roles/1",
        updateData
      );
    });
  });

  describe("deleteRole", () => {
    it("should delete a role", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await rolesService.deleteRole("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/auth/api/roles/1");
    });
  });

  describe("getUsersInRole", () => {
    it("should get users in a role", async () => {
      const mockUsers: User[] = [
        {
          id: "1",
          email: "user@example.com",
        } as User,
      ];

      mockApiClient.get.mockResolvedValue(mockUsers);

      const result = await rolesService.getUsersInRole("admin");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/roles/admin/users"
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe("addPermissionToRole", () => {
    it("should add permission to a role", async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await rolesService.addPermissionToRole("1", "perm1");

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/api/roles/1/permissions", {
        permissionId: "perm1",
      });
    });
  });

  describe("removePermissionFromRole", () => {
    it("should remove permission from a role", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await rolesService.removePermissionFromRole("1", "perm1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/auth/api/roles/1/permissions/perm1"
      );
    });
  });

  describe("getRolePermissions", () => {
    it("should get permissions for a role", async () => {
      const mockPermissions: Permission[] = [
        {
          id: "1",
          module: "users",
          action: "create",
        } as Permission,
      ];

      mockApiClient.get.mockResolvedValue(mockPermissions);

      const result = await rolesService.getRolePermissions("1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/roles/1/permissions"
      );
      expect(result).toEqual(mockPermissions);
    });
  });
});
