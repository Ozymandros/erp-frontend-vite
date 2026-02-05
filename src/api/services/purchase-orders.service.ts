import { getApiClient } from "../clients";
import { PURCHASE_ORDERS_ENDPOINTS } from "../constants/endpoints";
import type {
  PurchaseOrderDto,
  CreateUpdatePurchaseOrderDto,
  ApprovePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  PaginatedResponse,
  QuerySpec,
  PurchaseOrderStatus,
} from "@/types/api.types";

class PurchaseOrdersService {
  private apiClient = getApiClient();

  async getPurchaseOrders(): Promise<PurchaseOrderDto[]> {
    return this.apiClient.get<PurchaseOrderDto[]>(PURCHASE_ORDERS_ENDPOINTS.BASE);
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderDto> {
    return this.apiClient.get<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.BY_ID(id)
    );
  }

  async searchPurchaseOrders(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<PurchaseOrderDto>> {
    return this.apiClient.get<PaginatedResponse<PurchaseOrderDto>>(
      PURCHASE_ORDERS_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async getPurchaseOrdersBySupplier(
    supplierId: string
  ): Promise<PurchaseOrderDto[]> {
    return this.apiClient.get<PurchaseOrderDto[]>(
      PURCHASE_ORDERS_ENDPOINTS.BY_SUPPLIER(supplierId)
    );
  }

  async getPurchaseOrdersByStatus(
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrderDto[]> {
    return this.apiClient.get<PurchaseOrderDto[]>(
      PURCHASE_ORDERS_ENDPOINTS.BY_STATUS(status)
    );
  }

  async createPurchaseOrder(
    data: CreateUpdatePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.BASE,
      data
    );
  }

  async updatePurchaseOrder(
    id: string,
    data: CreateUpdatePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.put<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.patch<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.UPDATE_STATUS(id, status)
    );
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(PURCHASE_ORDERS_ENDPOINTS.BY_ID(id));
  }

  async approvePurchaseOrder(
    id: string,
    data: ApprovePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.APPROVE(id),
      data
    );
  }

  async receivePurchaseOrder(
    id: string,
    data: ReceivePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.RECEIVE(id),
      data
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(PURCHASE_ORDERS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(PURCHASE_ORDERS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
