import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";

vi.mock("@/api/services/roles.service", () => ({
  rolesService: {
    deleteRole: vi.fn(),
  },
}));

import { DeleteRoleDialog } from "../delete-role-dialog";
import { rolesService } from "@/api/services/roles.service";

const mockRole = {
  id: "role-1",
  name: "Admin",
  description: "Administrator role",
  permissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  createdBy: "user1",
  updatedBy: "user1",
};

describe("DeleteRoleDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render delete confirmation when open", () => {
    render(
      <DeleteRoleDialog
        role={mockRole}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole("heading", { name: "Delete Role" })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this role/)).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <DeleteRoleDialog
        role={mockRole}
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByRole("heading", { name: "Delete Role" })).not.toBeInTheDocument();
  });

  it("should call delete and onSuccess on confirm", async () => {
    vi.mocked(rolesService.deleteRole).mockResolvedValue();

    render(
      <DeleteRoleDialog
        role={mockRole}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete role/i }));

    await waitFor(() => {
      expect(rolesService.deleteRole).toHaveBeenCalledWith("role-1");
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on delete failure", async () => {
    vi.mocked(rolesService.deleteRole).mockRejectedValue(new Error("Role is in use"));

    render(
      <DeleteRoleDialog
        role={mockRole}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete role/i }));

    await waitFor(() => {
      expect(screen.getByText(/role is in use/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should call onOpenChange when Cancel is clicked", async () => {
    render(
      <DeleteRoleDialog
        role={mockRole}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
