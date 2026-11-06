import { getApiClient } from "../clients";
import { PROJECTS_ENDPOINTS } from "../constants/endpoints";
import type {
  ChangeProjectStatusDto,
  CopyProjectDto,
  CreateProjectDto,
  PaginatedResponse,
  ProjectDto,
  ProjectStatisticsDto,
  QuerySpec,
  UpdateProjectDto,
} from "@/types/api.types";

class ProjectsService {
  private readonly apiClient = getApiClient();

  async searchProjects(
    querySpec: QuerySpec
  ): Promise<PaginatedResponse<ProjectDto>> {
    return this.apiClient.get<PaginatedResponse<ProjectDto>>(
      PROJECTS_ENDPOINTS.BASE,
      { params: querySpec }
    );
  }

  async getProjectById(id: string): Promise<ProjectDto> {
    return this.apiClient.get<ProjectDto>(PROJECTS_ENDPOINTS.BY_ID(id));
  }

  async getProjectByNumber(projectNumber: string): Promise<ProjectDto> {
    return this.apiClient.get<ProjectDto>(
      PROJECTS_ENDPOINTS.BY_NUMBER(projectNumber)
    );
  }

  async createProject(data: CreateProjectDto): Promise<ProjectDto> {
    return this.apiClient.post<ProjectDto>(PROJECTS_ENDPOINTS.BASE, data);
  }

  async updateProject(id: string, data: UpdateProjectDto): Promise<ProjectDto> {
    return this.apiClient.put<ProjectDto>(PROJECTS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteProject(id: string): Promise<void> {
    return this.apiClient.delete<void>(PROJECTS_ENDPOINTS.BY_ID(id));
  }

  async changeProjectStatus(
    id: string,
    data: ChangeProjectStatusDto
  ): Promise<ProjectDto> {
    return this.apiClient.post<ProjectDto>(
      PROJECTS_ENDPOINTS.STATUS(id),
      data
    );
  }

  async copyProject(id: string, data: CopyProjectDto): Promise<ProjectDto> {
    return this.apiClient.post<ProjectDto>(PROJECTS_ENDPOINTS.COPY(id), data);
  }

  async getProjectStatistics(id: string): Promise<ProjectStatisticsDto> {
    return this.apiClient.get<ProjectStatisticsDto>(
      PROJECTS_ENDPOINTS.STATISTICS(id)
    );
  }

  async exportToXlsx(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECTS_ENDPOINTS.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(): Promise<Blob> {
    return this.apiClient.get<Blob>(PROJECTS_ENDPOINTS.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectsService = new ProjectsService();
