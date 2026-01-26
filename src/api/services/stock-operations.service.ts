import { getApiClient } from "../clients";
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
      "/inventory/api/inventory/stock-operations/reserve",
      data
    );
  }

  async releaseReservation(reservationId: string): Promise<void> {
    return this.apiClient.delete<void>(
      `/inventory/api/inventory/stock-operations/reservations/${reservationId}`
    );
  }

  async transferStock(data: StockTransferDto): Promise<void> {
    return this.apiClient.post<void>(
      "/inventory/api/inventory/stock-operations/transfer",
      data
    );
  }

  async adjustStock(data: StockAdjustmentDto): Promise<void> {
    return this.apiClient.post<void>(
      "/inventory/api/inventory/stock-operations/adjust",
      data
    );
  }
}

export const stockOperationsService = new StockOperationsService();
