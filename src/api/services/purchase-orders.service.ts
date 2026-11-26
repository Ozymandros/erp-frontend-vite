import { getApiClient } from "../clients";
import { PURCHASE_ORDERS_ENDPOINTS } from "../constants/endpoints";
import type {
  PurchaseOrderDto,
  CreateUpdatePurchaseOrderDto,
  ApprovePurchaseOrderDto,
  ReceivePurchaseOrderDto,
  PurchaseOrderMatchResultDto,
  PaginatedResponse,
  QuerySpec,
  PurchaseOrderStatus,
} from "@/types/api.types";

class PurchaseOrdersService {
  private readonly apiClient = getApiClient();

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
    data: Pick<ApprovePurchaseOrderDto, "notes">
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.APPROVE(id),
      { purchaseOrderId: id, notes: data.notes }
    );
  }

  async receivePurchaseOrder(
    id: string,
    data: Omit<ReceivePurchaseOrderDto, "purchaseOrderId">
  ): Promise<PurchaseOrderDto> {
    return this.apiClient.post<PurchaseOrderDto>(
      PURCHASE_ORDERS_ENDPOINTS.RECEIVE(id),
      { ...data, purchaseOrderId: id }
    );
  }

  async matchPurchaseOrder(id: string): Promise<PurchaseOrderMatchResultDto> {
    return this.apiClient.post<PurchaseOrderMatchResultDto>(
      PURCHASE_ORDERS_ENDPOINTS.MATCH(id),
      {}
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
