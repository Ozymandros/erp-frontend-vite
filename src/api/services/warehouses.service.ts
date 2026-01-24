import { getApiClient } from "../clients";
import { WAREHOUSES_ENDPOINTS } from "../constants/endpoints";
import type {
  WarehouseDto,
  CreateUpdateWarehouseDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class WarehousesService {
  private apiClient = getApiClient();

  async getWarehouses(): Promise<WarehouseDto[]> {
    return this.apiClient.get<WarehouseDto[]>(WAREHOUSES_ENDPOINTS.BASE);
  }

  async getWarehousesPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<WarehouseDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseDto>>(
      WAREHOUSES_ENDPOINTS.PAGINATED,
      {
        params: { page, pageSize },
      }
    );
  }

  async searchWarehouses(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<WarehouseDto>> {
    return this.apiClient.get<PaginatedResponse<WarehouseDto>>(
      WAREHOUSES_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async getWarehouseById(id: string): Promise<WarehouseDto> {
    return this.apiClient.get<WarehouseDto>(WAREHOUSES_ENDPOINTS.BY_ID(id));
  }

  async createWarehouse(data: CreateUpdateWarehouseDto): Promise<WarehouseDto> {
    return this.apiClient.post<WarehouseDto>(WAREHOUSES_ENDPOINTS.BASE, data);
  }

  async updateWarehouse(
    id: string,
    data: CreateUpdateWarehouseDto
  ): Promise<WarehouseDto> {
    return this.apiClient.put<WarehouseDto>(WAREHOUSES_ENDPOINTS.BY_ID(id), data);
  }

  async deleteWarehouse(id: string): Promise<void> {
    return this.apiClient.delete<void>(WAREHOUSES_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(WAREHOUSES_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export warehouses to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(WAREHOUSES_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export warehouses to PDF");
    return response.blob();
  }
}

export const warehousesService = new WarehousesService();
