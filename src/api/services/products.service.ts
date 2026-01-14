import { getApiClient } from "../clients";
import type {
  ProductDto,
  CreateUpdateProductDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class ProductsService {
  private apiClient = getApiClient();

  async getProducts(): Promise<ProductDto[]> {
    return this.apiClient.get<ProductDto[]>(
      "/inventory/api/inventory/products"
    );
  }

  async getProductsPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(
      "/inventory/api/inventory/products/paginated",
      {
        params: { page, pageSize },
      }
    );
  }

  async searchProducts(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(
      "/inventory/api/inventory/products/search",
      {
        params: querySpec,
      }
    );
  }

  async getProductById(id: string): Promise<ProductDto> {
    return this.apiClient.get<ProductDto>(
      `/inventory/api/inventory/products/${id}`
    );
  }

  async getProductBySku(sku: string): Promise<ProductDto> {
    return this.apiClient.get<ProductDto>(
      `/inventory/api/inventory/products/sku/${sku}`
    );
  }

  async getLowStockProducts(): Promise<ProductDto[]> {
    return this.apiClient.get<ProductDto[]>(
      "/inventory/api/inventory/products/low-stock"
    );
  }

  async createProduct(data: CreateUpdateProductDto): Promise<ProductDto> {
    return this.apiClient.post<ProductDto>(
      "/inventory/api/inventory/products",
      data
    );
  }

  async updateProduct(
    id: string,
    data: CreateUpdateProductDto
  ): Promise<ProductDto> {
    return this.apiClient.put<ProductDto>(
      `/inventory/api/inventory/products/${id}`,
      data
    );
  }

  async deleteProduct(id: string): Promise<void> {
    return this.apiClient.delete<void>(
      `/inventory/api/inventory/products/${id}`
    );
  }
}

export const productsService = new ProductsService();
