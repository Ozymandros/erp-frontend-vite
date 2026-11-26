import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ResourceDetailPage } from "../resource-detail";
import { projectResourcesService } from "@/api/services/project-resources.service";
import { useModulePermissions } from "@/hooks/use-permissions";
import type { ResourceDto } from "@/types/api.types";

vi.mock("@/api/services/project-resources.service", () => ({
  projectResourcesService: {
    getResourceById: vi.fn(),
  },
}));

vi.mock("@/components/projects/edit-resource-dialog", () => ({
  EditResourceDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="edit-dlg" /> : null,
}));
vi.mock("@/components/projects/delete-resource-dialog", () => ({
  DeleteResourceDialog: (p: { open: boolean; onSuccess: () => void }) =>
    p.open ? (
      <button type="button" data-testid="confirm-delete" onClick={p.onSuccess}>
        confirm
      </button>
    ) : null,
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

const resource: ResourceDto = {
  id: "res-1",
  resourceNo: "R001",
  name: "Consultant",
  type: "Person",
  baseUnitOfMeasure: "HOUR",
  unitCost: 50,
  unitPrice: 100,
  dailyCapacity: 8,
  blocked: false,
  resourceGroupCode: "GRP1",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
};

describe("ResourceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModulePermissions).mockReturnValue({
      canCreate: false,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canExport: false,
      canExecute: false,
    });
  });

  it("loads resource and opens edit", async () => {
    vi.mocked(projectResourcesService.getResourceById).mockResolvedValue(resource);
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/projects/resources/res-1"]}>
        <Routes>
          <Route path="/projects/resources/:id" element={<ResourceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/R001 — Consultant/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByTestId("edit-dlg")).toBeInTheDocument();
  });

  it("shows error when load fails", async () => {
    vi.mocked(projectResourcesService.getResourceById).mockRejectedValue(
      new Error("boom")
    );
    render(
      <MemoryRouter initialEntries={["/projects/resources/res-1"]}>
        <Routes>
          <Route path="/projects/resources/:id" element={<ResourceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("boom")).toBeInTheDocument();
    });
  });

  it("opens delete flow", async () => {
    vi.mocked(projectResourcesService.getResourceById).mockResolvedValue(resource);
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/projects/resources/res-1"]}>
        <Routes>
          <Route path="/projects/resources/:id" element={<ResourceDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Consultant/)).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    await user.click(screen.getByTestId("confirm-delete"));
  });
});
