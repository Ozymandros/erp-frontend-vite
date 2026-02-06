/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"
import { EditPermissionDialog } from "../edit-permission-dialog"
import { permissionsService } from "@/api/services/permissions.service"

vi.mock("@/api/services/permissions.service", () => ({
  permissionsService: {
    updatePermission: vi.fn(),
  },
}))

describe("EditPermissionDialog", () => {
  const mockPermission = {
    id: "perm-1",
    module: "Users",
    action: "READ",
    description: "Original description",
  }
  const mockOnSuccess = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render current permission values in form", () => {
    render(
      <EditPermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/resource/i)).toHaveValue("Users")
    expect(screen.getByLabelText(/action/i)).toHaveValue("READ")
    expect(screen.getByLabelText(/description/i)).toHaveValue("Original description")
  })

  it("should handle successful update", async () => {
    vi.mocked(permissionsService.updatePermission).mockResolvedValue({} as any)

    render(
      <EditPermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.change(screen.getByLabelText(/resource/i), { target: { value: "Inventory" } })
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() => {
      expect(permissionsService.updatePermission).toHaveBeenCalledWith("perm-1", expect.objectContaining({
        module: "Inventory",
      }))
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it("should handle update failure", async () => {
    vi.mocked(permissionsService.updatePermission).mockRejectedValue(new Error("Update failed"))

    render(
      <EditPermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument()
    })
  })

  it("should update form when permission prop changes", () => {
    const { rerender } = render(
      <EditPermissionDialog
        open={true}
        permission={mockPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    const nextPermission = { ...mockPermission, module: "Orders" }
    rerender(
      <EditPermissionDialog
        open={true}
        permission={nextPermission as any}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/resource/i)).toHaveValue("Orders")
  })

  it("should call onOpenChange when cancel is clicked", () => {
    render(
      <EditPermissionDialog
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
