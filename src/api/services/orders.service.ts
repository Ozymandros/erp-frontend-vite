import { getApiClient } from "../clients";
import { ORDERS_ENDPOINTS } from "../constants/endpoints";
import type {
  OrderDto,
  CreateUpdateOrderDto,
  CreateOrderWithReservationDto,
  FulfillOrderDto,
  CancelOrderDto,
} from "@/types/api.types";

class OrdersService {
  private apiClient = getApiClient();

  async getOrders(): Promise<OrderDto[]> {
    return this.apiClient.get<OrderDto[]>(ORDERS_ENDPOINTS.BASE);
  }

  async getOrderById(id: string): Promise<OrderDto> {
    return this.apiClient.get<OrderDto>(ORDERS_ENDPOINTS.BY_ID(id));
  }

  async createOrder(data: CreateUpdateOrderDto): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>(ORDERS_ENDPOINTS.BASE, data);
  }

  async updateOrder(id: string, data: CreateUpdateOrderDto): Promise<void> {
    return this.apiClient.put<void>(ORDERS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(ORDERS_ENDPOINTS.BY_ID(id));
  }

  async createOrderWithReservation(
    data: CreateOrderWithReservationDto
  ): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>(
      ORDERS_ENDPOINTS.WITH_RESERVATION,
      data
    );
  }

  async fulfillOrder(data: FulfillOrderDto): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>(ORDERS_ENDPOINTS.FULFILL, data);
  }

  async cancelOrder(data: CancelOrderDto): Promise<void> {
    return this.apiClient.post<void>(ORDERS_ENDPOINTS.CANCEL, data);
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(ORDERS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export orders to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(ORDERS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export orders to PDF");
    return response.blob();
  }
}

export const ordersService = new OrdersService();
