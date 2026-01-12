import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PaginatedResponse,
  SearchParams,
  QuerySpec,
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
const { permissionsService } = await import("@/api/services/permissions.service");

describe("PermissionsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPermissions", () => {
    it("should fetch all permissions", async () => {
      const mockPermissions: Permission[] = [
        {
          id: "1",
          module: "users",
          action: "create",
        } as Permission,
      ];

      mockApiClient.get.mockResolvedValue(mockPermissions);

      const result = await permissionsService.getPermissions();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/permissions");
      expect(result).toEqual(mockPermissions);
    });
  });

  describe("getPermissionsPaginated", () => {
    it("should fetch paginated permissions", async () => {
      const params: SearchParams = {
        page: 1,
        pageSize: 10,
      };

      const mockResponse: PaginatedResponse<Permission> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPages: 0,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await permissionsService.getPermissionsPaginated(params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/permissions/paginated",
        { params }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should fetch paginated permissions without params", async () => {
      const mockResponse: PaginatedResponse<Permission> = {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPages: 0,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await permissionsService.getPermissionsPaginated();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/permissions/paginated",
        { params: undefined }
      );
    });
  });

  describe("searchPermissions", () => {
    it("should search permissions with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "users",
      };

      const mockResponse: PaginatedResponse<Permission> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalPages: 0,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await permissionsService.searchPermissions(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/permissions/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPermissionById", () => {
    it("should fetch permission by ID", async () => {
      const mockPermission: Permission = {
        id: "1",
        module: "users",
        action: "create",
      } as Permission;

      mockApiClient.get.mockResolvedValue(mockPermission);

      const result = await permissionsService.getPermissionById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/permissions/1");
      expect(result).toEqual(mockPermission);
    });
  });

  describe("getPermissionByModuleAction", () => {
    it("should fetch permission by module and action", async () => {
      const mockPermission: Permission = {
        id: "1",
        module: "users",
        action: "create",
      } as Permission;

      mockApiClient.get.mockResolvedValue(mockPermission);

      const result = await permissionsService.getPermissionByModuleAction(
        "users",
        "create"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/permissions/module-action",
        { params: { module: "users", action: "create" } }
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe("checkPermission", () => {
    it("should check permission and return boolean", async () => {
      mockApiClient.get.mockResolvedValue(true);

      const result = await permissionsService.checkPermission("users", "create");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/auth/api/permissions/check",
        { params: { module: "users", action: "create" } }
      );
      expect(result).toBe(true);
    });
  });

  describe("createPermission", () => {
    it("should create a new permission", async () => {
      const newPermission: CreatePermissionRequest = {
        module: "products",
        action: "read",
        description: "Read products",
      };

      const mockPermission: Permission = {
        id: "2",
        ...newPermission,
      } as Permission;

      mockApiClient.post.mockResolvedValue(mockPermission);

      const result = await permissionsService.createPermission(newPermission);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/permissions",
        newPermission
      );
      expect(result).toEqual(mockPermission);
    });
  });

  describe("updatePermission", () => {
    it("should update an existing permission", async () => {
      const updateData: UpdatePermissionRequest = {
        module: "products",
        action: "update",
        description: "Updated description",
      };

      mockApiClient.put.mockResolvedValue(undefined);

      await permissionsService.updatePermission("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/auth/api/permissions/1",
        updateData
      );
    });
  });

  describe("deletePermission", () => {
    it("should delete a permission", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await permissionsService.deletePermission("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/auth/api/permissions/1");
    });
  });
});
