import { getApiClient } from "../clients";
import { CUSTOMERS_ENDPOINTS } from "../constants/endpoints";
import type {
  CustomerDto,
  CreateUpdateCustomerDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CustomersService {
  private readonly apiClient = getApiClient();

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
    return this.apiClient.get<Blob>(CUSTOMERS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(CUSTOMERS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const customersService = new CustomersService();
