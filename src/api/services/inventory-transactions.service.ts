import { getApiClient } from "../clients";
import type {
  InventoryTransactionDto,
  CreateUpdateInventoryTransactionDto,
  PaginatedResponse,
  QuerySpec,
  TransactionType,
} from "@/types/api.types";

class InventoryTransactionsService {
  private apiClient = getApiClient();

  async getTransactions(): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      "/inventory/api/inventory/transactions"
    );
  }

  async getTransactionsPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(
      "/inventory/api/inventory/transactions/paginated",
      {
        params: { page, pageSize },
      }
    );
  }

  async searchTransactions(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(
      "/inventory/api/inventory/transactions/search",
      {
        params: querySpec,
      }
    );
  }

  async getTransactionById(id: string): Promise<InventoryTransactionDto> {
    return this.apiClient.get<InventoryTransactionDto>(
      `/inventory/api/inventory/transactions/${id}`
    );
  }

  async getTransactionsByProduct(
    productId: string
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      `/inventory/api/inventory/transactions/product/${productId}`
    );
  }

  async getTransactionsByWarehouse(
    warehouseId: string
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      `/inventory/api/inventory/transactions/warehouse/${warehouseId}`
    );
  }

  async getTransactionsByType(
    type: TransactionType
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      `/inventory/api/inventory/transactions/type/${type}`
    );
  }

  async createTransaction(
    data: CreateUpdateInventoryTransactionDto
  ): Promise<InventoryTransactionDto> {
    return this.apiClient.post<InventoryTransactionDto>(
      "/inventory/api/inventory/transactions",
      data
    );
  }

  async updateTransaction(
    id: string,
    data: CreateUpdateInventoryTransactionDto
  ): Promise<InventoryTransactionDto> {
    return this.apiClient.put<InventoryTransactionDto>(
      `/inventory/api/inventory/transactions/${id}`,
      data
    );
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.apiClient.delete<void>(
      `/inventory/api/inventory/transactions/${id}`
    );
  }
}

export const inventoryTransactionsService = new InventoryTransactionsService();
