import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectLineKind } from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

const { projectPostingService } = await import(
  "@/api/services/project-posting.service"
);

describe("ProjectPostingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("postUsage posts to usage endpoint", async () => {
    mockApiClient.post.mockResolvedValue({});
    await projectPostingService.postUsage("proj-1", {
      projectTaskId: "task-1",
      quantity: 1,
      kind: ProjectLineKind.Resource,
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/usage",
      expect.objectContaining({ projectTaskId: "task-1" })
    );
  });

  it("createInvoiceRequest posts to invoice-requests", async () => {
    mockApiClient.post.mockResolvedValue({});
    await projectPostingService.createInvoiceRequest("proj-1", {
      taxRate: 21,
      lines: [],
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/invoice-requests",
      { taxRate: 21, lines: [] }
    );
  });

  it("covers ledger, item consumption, invoice list, exports", async () => {
    mockApiClient.get.mockResolvedValue([]);
    await projectPostingService.getLedgerEntries("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/ledger-entries",
      { params: undefined }
    );
    await projectPostingService.getLedgerEntries("proj-1", "task-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/ledger-entries",
      { params: { taskId: "task-1" } }
    );

    mockApiClient.get.mockResolvedValue([]);
    await projectPostingService.getItemConsumptionOrders("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/item-consumption"
    );

    mockApiClient.post.mockResolvedValue({});
    await projectPostingService.createItemConsumption("proj-1", {
      warehouseId: "wh-1",
      lines: [{ planningLineId: "pl-1", quantity: 1 }],
    });
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/item-consumption",
      expect.any(Object)
    );

    mockApiClient.get.mockResolvedValue([]);
    await projectPostingService.getInvoiceRequests("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/invoice-requests"
    );

    mockApiClient.get.mockResolvedValue(new Blob());
    await projectPostingService.exportLedgerToXlsx("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/ledger-entries/export-xlsx",
      { responseType: "blob" }
    );
    await projectPostingService.exportLedgerToPdf("proj-1");
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/projects/api/projects/proj-1/ledger-entries/export-pdf",
      { responseType: "blob" }
    );
  });
});
