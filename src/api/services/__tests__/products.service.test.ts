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
          quantityInStock: 100,
          reorderLevel: 10,
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

  describe("getProductBySku", () => {
    it("should fetch product by SKU", async () => {
      const mockProduct: ProductDto = {
        id: "1",
        sku: "SKU-001",
        name: "Test Product",
        unitPrice: 99.99,
        quantityInStock: 100,
        reorderLevel: 10,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        createdBy: "user1",
        updatedBy: "user1",
      };

      mockApiClient.get.mockResolvedValue(mockProduct);

      const result = await productsService.getProductBySku("SKU-001");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/sku/SKU-001"
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe("getLowStockProducts", () => {
    it("should fetch low stock products", async () => {
      const mockProducts: ProductDto[] = [
        {
          id: "1",
          sku: "SKU-001",
          name: "Low Stock Product",
          unitPrice: 99.99,
          quantityInStock: 5,
          reorderLevel: 10,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          createdBy: "user1",
          updatedBy: "user1",
        },
      ];

      mockApiClient.get.mockResolvedValue(mockProducts);

      const result = await productsService.getLowStockProducts();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/low-stock"
      );
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
        quantityInStock: 100,
        reorderLevel: 10,
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

  describe("getProductsPaginated", () => {
    it("should fetch products with pagination", async () => {
      const mockResponse: PaginatedResponse<ProductDto> = {
        items: [
          {
            id: "1",
            sku: "SKU-001",
            name: "Test Product",
            unitPrice: 99.99,
            quantityInStock: 100,
            reorderLevel: 10,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
            createdBy: "user1",
            updatedBy: "user1",
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await productsService.getProductsPaginated(1, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should use default page and pageSize when not provided", async () => {
      mockApiClient.get.mockResolvedValue({
        items: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      await productsService.getProductsPaginated();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/paginated",
        { params: { page: 1, pageSize: 10 } }
      );
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
        hasNextPage: false,
        hasPreviousPage: false,
        totalPages: 0,
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
        quantityInStock: 0,
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
        quantityInStock: 100,
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

  describe("exportToXlsx", () => {
    it("should export products to XLSX", async () => {
      const mockBlob = new Blob(["xlsx"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await productsService.exportToXlsx();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/export-xlsx",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe("exportToPdf", () => {
    it("should export products to PDF", async () => {
      const mockBlob = new Blob(["pdf"], { type: "application/pdf" });
      mockApiClient.get.mockResolvedValue(mockBlob);

      const result = await productsService.exportToPdf();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/inventory/api/inventory/products/export-pdf",
        { responseType: "blob" }
      );
      expect(result).toBe(mockBlob);
    });
  });
});
