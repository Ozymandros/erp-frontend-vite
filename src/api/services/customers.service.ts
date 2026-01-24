import { getApiClient } from "../clients";
import { CUSTOMERS_ENDPOINTS } from "../constants/endpoints";
import type {
  CustomerDto,
  CreateUpdateCustomerDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CustomersService {
  private apiClient = getApiClient();

  async getCustomers(): Promise<CustomerDto[]> {
    return this.apiClient.get<CustomerDto[]>(CUSTOMERS_ENDPOINTS.BASE);
  }

  async getCustomerById(id: string): Promise<CustomerDto> {
    return this.apiClient.get<CustomerDto>(CUSTOMERS_ENDPOINTS.BY_ID(id));
  }

  async searchCustomers(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<CustomerDto>> {
    return this.apiClient.get<PaginatedResponse<CustomerDto>>(
      CUSTOMERS_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async createCustomer(data: CreateUpdateCustomerDto): Promise<CustomerDto> {
    return this.apiClient.post<CustomerDto>(CUSTOMERS_ENDPOINTS.BASE, data);
  }

  async updateCustomer(
    id: string,
    data: CreateUpdateCustomerDto
  ): Promise<CustomerDto> {
    return this.apiClient.put<CustomerDto>(
      CUSTOMERS_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.apiClient.delete<void>(CUSTOMERS_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(CUSTOMERS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export customers to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(CUSTOMERS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export customers to PDF");
    return response.blob();
  }
}

export const customersService = new CustomersService();
