import { getApiClient } from "../clients";
import type {
  SalesOrderDto,
  CreateUpdateSalesOrderDto,
  CreateQuoteDto,
  ConfirmQuoteDto,
  ConfirmQuoteResponseDto,
  StockAvailabilityCheckDto,
  CreateUpdateSalesOrderLineDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class SalesOrdersService {
  private apiClient = getApiClient();

  async getSalesOrders(): Promise<SalesOrderDto[]> {
    return this.apiClient.get<SalesOrderDto[]>("/sales/api/sales/orders");
  }

  async getSalesOrderById(id: string): Promise<SalesOrderDto> {
    return this.apiClient.get<SalesOrderDto>(`/sales/api/sales/orders/${id}`);
  }

  async searchSalesOrders(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<SalesOrderDto>> {
    return this.apiClient.get<PaginatedResponse<SalesOrderDto>>(
      "/sales/api/sales/orders/search",
      {
        params: querySpec,
      }
    );
  }

  async createSalesOrder(
    data: CreateUpdateSalesOrderDto
  ): Promise<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>("/sales/api/sales/orders", data);
  }

  async updateSalesOrder(
    id: string,
    data: CreateUpdateSalesOrderDto
  ): Promise<SalesOrderDto> {
    return this.apiClient.put<SalesOrderDto>(
      `/sales/api/sales/orders/${id}`,
      data
    );
  }

  async deleteSalesOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(`/sales/api/sales/orders/${id}`);
  }

  async createQuote(data: CreateQuoteDto): Promise<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(
      "/sales/api/sales/orders/quotes",
      data
    );
  }

  async confirmQuote(
    id: string,
    data: ConfirmQuoteDto
  ): Promise<ConfirmQuoteResponseDto> {
    return this.apiClient.post<ConfirmQuoteResponseDto>(
      `/sales/api/sales/orders/quotes/${id}/confirm`,
      data
    );
  }

  async checkStockAvailability(
    lines: CreateUpdateSalesOrderLineDto[]
  ): Promise<StockAvailabilityCheckDto[]> {
    return this.apiClient.post<StockAvailabilityCheckDto[]>(
      "/sales/api/sales/orders/quotes/check-availability",
      lines
    );
  }
}

export const salesOrdersService = new SalesOrdersService();
