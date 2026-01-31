import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  WarehouseDto,
  CreateUpdateWarehouseDto,
  PaginatedResponse,
  QuerySpec,
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

const baseMockWarehouse: WarehouseDto = {
  id: "1",
  name: "Main Warehouse",
  location: "Building A",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  createdBy: "user1",
  updatedBy: "user1",
};

// Import after mocking - services will be instantiated with mocked client
const { warehousesService } = await import("@/api/services/warehouses.service");

describe("WarehousesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWarehouses", () => {
    it("should fetch all warehouses", async () => {
      const mockWarehouses: WarehouseDto[] = [baseMockWarehouse];
      mockApiClient.get.mockResolvedValue(mockWarehouses);

      const result = await warehousesService.getWarehouses();

      expect(mockApiClient.get).toHaveBeenCalledWith("/inventory/api/inventory/warehouses");
      expect(result).toEqual(mockWarehouses);
    });
  });

  describe("getWarehousesPaginated", () => {
    it("should fetch warehouses with pagination", async () => {
      const mockResponse: PaginatedResponse<WarehouseDto> = {
        items: [baseMockWarehouse],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await warehousesService.getWarehousesPaginated(1, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use default page and pageSize when not provided", async () => {
      mockApiClient.get.mockResolvedValue({ items: [], page: 1, pageSize: 10, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false });

      await warehousesService.getWarehousesPaginated();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
    });
  });

  describe("searchWarehouses", () => {
    it("should search warehouses with query spec", async () => {
      const querySpec: QuerySpec = { page: 1, pageSize: 20, searchTerm: "Main" };
      const mockResponse: PaginatedResponse<WarehouseDto> = {
        items: [baseMockWarehouse],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await warehousesService.searchWarehouses(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getWarehouseById", () => {
    it("should fetch warehouse by ID", async () => {
      mockApiClient.get.mockResolvedValue(baseMockWarehouse);

      const result = await warehousesService.getWarehouseById("wh-1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/inventory/api/inventory/warehouses/wh-1");
      expect(result).toEqual(baseMockWarehouse);
    });
  });

  describe("createWarehouse", () => {
    it("should create a new warehouse", async () => {
      const newWarehouse: CreateUpdateWarehouseDto = {
        name: "New Warehouse",
        location: "Building B",
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

  describe("updateWarehouse", () => {
    it("should update a warehouse", async () => {
      const updateData: CreateUpdateWarehouseDto = {
        name: "Updated Warehouse",
        location: "Building C",
      };
      const updatedWarehouse: WarehouseDto = { ...baseMockWarehouse, ...updateData };
      mockApiClient.put.mockResolvedValue(updatedWarehouse);

      const result = await warehousesService.updateWarehouse("wh-1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/wh-1",
        updateData
      );
      expect(result).toEqual(updatedWarehouse);
    });
  });

  describe("deleteWarehouse", () => {
    it("should delete a warehouse", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await warehousesService.deleteWarehouse("wh-1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/wh-1"
      );
    });
  });

  describe("exportToXlsx", () => {
    it("should export warehouses to XLSX", async () => {
      const mockBlob = new Blob(["xlsx"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await warehousesService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export warehouses to PDF", async () => {
      const mockBlob = new Blob(["pdf"], { type: "application/pdf" });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await warehousesService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/warehouses/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });
});
