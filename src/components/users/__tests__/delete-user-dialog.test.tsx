import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";

vi.mock("@/api/services/users.service", () => ({
  usersService: {
    deleteUser: vi.fn(),
  },
}));

import { DeleteUserDialog } from "../delete-user-dialog";
import { usersService } from "@/api/services/users.service";

const mockUser = {
  id: "user-1",
  username: "testuser",
  email: "test@example.com",
  isActive: true,
  roles: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("DeleteUserDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render delete confirmation when open", () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole("heading", { name: "Delete User" })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this user/)).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Delete User")).not.toBeInTheDocument();
  });

  it("should call delete and onSuccess on confirm", async () => {
    vi.mocked(usersService.deleteUser).mockResolvedValue();

    render(
      <DeleteUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete user/i }));

    await waitFor(() => {
      expect(usersService.deleteUser).toHaveBeenCalledWith("user-1");
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on delete failure", async () => {
    vi.mocked(usersService.deleteUser).mockRejectedValue(new Error("Cannot delete user"));

    render(
      <DeleteUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /delete user/i }));

    await waitFor(() => {
      expect(screen.getByText(/cannot delete user/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it("should call onOpenChange when Cancel is clicked", async () => {
    render(
      <DeleteUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
