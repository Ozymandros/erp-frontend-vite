/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

vi.mock("@/api/services/users.service", () => ({
  usersService: {
    updateUser: vi.fn(),
  },
}));

import { EditUserDialog } from "../edit-user-dialog";
import { usersService } from "@/api/services/users.service";

const mockUser = {
  id: "user-1",
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  isActive: true,
  roles: [],
  emailConfirmed: true,
  isExternalLogin: false,
  isAdmin: false,
  permissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  createdBy: "admin",
  updatedBy: "admin",
};

describe("EditUserDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render edit user form when open", () => {
    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  });

  it("should not render when closed", () => {
    render(
      <EditUserDialog
        user={mockUser}
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Edit User")).not.toBeInTheDocument();
  });

  it("should handle successful user update", async () => {
    vi.mocked(usersService.updateUser).mockResolvedValue({} as any);

    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "updated@example.com" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(usersService.updateUser).toHaveBeenCalledWith("user-1", expect.objectContaining({
        email: "updated@example.com",
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should display error on update failure", async () => {
    vi.mocked(usersService.updateUser).mockRejectedValue(new Error("Email already in use"));

    render(
      <EditUserDialog
        user={mockUser}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
  });
});
