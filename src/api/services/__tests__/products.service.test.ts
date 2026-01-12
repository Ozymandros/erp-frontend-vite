import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProductDto, CreateUpdateProductDto, PaginatedResponse, QuerySpec } from "@/types/api.types";

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
const { productsService } = await import("@/api/services/products.service");

describe("ProductsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProducts", () => {
    it("should fetch all products", async () => {
      const mockProducts: ProductDto[] = [
        {
          id: "1",
          sku: "SKU-001",
          name: "Test Product",
          unitPrice: 99.99,
          reorderLevel: 10,
          isActive: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
        },
      ];

      mockApiClient.get.mockResolvedValue(mockProducts);

      const result = await productsService.getProducts();

      expect(mockApiClient.get).toHaveBeenCalledWith("/inventory/api/inventory/products");
      expect(result).toEqual(mockProducts);
    });
  });

  describe("getProductById", () => {
    it("should fetch product by ID", async () => {
      const mockProduct: ProductDto = {
        id: "1",
        sku: "SKU-001",
        name: "Test Product",
        unitPrice: 99.99,
        reorderLevel: 10,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.get.mockResolvedValue(mockProduct);

      const result = await productsService.getProductById("1");

      expect(mockApiClient.get).toHaveBeenCalledWith("/inventory/api/inventory/products/1");
      expect(result).toEqual(mockProduct);
    });
  });

  describe("searchProducts", () => {
    it("should search products with query spec", async () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        searchTerm: "test",
      };

      const mockResponse: PaginatedResponse<ProductDto> = {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        hasNext: false,
        hasPrevious: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await productsService.searchProducts(querySpec);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/search",
        { params: querySpec }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const newProduct: CreateUpdateProductDto = {
        sku: "SKU-002",
        name: "New Product",
        unitPrice: 149.99,
        reorderLevel: 15,
      };

      const mockProduct: ProductDto = {
        id: "2",
        ...newProduct,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.post.mockResolvedValue(mockProduct);

      const result = await productsService.createProduct(newProduct);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/inventory/api/inventory/products",
        newProduct
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const updateData: CreateUpdateProductDto = {
        sku: "SKU-001-UPDATED",
        name: "Updated Product",
        unitPrice: 199.99,
        reorderLevel: 20,
      };

      const mockProduct: ProductDto = {
        id: "1",
        ...updateData,
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.put.mockResolvedValue(mockProduct);

      const result = await productsService.updateProduct("1", updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/1",
        updateData
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await productsService.deleteProduct("1");

      expect(mockApiClient.delete).toHaveBeenCalledWith("/inventory/api/inventory/products/1");
    });
  });
});
