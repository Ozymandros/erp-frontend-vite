/* eslint-disable @typescript-eslint/no-explicit-any */
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

    expect(screen.getAllByText("Sign in")[0]).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("should handle form submission", async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("should display error message on login failure", async () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"))
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it("should disable form during submission", async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole("button", { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: "test@example.com" } })
    fireEvent.change(passwordInput, { target: { value: "password123" } })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })

  it("should show validation errors for empty form", async () => {
    render(<LoginPage />)

    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument()
    })
  })

  it("should show validation error for invalid email", async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "not-an-email" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } })
    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it("should clear field error when user types", async () => {
    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad" } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } })
    const form = document.querySelector("form")
    if (form) fireEvent.submit(form)
    else fireEvent.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "valid@example.com" } })

    await waitFor(() => {
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
    })
  })
})
