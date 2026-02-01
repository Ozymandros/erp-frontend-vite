import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
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
  const { user, isAuthenticated, isLoading, login, logout, register, checkApiPermission, hasPermission, refreshUserData } = useAuth();
  const [permResult, setPermResult] = useState<string>("");
  const [hasPermResult, setHasPermResult] = useState<string>("");
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
        onClick={() => {
          const allowed = hasPermission("Users", "Read");
          setHasPermResult(allowed ? "allowed" : "denied");
        }}
      >
        Has Permission
      </button>
      <span data-testid="has-perm-result">{hasPermResult}</span>
      <button onClick={() => refreshUserData()}>Refresh User Data</button>
      <button
        onClick={async () => {
          const allowed = await checkApiPermission("Users", "Read");
          setPermResult(allowed ? "allowed" : "denied");
        }}
      >
        Check API Permission
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

    await userEvent.click(screen.getByRole("button", { name: /Check API Permission/i }));

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

    await userEvent.click(screen.getByRole("button", { name: /Check API Permission/i }));

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
  
  it("should throw error when useAuth is used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow("useAuth must be used within an AuthProvider");
    consoleSpy.mockRestore();
  });

  it("should handle hasPermission correctly for admin and regular users", async () => {
    const adminUser = {
      id: "1",
      username: "admin",
      isAdmin: true,
      permissions: [],
    };
    
    sessionStorage.setItem("access_token", "token");
    sessionStorage.setItem("refresh_token", "refresh");
    sessionStorage.setItem("token_expiry", String(Date.now() + 3600000));

    vi.mocked(authService.getCurrentUser).mockResolvedValue(adminUser as any);

    const { rerender } = render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("admin"));
    
    await userEvent.click(screen.getByRole("button", { name: /Has Permission/i }));
    expect(screen.getByTestId("has-perm-result")).toHaveTextContent("allowed");

    // Regular user with specific permission
    const regUser = {
      id: "2",
      username: "user",
      isAdmin: false,
      permissions: [{ module: "Users", action: "Read" }],
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(regUser as any);

    // Use a key to force remount of AuthProvider so it runs initAuth again
    rerender(
      <MemoryRouter>
        <AuthProvider key="user">
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("user"));
    
    await userEvent.click(screen.getByRole("button", { name: /Has Permission/i }));
    expect(screen.getByTestId("has-perm-result")).toHaveTextContent("allowed");

    // Case insensitive check
    const regUserCase = {
      id: "2",
      username: "user",
      isAdmin: false,
      permissions: [{ module: "USERS", action: "READ" }],
    };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(regUserCase as any);
    
    rerender(
      <MemoryRouter>
        <AuthProvider key="case">
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );
    
    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("user"));
    await userEvent.click(screen.getByRole("button", { name: /Has Permission/i }));
    expect(screen.getByTestId("has-perm-result")).toHaveTextContent("allowed");
  });

  it("should return false from checkApiPermission and log error on API failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error("No token"));
    vi.mocked(authService.checkPermission).mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
    
    await userEvent.click(screen.getByRole("button", { name: /Check API Permission/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId("perm-result")).toHaveTextContent("denied");
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Permission check failed"), expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should handle refreshUserData correctly", async () => {
    const mockUser = { id: "1", username: "user" };
    sessionStorage.setItem("access_token", "token");
    sessionStorage.setItem("refresh_token", "refresh");
    sessionStorage.setItem("token_expiry", String(Date.now() + 3600000));
    
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("user"));
    
    const updatedUser = { id: "1", username: "updated" };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(updatedUser as any);
    
    await userEvent.click(screen.getByRole("button", { name: /Refresh User Data/i }));
    
    await waitFor(() => expect(screen.getByTestId("username")).toHaveTextContent("updated"));
  });

  it("should log error when initAuth fails during token refresh", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.setItem("access_token", "old");
    sessionStorage.setItem("refresh_token", "old");
    sessionStorage.setItem("token_expiry", String(Date.now() - 1000));

    vi.mocked(authService.refreshToken).mockRejectedValue(new Error("Refresh Failed"));

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
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("Failed to refresh token on init"), expect.any(Error));
    consoleSpy.mockRestore();
  });

  it("should auto-refresh token before expiry", async () => {
    vi.useFakeTimers();
    const mockUser = { id: "1", username: "user" };
    sessionStorage.setItem("access_token", "token");
    sessionStorage.setItem("refresh_token", "refresh");
    
    // AuthProvider check interval is 60s. 
    // It refreshes if timeUntilExpiry < 5 mins.
    // Set expiry to 4 mins from now.
    const expiryTime = Date.now() + 4 * 60 * 1000;
    sessionStorage.setItem("token_expiry", String(expiryTime));

    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(authService.refreshToken).mockResolvedValue({
      accessToken: "new",
      refreshToken: "new",
      expiresIn: 3600,
      user: mockUser,
    } as any);

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>
    );

    // Initial load - use act to allow effects to run
    // Since initAuth is async, we might need to advance timers or just wait for it to resolve
    // But we are in fake timer mode. 
    // Let's try to advance a bit to trigger the mount effects.
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Advance more to trigger the 60s check
    await act(async () => {
      vi.advanceTimersByTime(61 * 1000);
    });
    
    expect(authService.refreshToken).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
