import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@/test/utils/test-utils"
import { LoginPage } from "../login"
import * as authContext from "@/contexts/auth.context"

vi.mock("@/contexts/auth.context", async () => {
  const actual = await vi.importActual("@/contexts/auth.context")
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

describe("LoginPage", () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(authContext.useAuth as any).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it("should render login form", () => {
    render(<LoginPage />)

    expect(screen.getByText("Sign in")).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("should handle form submission", async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      })
    })
  })

  it("should display error message on login failure", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"))
    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it("should disable form during submission", async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    render(<LoginPage />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: "testuser" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(usernameInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})
