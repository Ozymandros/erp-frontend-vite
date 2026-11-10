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

const { projectResourcesService } = await import(
  "@/api/services/project-resources.service"
);

describe("ProjectResourcesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchResources uses resources base", async () => {
    mockApiClient.get.mockResolvedValue({ items: [] });
    await projectResourcesService.searchResources({ page: 1 });
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resources",
      { params: { page: 1 } }
    );
  });

  it("covers resource CRUD and exports", async () => {
    mockApiClient.get.mockResolvedValue({ id: "r1" });
    await projectResourcesService.getResourceById("r1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resources/r1"
    );

    mockApiClient.post.mockResolvedValue({ id: "r2" });
    await projectResourcesService.createResource({
      resourceNo: "R1",
      name: "N",
      baseUnitOfMeasure: "HOUR",
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/resources",
      expect.any(Object)
    );

    mockApiClient.put.mockResolvedValue({ id: "r1" });
    await projectResourcesService.updateResource("r1", {
      resourceNo: "R1",
      name: "U",
      baseUnitOfMeasure: "HOUR",
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/resources/r1",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectResourcesService.deleteResource("r1");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/resources/r1"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectResourcesService.exportToXlsx();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resources/export-xlsx",
      { responseType: "blob" }
    );
    await projectResourcesService.exportToPdf();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resources/export-pdf",
      { responseType: "blob" }
    );
  });
});
