import { getApiClient } from "../clients";
import { ROLES_ENDPOINTS } from "../constants/endpoints";
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

class RolesService {
  private apiClient = getApiClient();

  async getRoles(): Promise<Role[]> {
    return this.apiClient.get<Role[]>(ROLES_ENDPOINTS.BASE);
  }

  async getRolesPaginated(
    params?: SearchParams
  ): Promise<PaginatedResponse<Role>> {
    return this.apiClient.get<PaginatedResponse<Role>>(
      ROLES_ENDPOINTS.PAGINATED,
      { params }
    );
  }

  async searchRoles(querySpec: QuerySpec): Promise<PaginatedResponse<Role>> {
    return this.apiClient.get<PaginatedResponse<Role>>(ROLES_ENDPOINTS.SEARCH, {
      params: querySpec,
    });
  }

  async getRoleById(id: string): Promise<Role> {
    return this.apiClient.get<Role>(ROLES_ENDPOINTS.BY_ID(id));
  }

  async getRoleByName(name: string): Promise<Role> {
    return this.apiClient.get<Role>(ROLES_ENDPOINTS.BY_NAME(name));
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.apiClient.post<Role>(ROLES_ENDPOINTS.BASE, data);
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<void> {
    return this.apiClient.put<void>(ROLES_ENDPOINTS.BY_ID(id), data);
  }

  async deleteRole(id: string): Promise<void> {
    return this.apiClient.delete<void>(ROLES_ENDPOINTS.BY_ID(id));
  }

  async getUsersInRole(name: string): Promise<User[]> {
    return this.apiClient.get<User[]>(ROLES_ENDPOINTS.USERS_IN_ROLE(name));
  }

  async addPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    return this.apiClient.post<void>(ROLES_ENDPOINTS.ADD_PERMISSION(roleId), {
      permissionId,
    });
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    return this.apiClient.delete<void>(
      ROLES_ENDPOINTS.REMOVE_PERMISSION(roleId, permissionId)
    );
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.apiClient.get<Permission[]>(
      ROLES_ENDPOINTS.PERMISSIONS(roleId)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(ROLES_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export roles to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(ROLES_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export roles to PDF");
    return response.blob();
  }
}

export const rolesService = new RolesService();
