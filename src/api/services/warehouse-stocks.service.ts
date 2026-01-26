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
    return this.apiClient.get<Blob>(WAREHOUSE_STOCKS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(WAREHOUSE_STOCKS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const warehouseStocksService = new WarehouseStocksService();
