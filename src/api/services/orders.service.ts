import { getApiClient } from "../clients";
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
    return this.apiClient.get<OrderDto[]>("/orders/api/orders");
  }

  async getOrderById(id: string): Promise<OrderDto> {
    return this.apiClient.get<OrderDto>(`/orders/api/orders/${id}`);
  }

  async createOrder(data: CreateUpdateOrderDto): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>("/orders/api/orders", data);
  }

  async updateOrder(id: string, data: CreateUpdateOrderDto): Promise<void> {
    return this.apiClient.put<void>(`/orders/api/orders/${id}`, data);
  }

  async deleteOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/orders/api/orders/${id}`);
  }

  async createOrderWithReservation(
    data: CreateOrderWithReservationDto
  ): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>(
      "/orders/api/orders/with-reservation",
      data
    );
  }

  async fulfillOrder(data: FulfillOrderDto): Promise<OrderDto> {
    return this.apiClient.post<OrderDto>("/orders/api/orders/fulfill", data);
  }

  async cancelOrder(data: CancelOrderDto): Promise<void> {
    return this.apiClient.post<void>("/orders/api/orders/cancel", data);
  }
}

export const ordersService = new OrdersService();
