/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"

vi.mock("@/api/services/users.service", () => ({
  usersService: {
    createUser: vi.fn(),
  },
}))

// Import after mocking
import { CreateUserDialog } from "../create-user-dialog"
import { usersService } from "@/api/services/users.service"

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
    const mockCreateUser = vi.mocked(usersService.createUser)
    mockCreateUser.mockResolvedValue({
      id: "user-1",
      username: "newuser",
      email: "new@example.com",
      isActive: true,
      roles: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any)

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "newuser123" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    const createButton = screen.getByRole("button", { name: /create user/i })
    fireEvent.click(createButton)

    expect(createButton).toBeDisabled()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
    expect(screen.getByLabelText(/username/i)).toBeDisabled()

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "newuser123",
        email: "new@example.com",
        password: "password123",
        firstName: undefined,
        lastName: undefined,
      })
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(screen.getByRole("button", { name: /create user/i })).toBeEnabled()
    }, { timeout: 3000 })
  })

  it("should display error on creation failure", async () => {
    const mockCreateUser = vi.mocked(usersService.createUser)
    mockCreateUser.mockRejectedValue(new Error("Username already exists"))

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "existinguser" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument()
    })
  })

  it("should show validation errors for empty required fields", async () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument()
    })
  })

  it("should show validation error for invalid email", async () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "validusername" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "invalid-email" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it("should show validation error for short password", async () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "validusername" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "short" } })
    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it("should include firstName and lastName when provided", async () => {
    const mockCreateUser = vi.mocked(usersService.createUser)
    mockCreateUser.mockResolvedValue({
      id: "user-1",
      username: "newuser",
      email: "new@example.com",
      isActive: true,
      roles: [],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    } as any)

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } })
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "newuser123" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: "newuser123",
        email: "new@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      })
    })
  })

  it("should call onOpenChange when Cancel is clicked", async () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("should clear field error when user types in field", async () => {
    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "ab" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "validusername" } })

    await waitFor(() => {
      expect(screen.queryByText(/username must be at least 3 characters/i)).not.toBeInTheDocument()
    })
  })

  it("should handle mixed first/last name values correctly", async () => {
    const mockCreateUser = vi.mocked(usersService.createUser)
    mockCreateUser.mockResolvedValue({} as any)

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } })
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "" } }) // Should become undefined
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "newuser123" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "new@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    
    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(expect.objectContaining({
        firstName: "John",
        lastName: undefined,
      }))
    })
  })

  it("should display generic error message when API error has no detail", async () => {
    const mockCreateUser = vi.mocked(usersService.createUser)
    mockCreateUser.mockRejectedValue({}) // Minimal error object

    render(<CreateUserDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "erroruser" } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "error@example.com" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })

    fireEvent.click(screen.getByRole("button", { name: /create user/i }))

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
    })
  })
})
