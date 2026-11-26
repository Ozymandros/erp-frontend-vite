import { getApiClient } from "../clients";
import { PROJECT_RESOURCES_ENDPOINTS } from "../constants/endpoints";
import type {
  CreateUpdateResourceDto,
  PaginatedResponse,
  QuerySpec,
  ResourceDto,
} from "@/types/api.types";

class ProjectResourcesService {
  private readonly apiClient = getApiClient();

  async searchResources(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<ResourceDto>> {
    return this.apiClient.get<PaginatedResponse<ResourceDto>>(
      PROJECT_RESOURCES_ENDPOINTS.BASE,
      { params: querySpec }
    );
  }

  async getResourceById(id: string): Promise<ResourceDto> {
    return this.apiClient.get<ResourceDto>(PROJECT_RESOURCES_ENDPOINTS.BY_ID(id));
  }

  async createResource(data: CreateUpdateResourceDto): Promise<ResourceDto> {
    return this.apiClient.post<ResourceDto>(
      PROJECT_RESOURCES_ENDPOINTS.BASE,
      data
    );
  }

  async updateResource(
    id: string,
    data: CreateUpdateResourceDto
  ): Promise<ResourceDto> {
    return this.apiClient.put<ResourceDto>(
      PROJECT_RESOURCES_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async deleteResource(id: string): Promise<void> {
    return this.apiClient.delete<void>(PROJECT_RESOURCES_ENDPOINTS.BY_ID(id));
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECT_RESOURCES_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECT_RESOURCES_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectResourcesService = new ProjectResourcesService();
