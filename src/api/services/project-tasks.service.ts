import { getApiClient } from "../clients";
import { projectTasksEndpoints } from "../constants/endpoints";
import type {
  CreateProjectTaskDto,
  MoveProjectTaskDto,
  ProjectTaskDto,
  ProjectTaskTreeNodeDto,
  UpdateProjectTaskDto,
} from "@/types/api.types";

class ProjectTasksService {
  private readonly apiClient = getApiClient();

  async getTasks(projectId: string): Promise<ProjectTaskDto[]> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.get<ProjectTaskDto[]>(endpoints.BASE);
  }

  async getTaskTree(projectId: string): Promise<ProjectTaskTreeNodeDto[]> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.get<ProjectTaskTreeNodeDto[]>(endpoints.TREE);
  }

  async getTaskById(
    projectId: string,
    taskId: string
  ): Promise<ProjectTaskDto> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.get<ProjectTaskDto>(endpoints.BY_ID(taskId));
  }

  async createTask(
    projectId: string,
    data: CreateProjectTaskDto
  ): Promise<ProjectTaskDto> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.post<ProjectTaskDto>(endpoints.BASE, data);
  }

  async updateTask(
    projectId: string,
    taskId: string,
    data: UpdateProjectTaskDto
  ): Promise<ProjectTaskDto> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.put<ProjectTaskDto>(endpoints.BY_ID(taskId), data);
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.delete<void>(endpoints.BY_ID(taskId));
  }

  async moveTask(
    projectId: string,
    taskId: string,
    data: MoveProjectTaskDto
  ): Promise<ProjectTaskDto> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.post<ProjectTaskDto>(endpoints.MOVE(taskId), data);
  }

  async exportToXlsx(projectId: string): Promise<Blob> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.EXPORT_XLSX, {
      responseType: "blob",
    });
  }

  async exportToPdf(projectId: string): Promise<Blob> {
    const endpoints = projectTasksEndpoints(projectId);
    return this.apiClient.get<Blob>(endpoints.EXPORT_PDF, {
      responseType: "blob",
    });
  }
}

export const projectTasksService = new ProjectTasksService();
