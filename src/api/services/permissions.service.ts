import { getApiClient } from "../clients"
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  PaginatedResponse,
  SearchParams,
} from "@/types/api.types"

class PermissionsService {
  private apiClient = getApiClient()

  async getPermissions(): Promise<Permission[]> {
    return this.apiClient.get<Permission[]>("/permissions")
  }

  async getPermissionsPaginated(params?: SearchParams): Promise<PaginatedResponse<Permission>> {
    return this.apiClient.get<PaginatedResponse<Permission>>("/permissions/paginated", { params })
  }

  async getPermissionById(id: string): Promise<Permission> {
    return this.apiClient.get<Permission>(`/permissions/${id}`)
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return this.apiClient.post<Permission>("/permissions", data)
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<Permission> {
    return this.apiClient.put<Permission>(`/permissions/${id}`, data)
  }

  async deletePermission(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/permissions/${id}`)
  }
}

export const permissionsService = new PermissionsService()
