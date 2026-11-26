import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ResourcesListPage } from "../resources-list";
import { projectResourcesService } from "@/api/services/project-resources.service";
import { useModulePermissions } from "@/hooks/use-permissions";
import type { PaginatedResponse, ResourceDto } from "@/types/api.types";

vi.mock("@/api/services/project-resources.service", () => ({
  projectResourcesService: {
    searchResources: vi.fn(),
    exportToXlsx: vi.fn(),
    exportToPdf: vi.fn(),
  },
}));

vi.mock("@/components/projects/create-resource-dialog", () => ({
  CreateResourceDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="create-resource" /> : null,
}));
vi.mock("@/components/projects/edit-resource-dialog", () => ({
  EditResourceDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="edit-resource" /> : null,
}));
vi.mock("@/components/projects/delete-resource-dialog", () => ({
  DeleteResourceDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="delete-resource" /> : null,
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

const mockBlob = new Blob(["x"]);

const resource: ResourceDto = {
  id: "res-1",
  resourceNo: "R001",
  name: "Worker",
  type: "Person",
  baseUnitOfMeasure: "HOUR",
  unitCost: 10,
  unitPrice: 20,
  dailyCapacity: 8,
  blocked: false,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

const page: PaginatedResponse<ResourceDto> = {
  items: [resource],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

describe("ResourcesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectResourcesService.searchResources).mockResolvedValue(page);
    vi.mocked(projectResourcesService.exportToXlsx).mockResolvedValue(mockBlob);
    vi.mocked(projectResourcesService.exportToPdf).mockResolvedValue(mockBlob);
    vi.mocked(useModulePermissions).mockReturnValue({
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
      canExecute: false,
    });
  });

  it("exports and opens dialogs", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResourcesListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Worker")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /export xlsx/i }));
    await user.click(screen.getByRole("button", { name: /export pdf/i }));
    expect(projectResourcesService.exportToXlsx).toHaveBeenCalled();
    expect(projectResourcesService.exportToPdf).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /add resource/i }));
    expect(screen.getByTestId("create-resource")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button");
    const pencil = editButtons.find((b) => b.querySelector(".lucide-pencil"));
    expect(pencil).toBeTruthy();
    await user.click(pencil!);
    expect(screen.getByTestId("edit-resource")).toBeInTheDocument();

    const trash = editButtons.find((b) => b.querySelector(".lucide-trash2"));
    expect(trash).toBeTruthy();
    await user.click(trash!);
    expect(screen.getByTestId("delete-resource")).toBeInTheDocument();
  });
});
