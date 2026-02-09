import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";

vi.mock("@/api/services/roles.service", () => ({
  rolesService: {
    createRole: vi.fn(),
  },
}));

import { CreateRoleDialog } from "../create-role-dialog";
import { rolesService } from "@/api/services/roles.service";

describe("CreateRoleDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create role form when open", () => {
    render(
      <CreateRoleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Create New Role")).toBeInTheDocument();
    expect(screen.getByLabelText(/role name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <CreateRoleDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Create New Role")).not.toBeInTheDocument();
  });

  it("should handle successful role creation", async () => {
    vi.mocked(rolesService.createRole).mockResolvedValue({
      id: "role-1",
      name: "Admin",
      description: "Administrator role",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as never);

    render(
      <CreateRoleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.type(screen.getByLabelText(/role name/i), "Admin");
    await userEvent.type(screen.getByLabelText(/description/i), "Administrator role");
    await userEvent.click(screen.getByRole("button", { name: /create role/i }));

    await waitFor(() => {
      expect(rolesService.createRole).toHaveBeenCalledWith({
        name: "Admin",
        description: "Administrator role",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on creation failure", async () => {
    vi.mocked(rolesService.createRole).mockRejectedValue(new Error("Role already exists"));

    render(
      <CreateRoleDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.type(screen.getByLabelText(/role name/i), "Admin");
    await userEvent.click(screen.getByRole("button", { name: /create role/i }));

    await waitFor(() => {
      expect(screen.getByText(/role already exists/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
