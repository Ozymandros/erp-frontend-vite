import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../protected-route";

vi.mock("@/contexts/auth.context", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/auth.context";

function TestApp({ initialPath = "/protected" }: { initialPath?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading when isLoading is true", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn().mockResolvedValue(true),
      refreshUserData: vi.fn(),
    } as never);

    render(<TestApp />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn().mockResolvedValue(true),
      refreshUserData: vi.fn(),
    } as never);

    render(<TestApp />);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated without permission check", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user", email: "u@t.com", isActive: true, roles: [] },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn().mockResolvedValue(true),
      refreshUserData: vi.fn(),
    } as never);

    render(<TestApp />);

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("should show Access Denied when permission check fails", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user", email: "u@t.com", isActive: true, roles: [] },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn().mockResolvedValue(false),
      refreshUserData: vi.fn(),
    } as never);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredResource="Users" requiredAction="Read">
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  it("should render children when permission check passes", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "1", username: "user", email: "u@t.com", isActive: true, roles: [] },
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn().mockResolvedValue(true),
      refreshUserData: vi.fn(),
    } as never);

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredResource="Users" requiredAction="Read">
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });
});
