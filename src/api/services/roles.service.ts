import { getApiClient } from "../clients"
import type { Role, CreateRoleRequest, UpdateRoleRequest, PaginatedResponse, SearchParams } from "@/types/api.types"

class RolesService {
  private apiClient = getApiClient()

  async getRoles(): Promise<Role[]> {
    return this.apiClient.get<Role[]>("/roles")
  }

  async getRolesPaginated(params?: SearchParams): Promise<PaginatedResponse<Role>> {
    return this.apiClient.get<PaginatedResponse<Role>>("/roles/paginated", { params })
  }

  async getRoleById(id: string): Promise<Role> {
    return this.apiClient.get<Role>(`/roles/${id}`)
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return this.apiClient.post<Role>("/roles", data)
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return this.apiClient.put<Role>(`/roles/${id}`, data)
  }

  async deleteRole(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/roles/${id}`)
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<Role> {
    return this.apiClient.post<Role>(`/roles/${roleId}/permissions`, { permissionIds })
  }
}

export const rolesService = new RolesService()
