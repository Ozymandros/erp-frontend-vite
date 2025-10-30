import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"
import { CreateUserDialog } from "../create-user-dialog"
import * as usersService from "@/api/services/users.service"

vi.mock("@/api/services/users.service")

describe("CreateUserDialog", () => {
  const mockOnSuccess = vi.fn()
  const mockOnOpenChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render create user form when open", () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    expect(screen.getByText("Create New User")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("should not render when closed", () => {
    render(<CreateUserDialog open={false} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    expect(screen.queryByText("Create New User")).not.toBeInTheDocument()
  })

  it("should handle successful user creation", async () => {
    const mockCreateUser = vi.spyOn(usersService.usersService, "createUser").mockResolvedValue({
      id: "user-1",
      username: "newuser",
      email: "new@example.com",
      isActive: true,
      roles: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    })

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "newuser" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "newuser",
        email: "new@example.com",
        password: "password123",
        firstName: undefined,
        lastName: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it("should display error on creation failure", async () => {
    vi.spyOn(usersService.usersService, "createUser").mockRejectedValue(new Error("Username already exists"))

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "existinguser" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument()
    })
  })
})
