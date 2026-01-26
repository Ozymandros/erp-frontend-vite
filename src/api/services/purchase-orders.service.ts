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
    return this.apiClient.get<PurchaseOrderDto[]>(
      "/purchasing/api/purchasing/orders"
    );
  }

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderDto> {
    return this.apiClient.get<PurchaseOrderDto>(
      `/purchasing/api/purchasing/orders/${id}`
    );
  }

  async searchPurchaseOrders(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<PurchaseOrderDto>> {
    return this.apiClient.get<PaginatedResponse<PurchaseOrderDto>>(
      "/purchasing/api/purchasing/orders/search",
      {
        params: querySpec,
      }
    );
  }

  async getPurchaseOrdersBySupplier(
    supplierId: string
  ): Promise<PurchaseOrderDto[]> {
    return this.apiClient.get<PurchaseOrderDto[]>(
      `/purchasing/api/purchasing/orders/supplier/${supplierId}`
    );
  }

  async getPurchaseOrdersByStatus(
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrderDto[]> {
    return this.apiClient.get<PurchaseOrderDto[]>(
      `/purchasing/api/purchasing/orders/status/${status}`
    );
  }

  async createPurchaseOrder(
    data: CreateUpdatePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      "/purchasing/api/purchasing/orders",
      data
    );
  }

  async updatePurchaseOrder(
    id: string,
    data: CreateUpdatePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.put<PurchaseOrderDto>(
      `/purchasing/api/purchasing/orders/${id}`,
      data
    );
  }

  async updatePurchaseOrderStatus(
    id: string,
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.patch<PurchaseOrderDto>(
      `/purchasing/api/purchasing/orders/${id}/status/${status}`
    );
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(
      `/purchasing/api/purchasing/orders/${id}`
    );
  }

  async approvePurchaseOrder(
    id: string,
    data: ApprovePurchaseOrderDto
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      `/purchasing/api/purchasing/orders/${id}/approve`,
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
