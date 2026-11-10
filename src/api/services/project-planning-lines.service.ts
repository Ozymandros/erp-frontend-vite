import { getApiClient } from "../clients";
import { projectPlanningLinesEndpoints } from "../constants/endpoints";
import type {
  CreateUpdatePlanningLineDto,
  PlanningLineDto,
} from "@/types/api.types";

class ProjectPlanningLinesService {
  private readonly apiClient = getApiClient();

  async getPlanningLines(
    projectId: string,
    taskId?: string
  ): Promise<PlanningLineDto[]> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.get<PlanningLineDto[]>(endpoints.BASE, {
      params: taskId ? { taskId } : undefined,
    });
  }

  async getPlanningLineById(
    projectId: string,
    lineId: string
  ): Promise<PlanningLineDto> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.get<PlanningLineDto>(endpoints.BY_ID(lineId));
  }

  async createPlanningLine(
    projectId: string,
    data: CreateUpdatePlanningLineDto
  ): Promise<PlanningLineDto> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.post<PlanningLineDto>(endpoints.BASE, data);
  }

  async updatePlanningLine(
    projectId: string,
    lineId: string,
    data: CreateUpdatePlanningLineDto
  ): Promise<PlanningLineDto> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.put<PlanningLineDto>(endpoints.BY_ID(lineId), data);
  }

  async deletePlanningLine(projectId: string, lineId: string): Promise<void> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.delete<void>(endpoints.BY_ID(lineId));
  }

  async exportToXlsx(projectId: string): Promise<Blob> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(projectId: string): Promise<Blob> {
    const endpoints = projectPlanningLinesEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectPlanningLinesService = new ProjectPlanningLinesService();
