import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { projectPlanningLinesService } = await import(
  "@/api/services/project-planning-lines.service"
);

describe("ProjectPlanningLinesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPlanningLines passes taskId filter", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectPlanningLinesService.getPlanningLines("proj-1", "task-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines",
      { params: { taskId: "task-1" } }
    );
  });

  it("getPlanningLines omits params without taskId", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectPlanningLinesService.getPlanningLines("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines",
      { params: undefined }
    );
  });

  it("covers line by id, mutations, exports", async () => {
    mockApiClient.get.mockResolvedValue({ id: "line-1" });
    await projectPlanningLinesService.getPlanningLineById("proj-1", "line-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines/line-1"
    );

    mockApiClient.post.mockResolvedValue({});
    await projectPlanningLinesService.createPlanningLine("proj-1", {
      projectTaskId: "task-1",
      quantity: 1,
      planningDate: "2024-01-01",
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines",
      expect.any(Object)
    );

    mockApiClient.put.mockResolvedValue({});
    await projectPlanningLinesService.updatePlanningLine("proj-1", "line-1", {
      projectTaskId: "task-1",
      quantity: 2,
      planningDate: "2024-01-02",
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines/line-1",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectPlanningLinesService.deletePlanningLine("proj-1", "line-1");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines/line-1"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectPlanningLinesService.exportToXlsx("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines/export-xlsx",
      { responseType: "blob" }
    );
    await projectPlanningLinesService.exportToPdf("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/planning-lines/export-pdf",
      { responseType: "blob" }
    );
  });
});
