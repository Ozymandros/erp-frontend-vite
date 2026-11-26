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

const { projectTasksService } = await import("@/api/services/project-tasks.service");

describe("ProjectTasksService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getTaskTree fetches tree endpoint", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectTasksService.getTaskTree("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/tree"
    );
  });

  it("moveTask posts to move endpoint", async () => {
    mockApiClient.post.mockResolvedValue({});
    await projectTasksService.moveTask("proj-1", "task-1", { sortOrder: 1 });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/task-1/move",
      { sortOrder: 1 }
    );
  });

  it("covers task CRUD and exports", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectTasksService.getTasks("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks"
    );

    mockApiClient.get.mockResolvedValue({});
    await projectTasksService.getTaskById("proj-1", "task-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/task-1"
    );

    mockApiClient.post.mockResolvedValue({});
    await projectTasksService.createTask("proj-1", {
      taskNo: "T1",
      description: "Desc",
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks",
      expect.objectContaining({ taskNo: "T1" })
    );

    mockApiClient.put.mockResolvedValue({});
    await projectTasksService.updateTask("proj-1", "task-1", {
      taskNo: "T1",
      description: "U",
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/task-1",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectTasksService.deleteTask("proj-1", "task-1");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/task-1"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectTasksService.exportToXlsx("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/export-xlsx",
      { responseType: "blob" }
    );
    await projectTasksService.exportToPdf("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/tasks/export-pdf",
      { responseType: "blob" }
    );
  });
});
