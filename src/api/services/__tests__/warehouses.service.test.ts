import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WarehouseDto, CreateUpdateWarehouseDto } from "@/types/api.types";

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
const { warehousesService } = await import("@/api/services/warehouses.service");

describe("WarehousesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWarehouses", () => {
    it("should fetch all warehouses", async () => {
      const mockWarehouses: WarehouseDto[] = [
        {
          id: "1",
          name: "Main Warehouse",
          location: "Building A",
          isActive: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
        },
      ];

      mockApiClient.get.mockResolvedValue(mockWarehouses);

      const result = await warehousesService.getWarehouses();

      expect(mockApiClient.get).toHaveBeenCalledWith("/inventory/api/inventory/warehouses");
      expect(result).toEqual(mockWarehouses);
    });
  });

  describe("createWarehouse", () => {
    it("should create a new warehouse", async () => {
      const newWarehouse: CreateUpdateWarehouseDto = {
        name: "New Warehouse",
        location: "Building B",
        address: "123 Main St",
        city: "New York",
        country: "USA",
        isActive: true,
      };

      const mockWarehouse: WarehouseDto = {
        id: "2",
        ...newWarehouse,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.post.mockResolvedValue(mockWarehouse);

      const result = await warehousesService.createWarehouse(newWarehouse);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses",
        newWarehouse
      );
      expect(result).toEqual(mockWarehouse);
    });
  });
});
