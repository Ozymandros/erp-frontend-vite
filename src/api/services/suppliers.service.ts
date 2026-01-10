import { getApiClient } from "../clients"
import type {
  SupplierDto,
  CreateUpdateSupplierDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types"

class SuppliersService {
  private apiClient = getApiClient()

  async getSuppliers(): Promise<SupplierDto[]> {
    return this.apiClient.get<SupplierDto[]>("/purchasing/api/purchasing/suppliers")
  }

  async getSupplierById(id: string): Promise<SupplierDto> {
    return this.apiClient.get<SupplierDto>(`/purchasing/api/purchasing/suppliers/${id}`)
  }

  async getSupplierByEmail(email: string): Promise<SupplierDto> {
    return this.apiClient.get<SupplierDto>(`/purchasing/api/purchasing/suppliers/email/${email}`)
  }

  async searchSuppliersByName(name: string): Promise<SupplierDto[]> {
    return this.apiClient.get<SupplierDto[]>(`/purchasing/api/purchasing/suppliers/search/${name}`)
  }

  async advancedSearchSuppliers(querySpec: QuerySpec): Promise<PaginatedResponse<SupplierDto>> {
    return this.apiClient.get<PaginatedResponse<SupplierDto>>("/purchasing/api/purchasing/suppliers/advanced-search", {
      params: querySpec
    })
  }

  async createSupplier(data: CreateUpdateSupplierDto): Promise<SupplierDto> {
    return this.apiClient.post<SupplierDto>("/purchasing/api/purchasing/suppliers", data)
  }

  async updateSupplier(id: string, data: CreateUpdateSupplierDto): Promise<SupplierDto> {
    return this.apiClient.put<SupplierDto>(`/purchasing/api/purchasing/suppliers/${id}`, data)
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/purchasing/api/purchasing/suppliers/${id}`)
  }
}

export const suppliersService = new SuppliersService()
