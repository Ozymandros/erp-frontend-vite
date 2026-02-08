import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  ReserveStockDto,
  ReservationDto,
  StockTransferDto,
  StockAdjustmentDto,
} from "@/types/api.types";
import { AdjustmentType } from "@/types/api.types";

const mockApiClient = {
  post: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { stockOperationsService } = await import("@/api/services/stock-operations.service");

describe("StockOperationsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("reserveStock", () => {
    it("should reserve stock", async () => {
      const reserveData: ReserveStockDto = {
        productId: "product-1",
        warehouseId: "warehouse-1",
        quantity: 10,
        orderId: "order-1",
        expiresAt: "2024-12-31",
      };

      const mockReservation: ReservationDto = {
        id: "reservation-1",
        productId: reserveData.productId,
        warehouseId: reserveData.warehouseId,
        quantity: reserveData.quantity,
        orderId: reserveData.orderId,
        reservedAt: "2024-01-01",
        expiresAt: reserveData.expiresAt!,
      };

      mockApiClient.post.mockResolvedValue(mockReservation);

      const result = await stockOperationsService.reserveStock(reserveData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/stock-operations/reserve",
        reserveData
      );
      expect(result).toEqual(mockReservation);
    });
  });

  describe("releaseReservation", () => {
    it("should release a reservation", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await stockOperationsService.releaseReservation("reservation-1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/inventory/api/inventory/stock-operations/reservations/reservation-1"
      );
    });
  });

  describe("transferStock", () => {
    it("should transfer stock between warehouses", async () => {
      const transferData: StockTransferDto = {
        productId: "product-1",
        fromWarehouseId: "warehouse-1",
        toWarehouseId: "warehouse-2",
        quantity: 10,
        reason: "Stock redistribution",
      };

      mockApiClient.post.mockResolvedValue(undefined);

      await stockOperationsService.transferStock(transferData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/stock-operations/transfer",
        transferData
      );
    });
  });

  describe("adjustStock", () => {
    it("should adjust stock", async () => {
      const adjustmentData: StockAdjustmentDto = {
        productId: "product-1",
        warehouseId: "warehouse-1",
        quantity: 5,
        reason: "Found during inventory",
        adjustmentType: AdjustmentType.Found,
      };

      mockApiClient.post.mockResolvedValue(undefined);

      await stockOperationsService.adjustStock(adjustmentData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/stock-operations/adjust",
        adjustmentData
      );
    });
  });
});
