import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  SupplierDto,
  CreateUpdateSupplierDto,
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

// Import after mocking - services will be instantiated with mocked client
const { suppliersService } = await import("@/api/services/suppliers.service");

describe("SuppliersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSuppliers", () => {
    it("should fetch all suppliers", async () => {
      const mockSuppliers: SupplierDto[] = [
        {
          id: "1",
          name: "Supplier 1",
        } as SupplierDto,
      ];

      mockApiClient.get.mockResolvedValue(mockSuppliers);

      const result = await suppliersService.getSuppliers();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers"
      );
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe("getSupplierById", () => {
    it("should fetch supplier by ID", async () => {
      const mockSupplier: SupplierDto = {
        id: "1",
        name: "Supplier 1",
      } as SupplierDto;

      mockApiClient.get.mockResolvedValue(mockSupplier);

      const result = await suppliersService.getSupplierById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/1"
      );
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("getSupplierByEmail", () => {
    it("should fetch supplier by email", async () => {
      const mockSupplier: SupplierDto = {
        id: "1",
        name: "Supplier 1",
        email: "supplier@example.com",
      } as SupplierDto;

      mockApiClient.get.mockResolvedValue(mockSupplier);

      const result = await suppliersService.getSupplierByEmail(
        "supplier@example.com"
      );

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/email/supplier@example.com"
      );
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("searchSuppliersByName", () => {
    it("should search suppliers by name", async () => {
      const mockSuppliers: SupplierDto[] = [
        {
          id: "1",
          name: "Supplier 1",
        } as SupplierDto,
      ];

      mockApiClient.get.mockResolvedValue(mockSuppliers);

      const result = await suppliersService.searchSuppliersByName("Supplier");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/search/Supplier"
      );
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe("advancedSearchSuppliers", () => {
    it("should advanced search suppliers with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "test",
      };

      const mockResponse: PaginatedResponse<SupplierDto> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await suppliersService.advancedSearchSuppliers(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/advanced-search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createSupplier", () => {
    it("should create a new supplier", async () => {
      const newSupplier: CreateUpdateSupplierDto = {
        name: "New Supplier",
        email: "newsupplier@example.com",
      } as CreateUpdateSupplierDto;

      const mockSupplier: SupplierDto = {
        id: "2",
        ...newSupplier,
      } as SupplierDto;

      mockApiClient.post.mockResolvedValue(mockSupplier);

      const result = await suppliersService.createSupplier(newSupplier);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers",
        newSupplier
      );
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("updateSupplier", () => {
    it("should update an existing supplier", async () => {
      const updateData: CreateUpdateSupplierDto = {
        name: "Updated Supplier",
      } as CreateUpdateSupplierDto;

      const mockSupplier: SupplierDto = {
        id: "1",
        ...updateData,
      } as SupplierDto;

      mockApiClient.put.mockResolvedValue(mockSupplier);

      const result = await suppliersService.updateSupplier("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/1",
        updateData
      );
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("deleteSupplier", () => {
    it("should delete a supplier", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await suppliersService.deleteSupplier("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/purchasing/api/purchasing/suppliers/1"
      );
    });
  });
});
