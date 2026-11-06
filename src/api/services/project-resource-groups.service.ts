import { getApiClient } from "../clients";
import { PROJECT_RESOURCE_GROUPS_ENDPOINTS } from "../constants/endpoints";
import type {
  CreateUpdateResourceGroupDto,
  ResourceGroupDto,
} from "@/types/api.types";

class ProjectResourceGroupsService {
  private readonly apiClient = getApiClient();

  async getResourceGroups(): Promise<ResourceGroupDto[]> {
    return this.apiClient.get<ResourceGroupDto[]>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.BASE
    );
  }

  async getResourceGroupById(id: string): Promise<ResourceGroupDto> {
    return this.apiClient.get<ResourceGroupDto>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.BY_ID(id)
    );
  }

  async createResourceGroup(
    data: CreateUpdateResourceGroupDto
  ): Promise<ResourceGroupDto> {
    return this.apiClient.post<ResourceGroupDto>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.BASE,
      data
    );
  }

  async updateResourceGroup(
    id: string,
    data: CreateUpdateResourceGroupDto
  ): Promise<ResourceGroupDto> {
    return this.apiClient.put<ResourceGroupDto>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.BY_ID(id),
      data
    );
  }

  async deleteResourceGroup(id: string): Promise<void> {
    return this.apiClient.delete<void>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.BY_ID(id)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.EXPORT_XLSX,
      { responseType: "blob" }
    );
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(
      PROJECT_RESOURCE_GROUPS_ENDPOINTS.EXPORT_PDF,
      { responseType: "blob" }
    );
  }
}

export const projectResourceGroupsService = new ProjectResourceGroupsService();
