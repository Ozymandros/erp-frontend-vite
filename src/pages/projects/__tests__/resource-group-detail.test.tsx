import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ResourceGroupDetailPage } from "../resource-group-detail";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import { useModulePermissions } from "@/hooks/use-permissions";

vi.mock("@/api/services/project-resource-groups.service", () => ({
  projectResourceGroupsService: {
    getResourceGroupById: vi.fn(),
  },
}));

vi.mock("@/components/projects/edit-resource-group-dialog", () => ({
  EditResourceGroupDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="edit-g" /> : null,
}));
vi.mock("@/components/projects/delete-resource-group-dialog", () => ({
  DeleteResourceGroupDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="del-g" /> : null,
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

describe("ResourceGroupDetailPage", () => {
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
    vi.mocked(projectResourceGroupsService.getResourceGroupById).mockResolvedValue({
      id: "g1",
      code: "G1",
      name: "Alpha",
      createdAt: "2024-01-01T00:00:00Z",
      createdBy: "system",
    });
  });

  it("renders group and opens edit", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/projects/resource-groups/g1"]}>
        <Routes>
          <Route
            path="/projects/resource-groups/:id"
            element={<ResourceGroupDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("G1")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /^edit$/i }));
    expect(screen.getByTestId("edit-g")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^delete$/i }));
    expect(screen.getByTestId("del-g")).toBeInTheDocument();
  });
});
