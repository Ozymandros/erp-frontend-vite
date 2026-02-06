/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"
import { DeletePermissionDialog } from "../delete-permission-dialog"
import { permissionsService } from "@/api/services/permissions.service"

vi.mock("@/api/services/permissions.service", () => ({
  permissionsService: {
    deletePermission: vi.fn(),
  },
}))

describe("DeletePermissionDialog", () => {
  const mockPermission = {
    id: "perm-1",
    module: "Users",
    action: "READ",
    description: "Can read users",
  }
  const mockOnSuccess = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render permission details when open", async () => {
    render(
      <DeletePermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    // Wait for the dialog to be in the DOM
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2, name: /delete permission/i })).toBeInTheDocument()
    })

    expect(screen.getByText(/Resource:/i)).toBeInTheDocument()
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText(/Action:/i)).toBeInTheDocument()
    expect(screen.getByText("READ")).toBeInTheDocument()
    expect(screen.getByText(/can read users/i)).toBeInTheDocument()
  })

  it("should handle successful deletion", async () => {
    vi.mocked(permissionsService.deletePermission).mockResolvedValue({} as any)

    render(
      <DeletePermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /delete permission/i }))

    await waitFor(() => {
      expect(permissionsService.deletePermission).toHaveBeenCalledWith("perm-1")
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it("should handle deletion failure", async () => {
    vi.mocked(permissionsService.deletePermission).mockRejectedValue(new Error("Delete failed"))

    render(
      <DeletePermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /delete permission/i }))

    await waitFor(() => {
      expect(screen.getByText("Delete failed")).toBeInTheDocument()
    })
  })

  it("should disable buttons when loading", async () => {
    let resolveDelete: any
    const deletePromise = new Promise(resolve => { resolveDelete = resolve })
    vi.mocked(permissionsService.deletePermission).mockReturnValue(deletePromise as any)

    render(
      <DeletePermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /delete permission/i }))

    expect(screen.getByRole("button", { name: /deleting/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()

    resolveDelete({})
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /deleting/i })).not.toBeInTheDocument()
    })
  })

  it("should call onOpenChange when cancel is clicked", () => {
    render(
      <DeletePermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })
})
