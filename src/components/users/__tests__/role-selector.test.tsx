/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"
import { RoleSelector } from "../role-selector"
import { rolesService } from "@/api/services/roles.service"
import { usersService } from "@/api/services/users.service"
import { ApiClientError } from "@/api/clients/types"

vi.mock("@/api/services/roles.service", () => ({
  rolesService: {
    getRoles: vi.fn(),
  },
}))

vi.mock("@/api/services/users.service", () => ({
  usersService: {
    getUserRoles: vi.fn(),
    assignRole: vi.fn(),
    removeRole: vi.fn(),
  },
}))

describe("RoleSelector", () => {
  const mockUserId = "user-123"
  const mockRoles = [
    { id: "1", name: "Admin", description: "Full access" },
    { id: "2", name: "Editor", description: "Can edit content" },
    { id: "3", name: "Viewer", description: "Read-only access" },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(rolesService.getRoles).mockResolvedValue(mockRoles as any)
  })

  it("should show loading spinner initially", async () => {
    // Delay resolving to see loading state
    let resolveRoles: any
    const rolesPromise = new Promise(resolve => { resolveRoles = resolve })
    vi.mocked(rolesService.getRoles).mockReturnValue(rolesPromise as any)
    
    render(<RoleSelector userId={mockUserId} />)
    
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
    
    resolveRoles(mockRoles)
    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).not.toBeInTheDocument()
    })
  })

  it("should render list of roles after loading", async () => {
    vi.mocked(usersService.getUserRoles).mockResolvedValue([mockRoles[0]] as any)
    
    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument()
      expect(screen.getByText("Editor")).toBeInTheDocument()
      expect(screen.getByText("Viewer")).toBeInTheDocument()
    })

    // Admin should be selected (CheckCircle2 icon or border class)
    const adminCard = screen.getByText("Admin").closest(".border-primary")
    expect(adminCard).toBeInTheDocument()
  })

  it("should use initialRoles prop if provided", async () => {
    render(<RoleSelector userId={mockUserId} initialRoles={[mockRoles[1]] as any} />)

    await waitFor(() => {
      expect(screen.getByText("Editor")).toBeInTheDocument()
    })

    const editorCard = screen.getByText("Editor").closest(".border-primary")
    expect(editorCard).toBeInTheDocument()
    expect(usersService.getUserRoles).not.toHaveBeenCalled()
  })

  it("should filter roles based on search term", async () => {
    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText(/search roles/i)
    fireEvent.change(searchInput, { target: { value: "Edit" } })

    expect(screen.getByText("Editor")).toBeInTheDocument()
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
    expect(screen.queryByText("Viewer")).not.toBeInTheDocument()
  })

  it("should handle role assignment", async () => {
    const onRolesChange = vi.fn()
    vi.mocked(usersService.getUserRoles).mockResolvedValue([])
    vi.mocked(usersService.assignRole).mockResolvedValue({} as any)

    render(<RoleSelector userId={mockUserId} onRolesChange={onRolesChange} />)

    await waitFor(() => expect(screen.getByText("Editor")).toBeInTheDocument())

    const assignButton = screen.getAllByTitle("Assign role")[1] // Second role is Editor
    fireEvent.click(assignButton)

    await waitFor(() => {
      expect(usersService.assignRole).toHaveBeenCalledWith(mockUserId, "Editor")
      expect(screen.getByText(/role assigned successfully/i)).toBeInTheDocument()
      expect(onRolesChange).toHaveBeenCalled()
    })
  })

  it("should handle role unassignment", async () => {
    const onRolesChange = vi.fn()
    vi.mocked(usersService.getUserRoles).mockResolvedValue([mockRoles[0]] as any)
    vi.mocked(usersService.removeRole).mockResolvedValue({} as any)

    render(<RoleSelector userId={mockUserId} onRolesChange={onRolesChange} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    const unassignButton = screen.getByTitle("Unassign role")
    fireEvent.click(unassignButton)

    await waitFor(() => {
      expect(usersService.removeRole).toHaveBeenCalledWith(mockUserId, "Admin")
      expect(screen.getByText(/role unassigned successfully/i)).toBeInTheDocument()
      expect(onRolesChange).toHaveBeenCalled()
    })
  })

  it("should handle assignment failure", async () => {
    vi.mocked(usersService.assignRole).mockRejectedValue(new Error("API Error"))

    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Editor")).toBeInTheDocument())

    fireEvent.click(screen.getAllByTitle("Assign role")[0])

    await waitFor(() => {
      // getErrorMessage returns the error message if it exists
      expect(screen.getByText(/api error/i)).toBeInTheDocument()
    })
  })

  it("should handle assignment failure with status code", async () => {
    vi.mocked(usersService.assignRole).mockRejectedValue(
      new ApiClientError("Forbidden", 403)
    )

    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Editor")).toBeInTheDocument())

    fireEvent.click(screen.getAllByTitle("Assign role")[0])

    await waitFor(() => {
      expect(screen.getByText(/failed to assign role \(403\): Forbidden/i)).toBeInTheDocument()
    })
  })

  it("should handle unassignment failure", async () => {
    vi.mocked(usersService.getUserRoles).mockResolvedValue([mockRoles[0]] as any)
    vi.mocked(usersService.removeRole).mockRejectedValue(new Error("Unassign Error"))

    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    fireEvent.click(screen.getByTitle("Unassign role"))

    await waitFor(() => {
      expect(screen.getByText(/unassign error/i)).toBeInTheDocument()
    })
  })

  it("should handle unassignment failure with status code", async () => {
    vi.mocked(usersService.getUserRoles).mockResolvedValue([mockRoles[0]] as any)
    vi.mocked(usersService.removeRole).mockRejectedValue(
      new ApiClientError("Bad Request", 400)
    )

    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    fireEvent.click(screen.getByTitle("Unassign role"))

    await waitFor(() => {
      expect(screen.getByText(/failed to unassign role \(400\): Bad Request/i)).toBeInTheDocument()
    })
  })

  it("should handle initial role fetch failure", async () => {
    vi.mocked(usersService.getUserRoles).mockRejectedValue(new Error("Fetch Error"))
    
    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument()
      // Should still render roles, just none selected
      expect(screen.queryByRole("img", { name: /check/i })).not.toBeInTheDocument()
    })
  })

  it("should handle global roles fetch failure", async () => {
    vi.mocked(rolesService.getRoles).mockRejectedValue(new Error("Global Fetch Error"))

    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => {
      // getErrorMessage returns the error message if it exists
      expect(screen.getByText(/global fetch error/i)).toBeInTheDocument()
    })
  })

  it("should do nothing if loading same userId multiple times", async () => {
    const { rerender } = render(<RoleSelector userId={mockUserId} />)
    await waitFor(() => expect(rolesService.getRoles).toHaveBeenCalledTimes(1))
    
    rerender(<RoleSelector userId={mockUserId} />)
    expect(rolesService.getRoles).toHaveBeenCalledTimes(1) // Should NOT call again
  })

  it("should handle search by description", async () => {
    render(<RoleSelector userId={mockUserId} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    fireEvent.change(screen.getByPlaceholderText(/search roles/i), { target: { value: "read-only" } })

    expect(screen.getByText("Viewer")).toBeInTheDocument()
    expect(screen.queryByText("Admin")).not.toBeInTheDocument()
  })

  it("should disable controls in readonly mode", async () => {
    render(<RoleSelector userId={mockUserId} readonly={true} />)

    await waitFor(() => expect(screen.getByText("Admin")).toBeInTheDocument())

    expect(screen.queryByTitle("Assign role")).not.toBeInTheDocument()
    expect(screen.queryByTitle("Unassign role")).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search roles/i)).toBeDisabled()
  })
})
