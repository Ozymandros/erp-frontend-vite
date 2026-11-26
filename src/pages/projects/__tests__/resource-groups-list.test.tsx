import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ResourceGroupsListPage } from "../resource-groups-list";
import { projectResourceGroupsService } from "@/api/services/project-resource-groups.service";
import { useModulePermissions } from "@/hooks/use-permissions";
import type { ResourceGroupDto } from "@/types/api.types";

vi.mock("@/api/services/project-resource-groups.service", () => ({
  projectResourceGroupsService: {
    getResourceGroups: vi.fn(),
  },
}));

vi.mock("@/components/projects/create-resource-group-dialog", () => ({
  CreateResourceGroupDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="create-group" /> : null,
}));
vi.mock("@/components/projects/edit-resource-group-dialog", () => ({
  EditResourceGroupDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="edit-group" /> : null,
}));
vi.mock("@/components/projects/delete-resource-group-dialog", () => ({
  DeleteResourceGroupDialog: (p: { open: boolean }) =>
    p.open ? <div data-testid="delete-group" /> : null,
}));

vi.mock("@/hooks/use-permissions", () => ({
  useModulePermissions: vi.fn(),
}));

const groups: ResourceGroupDto[] = [
  {
    id: "g1",
    code: "G1",
    name: "Group One",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
];

describe("ResourceGroupsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(projectResourceGroupsService.getResourceGroups).mockResolvedValue(groups);
    vi.mocked(useModulePermissions).mockReturnValue({
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true,
      canExport: false,
      canExecute: false,
    });
  });

  it("lists groups and opens dialogs", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ResourceGroupsListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "G1" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /add resource group/i }));
    expect(screen.getByTestId("create-group")).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    const pencil = buttons.find((b) => b.querySelector(".lucide-pencil"));
    await user.click(pencil!);
    expect(screen.getByTestId("edit-group")).toBeInTheDocument();

    const trash = buttons.find((b) => b.querySelector(".lucide-trash2"));
    await user.click(trash!);
    expect(screen.getByTestId("delete-group")).toBeInTheDocument();
  });
});
