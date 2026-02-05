import { getApiClient } from "../clients";
import { SUPPLIERS_ENDPOINTS } from "../constants/endpoints";
import type {
  SupplierDto,
  CreateUpdateSupplierDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class SuppliersService {
  private apiClient = getApiClient();

  async getSuppliers(): Promise<SupplierDto[]> {
    return this.apiClient.get<SupplierDto[]>(SUPPLIERS_ENDPOINTS.BASE);
  }

  async getSupplierById(id: string): Promise<SupplierDto> {
    return this.apiClient.get<SupplierDto>(SUPPLIERS_ENDPOINTS.BY_ID(id));
  }

  async getSupplierByEmail(email: string): Promise<SupplierDto> {
    return this.apiClient.get<SupplierDto>(SUPPLIERS_ENDPOINTS.BY_EMAIL(email));
  }

  async searchSuppliersByName(name: string): Promise<SupplierDto[]> {
    return this.apiClient.get<SupplierDto[]>(
      SUPPLIERS_ENDPOINTS.SEARCH_BY_NAME(name)
    );
  }

  async advancedSearchSuppliers(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<SupplierDto>> {
    return this.apiClient.get<PaginatedResponse<SupplierDto>>(
      SUPPLIERS_ENDPOINTS.ADVANCED_SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async createSupplier(data: CreateUpdateSupplierDto): Promise<SupplierDto> {
    return this.apiClient.post<SupplierDto>(SUPPLIERS_ENDPOINTS.BASE, data);
  }

  async updateSupplier(
    id: string,
    data: CreateUpdateSupplierDto
  ): Promise<SupplierDto> {
    return this.apiClient.put<SupplierDto>(SUPPLIERS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteSupplier(id: string): Promise<void> {
    return this.apiClient.delete<void>(SUPPLIERS_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(SUPPLIERS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(SUPPLIERS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const suppliersService = new SuppliersService();
