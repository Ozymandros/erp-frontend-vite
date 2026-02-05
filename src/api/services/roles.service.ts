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
    // According to spec: POST /auth/api/roles/{roleId}/permissions?permissionId={permissionId}
    return this.apiClient.post<void>(
      `${ROLES_ENDPOINTS.ADD_PERMISSION(roleId)}?permissionId=${permissionId}`,
      undefined
    );
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<void> {
    // DELETE /auth/api/roles/{roleId}/permissions/{permissionId}
    const endpoint = ROLES_ENDPOINTS.REMOVE_PERMISSION(roleId, permissionId);
    if (import.meta.env.DEV) {
      console.debug("[RolesService] Removing permission:", { roleId, permissionId, endpoint });
    }
    return this.apiClient.delete<void>(endpoint);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.apiClient.get<Permission[]>(
      ROLES_ENDPOINTS.PERMISSIONS(roleId)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(ROLES_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(ROLES_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const rolesService = new RolesService();
