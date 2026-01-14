import { getApiClient } from "../clients";
import type {
  CustomerDto,
  CreateUpdateCustomerDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CustomersService {
  private apiClient = getApiClient();

  async getCustomers(): Promise<CustomerDto[]> {
    return this.apiClient.get<CustomerDto[]>("/sales/api/sales/customers");
  }

  async getCustomerById(id: string): Promise<CustomerDto> {
    return this.apiClient.get<CustomerDto>(`/sales/api/sales/customers/${id}`);
  }

  async searchCustomers(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<CustomerDto>> {
    return this.apiClient.get<PaginatedResponse<CustomerDto>>(
      "/sales/api/sales/customers/search",
      {
        params: querySpec,
      }
    );
  }

  async createCustomer(data: CreateUpdateCustomerDto): Promise<CustomerDto> {
    return this.apiClient.post<CustomerDto>("/sales/api/sales/customers", data);
  }

  async updateCustomer(
    id: string,
    data: CreateUpdateCustomerDto
  ): Promise<CustomerDto> {
    return this.apiClient.put<CustomerDto>(
      `/sales/api/sales/customers/${id}`,
      data
    );
  }

  async deleteCustomer(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/sales/api/sales/customers/${id}`);
  }
}

export const customersService = new CustomersService();
