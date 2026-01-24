import { getApiClient } from "../clients";
import { INVENTORY_TRANSACTIONS_ENDPOINTS } from "../constants/endpoints";
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
      INVENTORY_TRANSACTIONS_ENDPOINTS.BASE
    );
  }

  async getTransactionsPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.PAGINATED,
      {
        params: { page, pageSize },
      }
    );
  }

  async searchTransactions(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<InventoryTransactionDto>> {
    return this.apiClient.get<PaginatedResponse<InventoryTransactionDto>>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async getTransactionById(id: string): Promise<InventoryTransactionDto> {
    return this.apiClient.get<InventoryTransactionDto>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_ID(id)
    );
  }

  async getTransactionsByProduct(
    productId: string
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_PRODUCT(productId)
    );
  }

  async getTransactionsByWarehouse(
    warehouseId: string
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_WAREHOUSE(warehouseId)
    );
  }

  async getTransactionsByType(
    type: TransactionType
  ): Promise<InventoryTransactionDto[]> {
    return this.apiClient.get<InventoryTransactionDto[]>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_TYPE(type)
    );
  }

  async createTransaction(
    data: CreateUpdateInventoryTransactionDto
  ): Promise<InventoryTransactionDto> {
    return this.apiClient.post<InventoryTransactionDto>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BASE,
      data
    );
  }

  async updateTransaction(
    id: string,
    data: CreateUpdateInventoryTransactionDto
  ): Promise<InventoryTransactionDto> {
    return this.apiClient.put<InventoryTransactionDto>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.apiClient.delete<void>(
      INVENTORY_TRANSACTIONS_ENDPOINTS.BY_ID(id)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(INVENTORY_TRANSACTIONS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok)
      throw new Error("Failed to export inventory transactions to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(INVENTORY_TRANSACTIONS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok)
      throw new Error("Failed to export inventory transactions to PDF");
    return response.blob();
  }
}

export const inventoryTransactionsService = new InventoryTransactionsService();
