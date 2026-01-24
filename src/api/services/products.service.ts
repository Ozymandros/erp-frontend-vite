import { getApiClient } from "../clients";
import { PRODUCTS_ENDPOINTS } from "../constants/endpoints";
import type {
  ProductDto,
  CreateUpdateProductDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class ProductsService {
  private apiClient = getApiClient();

  async getProducts(): Promise<ProductDto[]> {
    return this.apiClient.get<ProductDto[]>(PRODUCTS_ENDPOINTS.BASE);
  }

  async getProductsPaginated(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(
      PRODUCTS_ENDPOINTS.PAGINATED,
      {
        params: { page, pageSize },
      }
    );
  }

  async searchProducts(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<ProductDto>> {
    return this.apiClient.get<PaginatedResponse<ProductDto>>(
      PRODUCTS_ENDPOINTS.SEARCH,
      {
        params: querySpec,
      }
    );
  }

  async getProductById(id: string): Promise<ProductDto> {
    return this.apiClient.get<ProductDto>(PRODUCTS_ENDPOINTS.BY_ID(id));
  }

  async getProductBySku(sku: string): Promise<ProductDto> {
    return this.apiClient.get<ProductDto>(PRODUCTS_ENDPOINTS.BY_SKU(sku));
  }

  async getLowStockProducts(): Promise<ProductDto[]> {
    return this.apiClient.get<ProductDto[]>(PRODUCTS_ENDPOINTS.LOW_STOCK);
  }

  async createProduct(data: CreateUpdateProductDto): Promise<ProductDto> {
    return this.apiClient.post<ProductDto>(PRODUCTS_ENDPOINTS.BASE, data);
  }

  async updateProduct(
    id: string,
    data: CreateUpdateProductDto
  ): Promise<ProductDto> {
    return this.apiClient.put<ProductDto>(PRODUCTS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.apiClient.delete<void>(PRODUCTS_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    const response = await fetch(PRODUCTS_ENDPOINTS.EXPORT_XLSX, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export products to XLSX");
    return response.blob();
  }

  async exportToPdf(): Promise<Blob> {
    const response = await fetch(PRODUCTS_ENDPOINTS.EXPORT_PDF, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!response.ok) throw new Error("Failed to export products to PDF");
    return response.blob();
  }
}

export const productsService = new ProductsService();
