import { getApiClient } from "../clients";
import { SALES_ORDERS_ENDPOINTS } from "../constants/endpoints";
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
  private readonly apiClient = getApiClient();

  async getSalesOrders(): Promise<SalesOrderDto[]> {
    return this.apiClient.get<SalesOrderDto[]>(SALES_ORDERS_ENDPOINTS.BASE);
  }

  async getSalesOrderById(id: string): Promise<SalesOrderDto> {
    return this.apiClient.get<SalesOrderDto>(SALES_ORDERS_ENDPOINTS.BY_ID(id));
  }

  async searchSalesOrders(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<SalesOrderDto>> {
    return this.apiClient.get<PaginatedResponse<SalesOrderDto>>(
      SALES_ORDERS_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async createSalesOrder(
    data: CreateUpdateSalesOrderDto
  ): Promise<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(SALES_ORDERS_ENDPOINTS.BASE, data);
  }

  async updateSalesOrder(
    id: string,
    data: CreateUpdateSalesOrderDto
  ): Promise<SalesOrderDto> {
    return this.apiClient.put<SalesOrderDto>(
      SALES_ORDERS_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async deleteSalesOrder(id: string): Promise<void> {
    return this.apiClient.delete<void>(SALES_ORDERS_ENDPOINTS.BY_ID(id));
  }

  async createQuote(data: CreateQuoteDto): Promise<SalesOrderDto> {
    return this.apiClient.post<SalesOrderDto>(
      SALES_ORDERS_ENDPOINTS.QUOTES,
      data
    );
  }

  async confirmQuote(
    id: string,
    data: ConfirmQuoteDto
  ): Promise<ConfirmQuoteResponseDto> {
    return this.apiClient.post<ConfirmQuoteResponseDto>(
      SALES_ORDERS_ENDPOINTS.CONFIRM_QUOTE(id),
      data
    );
  }

  async checkStockAvailability(
    lines: CreateUpdateSalesOrderLineDto[]
  ): Promise<StockAvailabilityCheckDto[]> {
    return this.apiClient.post<StockAvailabilityCheckDto[]>(
      SALES_ORDERS_ENDPOINTS.CHECK_AVAILABILITY,
      lines
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(SALES_ORDERS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(SALES_ORDERS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const salesOrdersService = new SalesOrdersService();
