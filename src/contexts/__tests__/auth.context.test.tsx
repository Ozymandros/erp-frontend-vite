import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth.context";

vi.mock("@/api/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    checkPermission: vi.fn(),
  },
}));

vi.mock("@/api/clients", () => ({
  getApiClient: vi.fn(() => ({
    setAuthToken: vi.fn(),
  })),
}));

import { authService } from "@/api/services/auth.service";

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout, register, checkApiPermission } = useAuth();
  const [permResult, setPermResult] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
      <span data-testid="login-error">{loginError}</span>
      <button
        onClick={async () => {
          try {
            await login({ email: "test@test.com", password: "pass123" });
          } catch (e) {
            setLoginError(e instanceof Error ? e.message : "error");
          }
        }}
      >
        Login
      </button>
      <button
        onClick={() =>
          register({
            email: "reg@test.com",
            username: "newuser",
            password: "pass123",
            passwordConfirm: "pass123",
          })
        }
      >
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
      <button
        onClick={async () => {
          const allowed = await checkApiPermission("Users", "Read");
          setPermResult(allowed ? "allowed" : "denied");
        }}
      >
        Check Permission
      </button>
      <span data-testid="perm-result">{permResult}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("should provide auth context to children", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(screen.getByTestId("authenticated")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should show unauthenticated initially when no tokens", async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("username")).toHaveTextContent("none");
  });

  it("should login and set user on success", async () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@test.com",
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

    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.login).mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("username")).toHaveTextContent("testuser");
    });
  });

  it("should register and set user on success", async () => {
    const mockUser = {
      id: "2",
      username: "newuser",
      email: "reg@test.com",
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

    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.register).mockResolvedValue({
      accessToken: "token",
      refreshToken: "refresh",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: mockUser,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("username")).toHaveTextContent("newuser");
    });
  });

  it("should keep user unauthenticated and propagate error when login fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.login).mockRejectedValue(new Error("Invalid credentials"));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("username")).toHaveTextContent("none");
      expect(screen.getByTestId("login-error")).toHaveTextContent("Invalid credentials");
    });

    consoleErrorSpy.mockRestore();
  });

  it("should return true from checkPermission when allowed", async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.checkPermission).mockResolvedValue({ allowed: true });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: /check permission/i }));

    await waitFor(() => {
      expect(screen.getByTestId("perm-result")).toHaveTextContent("allowed");
    });
  });

  it("should return false from checkPermission when denied", async () => {
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.checkPermission).mockResolvedValue({ allowed: false });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await userEvent.click(screen.getByRole("button", { name: /check permission/i }));

    await waitFor(() => {
      expect(screen.getByTestId("perm-result")).toHaveTextContent("denied");
    });
  });

  it("should refresh token on init when token is expired", async () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@test.com",
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

    sessionStorage.setItem("access_token", "old-token");
    sessionStorage.setItem("refresh_token", "old-refresh");
    sessionStorage.setItem("token_expiry", String(Date.now() - 1000));

    vi.mocked(authService.refreshToken).mockResolvedValue({
      accessToken: "new-token",
      refreshToken: "new-refresh",
      expiresIn: 3600,
      tokenType: "Bearer",
      user: mockUser,
    });
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
      expect(screen.getByTestId("username")).toHaveTextContent("testuser");
    });

    expect(authService.refreshToken).toHaveBeenCalled();
  });

  it("should logout and clear user", async () => {
    const mockUser = {
      id: "1",
      username: "testuser",
      email: "test@test.com",
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

    sessionStorage.setItem("access_token", "token");
    sessionStorage.setItem("refresh_token", "refresh");
    sessionStorage.setItem("token_expiry", String(Date.now() + 3600000));

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(authService.logout).mockResolvedValue();

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("username")).toHaveTextContent("testuser");
    });

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("username")).toHaveTextContent("none");
    });
  });
});
