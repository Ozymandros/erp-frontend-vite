import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProjectDto, PaginatedResponse, QuerySpec } from "@/types/api.types";
import { ProjectBlocked, ProjectStatus } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { projectsService } = await import("@/api/services/projects.service");

describe("ProjectsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchProjects calls paginated list endpoint", async () => {
    const mock: PaginatedResponse<ProjectDto> = {
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
    const qs: QuerySpec = { page: 1, pageSize: 10 };
    mockApiClient.get.mockResolvedValue(mock);

    const result = await projectsService.searchProjects(qs);

    expect(mockApiClient.get).toHaveBeenCalledWith("/projects/api/projects", {
      params: qs,
    });
    expect(result).toEqual(mock);
  });

  it("changeProjectStatus posts to status endpoint", async () => {
    mockApiClient.post.mockResolvedValue({ id: "p1" });
    await projectsService.changeProjectStatus("p1", {
      status: ProjectStatus.Open,
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/p1/status",
      { status: ProjectStatus.Open }
    );
  });

  it("getProjectStatistics fetches statistics", async () => {
    mockApiClient.get.mockResolvedValue({ projectId: "p1" });
    await projectsService.getProjectStatistics("p1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/p1/statistics"
    );
  });

  it("covers remaining CRUD and export methods", async () => {
    mockApiClient.get.mockResolvedValue({ id: "p1" });
    await projectsService.getProjectById("p1");
    expect(mockApiClient.get).toHaveBeenCalledWith("/projects/api/projects/p1");

    mockApiClient.get.mockResolvedValue({ id: "p2" });
    await projectsService.getProjectByNumber("PR-01");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/number/PR-01"
    );

    mockApiClient.post.mockResolvedValue({ id: "new" });
    await projectsService.createProject({
      description: "D",
      customerId: "c1",
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects",
      expect.objectContaining({ customerId: "c1" })
    );

    mockApiClient.put.mockResolvedValue({ id: "p1" });
    await projectsService.updateProject("p1", {
      description: "U",
      customerId: "c1",
      currencyCode: "EUR",
      blocked: ProjectBlocked.None,
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/p1",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectsService.deleteProject("p1");
    expect(mockApiClient.delete).toHaveBeenCalledWith("/projects/api/projects/p1");

    mockApiClient.post.mockResolvedValue({ id: "copy" });
    await projectsService.copyProject("p1", {});
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/p1/copy",
      {}
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectsService.exportToXlsx();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/export-xlsx",
      { responseType: "blob" }
    );
    await projectsService.exportToPdf();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/export-pdf",
      { responseType: "blob" }
    );
  });
});
