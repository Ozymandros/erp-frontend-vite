import { getApiClient } from "../clients"
import type {
  WarehouseStockDto,
  StockAvailabilityDto,
} from "@/types/api.types"

class WarehouseStocksService {
  private apiClient = getApiClient()

  async getStockByProductAndWarehouse(productId: string, warehouseId: string): Promise<WarehouseStockDto> {
    return this.apiClient.get<WarehouseStockDto>(`/inventory/api/inventory/warehouse-stocks/${productId}/${warehouseId}`)
  }

  async getStocksByProduct(productId: string): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>(`/inventory/api/inventory/warehouse-stocks/product/${productId}`)
  }

  async getStocksByWarehouse(warehouseId: string): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>(`/inventory/api/inventory/warehouse-stocks/warehouse/${warehouseId}`)
  }

  async getProductAvailability(productId: string): Promise<StockAvailabilityDto> {
    return this.apiClient.get<StockAvailabilityDto>(`/inventory/api/inventory/warehouse-stocks/availability/${productId}`)
  }

  async getLowStocks(): Promise<WarehouseStockDto[]> {
    return this.apiClient.get<WarehouseStockDto[]>("/inventory/api/inventory/warehouse-stocks/low-stock")
  }
}

export const warehouseStocksService = new WarehouseStocksService()
