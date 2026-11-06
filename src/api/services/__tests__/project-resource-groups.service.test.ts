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

const { projectResourceGroupsService } = await import(
  "@/api/services/project-resource-groups.service"
);

describe("ProjectResourceGroupsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("covers all methods", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectResourceGroupsService.getResourceGroups();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups"
    );

    mockApiClient.get.mockResolvedValue({ id: "g1" });
    await projectResourceGroupsService.getResourceGroupById("g1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups/g1"
    );

    mockApiClient.post.mockResolvedValue({ id: "g2" });
    await projectResourceGroupsService.createResourceGroup({ code: "G", name: "N" });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups",
      { code: "G", name: "N" }
    );

    mockApiClient.put.mockResolvedValue({ id: "g1" });
    await projectResourceGroupsService.updateResourceGroup("g1", {
      code: "G",
      name: "U",
    });
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups/g1",
      expect.any(Object)
    );

    mockApiClient.delete.mockResolvedValue(undefined);
    await projectResourceGroupsService.deleteResourceGroup("g1");
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups/g1"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectResourceGroupsService.exportToXlsx();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups/export-xlsx",
      { responseType: "blob" }
    );
    await projectResourceGroupsService.exportToPdf();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/resource-groups/export-pdf",
      { responseType: "blob" }
    );
  });
});
