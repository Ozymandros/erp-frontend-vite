import { getApiClient } from "../clients";
import { ACTIVITIES_ENDPOINTS } from "../constants/endpoints";
import type {
  ActivityDto,
  CreateActivityDto,
  CompleteActivityDto,
  PaginatedResponse,
  QuerySpec,
} from "@/types/api.types";

class CrmActivitiesService {
  private readonly apiClient = getApiClient();

  async searchActivities(
    querySpec: QuerySpec,
  ): Promise<PaginatedResponse<ActivityDto>> {
    return this.apiClient.get<PaginatedResponse<ActivityDto>>(
      ACTIVITIES_ENDPOINTS.BASE,
      { params: querySpec },
    );
  }

  async getActivityById(id: string): Promise<ActivityDto> {
    return this.apiClient.get<ActivityDto>(ACTIVITIES_ENDPOINTS.BY_ID(id));
  }

  async createActivity(data: CreateActivityDto): Promise<ActivityDto> {
    return this.apiClient.post<ActivityDto>(ACTIVITIES_ENDPOINTS.BASE, data);
  }

  async completeActivity(
    id: string,
    data: CompleteActivityDto,
  ): Promise<ActivityDto> {
    return this.apiClient.post<ActivityDto>(ACTIVITIES_ENDPOINTS.COMPLETE(id), data);
  }
}

export const crmActivitiesService = new CrmActivitiesService();

