/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils";

vi.mock("@/api/services/permissions.service", () => ({
  permissionsService: {
    createPermission: vi.fn(),
  },
}));

import { CreatePermissionDialog } from "../create-permission-dialog";
import { permissionsService } from "@/api/services/permissions.service";

describe("CreatePermissionDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create permission form when open", () => {
    render(
      <CreatePermissionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Create New Permission")).toBeInTheDocument();
    expect(screen.getByLabelText(/^resource/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^action/i)).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <CreatePermissionDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText("Create New Permission")).not.toBeInTheDocument();
  });

  it("should handle successful permission creation", async () => {
    vi.mocked(permissionsService.createPermission).mockResolvedValue({
      id: "perm-1",
      module: "users",
      action: "read",
      description: "Read users",
    } as any);

    render(
      <CreatePermissionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^resource/i), { target: { value: "users" } });
    fireEvent.change(screen.getByLabelText(/^action/i), { target: { value: "read" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);
    else fireEvent.click(screen.getByRole("button", { name: /create permission/i }));

    await waitFor(() => {
      expect(permissionsService.createPermission).toHaveBeenCalledWith({
        module: "users",
        action: "read",
        description: undefined,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should include description when provided", async () => {
    vi.mocked(permissionsService.createPermission).mockResolvedValue({
      id: "perm-1",
      module: "users",
      action: "read",
      description: "Read users",
    } as any);

    render(
      <CreatePermissionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^resource/i), { target: { value: "users" } });
    fireEvent.change(screen.getByLabelText(/^action/i), { target: { value: "read" } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: "Read users" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(permissionsService.createPermission).toHaveBeenCalledWith({
        module: "users",
        action: "read",
        description: "Read users",
      });
    });
  });

  it("should display error on creation failure", async () => {
    vi.mocked(permissionsService.createPermission).mockRejectedValue(
      new Error("Permission already exists")
    );

    render(
      <CreatePermissionDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/^resource/i), { target: { value: "users" } });
    fireEvent.change(screen.getByLabelText(/^action/i), { target: { value: "read" } });

    const form = document.querySelector("form");
    if (form) fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/permission already exists/i)).toBeInTheDocument();
    });
  });
});
