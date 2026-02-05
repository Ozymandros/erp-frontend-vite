import { getApiClient } from "../clients";
import { PERMISSIONS_ENDPOINTS } from "../constants/endpoints";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PaginatedResponse,
  SearchParams,
  QuerySpec,
} from "@/types/api.types";

class PermissionsService {
  private apiClient = getApiClient();

  async getPermissions(): Promise<Permission[]> {
    return this.apiClient.get<Permission[]>(PERMISSIONS_ENDPOINTS.BASE);
  }

  async getPermissionsPaginated(
    params?: SearchParams
  ): Promise<PaginatedResponse<Permission>> {
    return this.apiClient.get<PaginatedResponse<Permission>>(
      PERMISSIONS_ENDPOINTS.PAGINATED,
      { params }
    );
  }

  async searchPermissions(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<Permission>> {
    return this.apiClient.get<PaginatedResponse<Permission>>(
      PERMISSIONS_ENDPOINTS.SEARCH,
      { params: querySpec }
    );
  }

  async getPermissionById(id: string): Promise<Permission> {
    return this.apiClient.get<Permission>(PERMISSIONS_ENDPOINTS.BY_ID(id));
  }

  async getPermissionByModuleAction(
    module: string,
    action: string
  ): Promise<Permission> {
    return this.apiClient.get<Permission>(
      PERMISSIONS_ENDPOINTS.BY_MODULE_ACTION,
      {
        params: { module, action },
      }
    );
  }

  async checkPermission(module: string, action: string): Promise<boolean> {
    return this.apiClient.get<boolean>(PERMISSIONS_ENDPOINTS.CHECK, {
      params: { module, action },
    });
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return this.apiClient.post<Permission>(PERMISSIONS_ENDPOINTS.BASE, data);
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest
  ): Promise<void> {
    return this.apiClient.put<void>(PERMISSIONS_ENDPOINTS.BY_ID(id), data);
  }

  async deletePermission(id: string): Promise<void> {
    return this.apiClient.delete<void>(PERMISSIONS_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(PERMISSIONS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(PERMISSIONS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const permissionsService = new PermissionsService();
