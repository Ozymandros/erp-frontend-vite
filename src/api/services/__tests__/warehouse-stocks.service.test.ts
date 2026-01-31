import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  WarehouseStockDto,
  StockAvailabilityDto,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { warehouseStocksService } = await import(
  "@/api/services/warehouse-stocks.service"
);

describe("WarehouseStocksService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStockByProductAndWarehouse", () => {
    it("should fetch stock by product and warehouse", async () => {
      const mockStock: WarehouseStockDto = {
        productId: "prod1",
        warehouseId: "wh1",
        quantity: 100,
      } as WarehouseStockDto;

      mockApiClient.get.mockResolvedValue(mockStock);

      const result =
        await warehouseStocksService.getStockByProductAndWarehouse(
          "prod1",
          "wh1"
        );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/prod1/wh1"
      );
      expect(result).toEqual(mockStock);
    });
  });

  describe("getStocksByProduct", () => {
    it("should fetch stocks by product ID", async () => {
      const mockStocks: WarehouseStockDto[] = [
        {
          productId: "prod1",
          warehouseId: "wh1",
          quantity: 100,
        } as WarehouseStockDto,
      ];

      mockApiClient.get.mockResolvedValue(mockStocks);

      const result = await warehouseStocksService.getStocksByProduct("prod1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/product/prod1"
      );
      expect(result).toEqual(mockStocks);
    });
  });

  describe("getStocksByWarehouse", () => {
    it("should fetch stocks by warehouse ID", async () => {
      const mockStocks: WarehouseStockDto[] = [
        {
          productId: "prod1",
          warehouseId: "wh1",
          quantity: 100,
        } as WarehouseStockDto,
      ];

      mockApiClient.get.mockResolvedValue(mockStocks);

      const result = await warehouseStocksService.getStocksByWarehouse("wh1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/warehouse/wh1"
      );
      expect(result).toEqual(mockStocks);
    });
  });

  describe("getProductAvailability", () => {
    it("should fetch product availability", async () => {
      const mockAvailability: StockAvailabilityDto = {
        productId: "prod1",
        totalAvailable: 150,
        warehouseStocks: [],
      };

      mockApiClient.get.mockResolvedValue(mockAvailability);

      const result = await warehouseStocksService.getProductAvailability(
        "prod1"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/availability/prod1"
      );
      expect(result).toEqual(mockAvailability);
    });
  });

  describe("getLowStocks", () => {
    it("should fetch low stock items", async () => {
      const mockStocks: WarehouseStockDto[] = [
        {
          productId: "prod1",
          warehouseId: "wh1",
          quantity: 5,
        } as WarehouseStockDto,
      ];

      mockApiClient.get.mockResolvedValue(mockStocks);

      const result = await warehouseStocksService.getLowStocks();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/low-stock"
      );
      expect(result).toEqual(mockStocks);
    });
  });

  describe("exportToXlsx", () => {
    it("should export warehouse stocks to XLSX", async () => {
      const mockBlob = new Blob(["xlsx"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await warehouseStocksService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export warehouse stocks to PDF", async () => {
      const mockBlob = new Blob(["pdf"], { type: "application/pdf" });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await warehouseStocksService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouse-stocks/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });
});
