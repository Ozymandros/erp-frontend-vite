import { getApiClient } from "../clients";
import { STOCK_OPERATIONS_ENDPOINTS } from "../constants/endpoints";
import type {
  ReserveStockDto,
  ReservationDto,
  StockTransferDto,
  StockAdjustmentDto,
} from "@/types/api.types";

class StockOperationsService {
  private apiClient = getApiClient();

  async reserveStock(data: ReserveStockDto): Promise<ReservationDto> {
    return this.apiClient.post<ReservationDto>(
      STOCK_OPERATIONS_ENDPOINTS.RESERVE,
      data
    );
  }

  async releaseReservation(reservationId: string): Promise<void> {
    return this.apiClient.delete<void>(
      STOCK_OPERATIONS_ENDPOINTS.RELEASE_RESERVATION(reservationId)
    );
  }

  async transferStock(data: StockTransferDto): Promise<void> {
    return this.apiClient.post<void>(STOCK_OPERATIONS_ENDPOINTS.TRANSFER, data);
  }

  async adjustStock(data: StockAdjustmentDto): Promise<void> {
    return this.apiClient.post<void>(STOCK_OPERATIONS_ENDPOINTS.ADJUST, data);
  }
}

export const stockOperationsService = new StockOperationsService();

