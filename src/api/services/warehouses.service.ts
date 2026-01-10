import { getApiClient } from "../clients"
import type {
  WarehouseDto,
  CreateUpdateWarehouseDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types"

class WarehousesService {
  private apiClient = getApiClient()

  async getWarehouses(): Promise<WarehouseDto[]> {
    return this.apiClient.get<WarehouseDto[]>("/inventory/api/inventory/warehouses")
  }

  async getWarehousesPaginated(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<WarehouseDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseDto>>("/inventory/api/inventory/warehouses/paginated", {
      params: { page, pageSize }
    })
  }

  async searchWarehouses(querySpec: QuerySpec): Promise<PaginatedResponse<WarehouseDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseDto>>("/inventory/api/inventory/warehouses/search", {
      params: querySpec
    })
  }

  async getWarehouseById(id: string): Promise<WarehouseDto> {
    return this.apiClient.get<WarehouseDto>(`/inventory/api/inventory/warehouses/${id}`)
  }

  async createWarehouse(data: CreateUpdateWarehouseDto): Promise<WarehouseDto> {
    return this.apiClient.post<WarehouseDto>("/inventory/api/inventory/warehouses", data)
  }

  async updateWarehouse(id: string, data: CreateUpdateWarehouseDto): Promise<WarehouseDto> {
    return this.apiClient.put<WarehouseDto>(`/inventory/api/inventory/warehouses/${id}`, data)
  }

  async deleteWarehouse(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/inventory/api/inventory/warehouses/${id}`)
  }
}

export const warehousesService = new WarehousesService()
