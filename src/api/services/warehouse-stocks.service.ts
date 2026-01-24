import { getApiClient } from "../clients";
import { WAREHOUSE_STOCKS_ENDPOINTS } from "../constants/endpoints";
import type {
  WarehouseStockDto,
  StockAvailabilityDto,
} from "@/types/api.types";

class WarehouseStocksService {
  private apiClient = getApiClient();

  async getStockByProductAndWarehouse(
    productId: string,
    warehouseId: string
  ): Promise<WarehouseStockDto> {
    return this.apiClient.get<WarehouseStockDto>(
      WAREHOUSE_STOCKS_ENDPOINTS.BY_PRODUCT_AND_WAREHOUSE(
        productId,
        warehouseId
      )
    );
  }

  async getStocksByProduct(productId: string): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>(
      WAREHOUSE_STOCKS_ENDPOINTS.BY_PRODUCT(productId)
    );
  }

  async getStocksByWarehouse(
    warehouseId: string
  ): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>(
      WAREHOUSE_STOCKS_ENDPOINTS.BY_WAREHOUSE(warehouseId)
    );
  }

  async getProductAvailability(
    productId: string
  ): Promise<StockAvailabilityDto> {
    return this.apiClient.get<StockAvailabilityDto>(
      WAREHOUSE_STOCKS_ENDPOINTS.AVAILABILITY(productId)
    );
  }

  async getLowStocks(): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>(
      WAREHOUSE_STOCKS_ENDPOINTS.LOW_STOCK
    );
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(WAREHOUSE_STOCKS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export warehouse stocks to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(WAREHOUSE_STOCKS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export warehouse stocks to PDF");
    return response.blob();
  }
}

export const warehouseStocksService = new WarehouseStocksService();
