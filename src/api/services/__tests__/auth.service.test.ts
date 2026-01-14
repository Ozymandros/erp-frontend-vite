import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PermissionCheckResponse,
  User,
} from "@/types/api.types";

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("@/api/clients", () => ({
  getApiClient: () => mockApiClient,
}));

// Import after mocking - services will be instantiated with mocked client
const { authService } = await import("@/api/services/auth.service");

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should login with credentials", async () => {
      const credentials: LoginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      const mockResponse: AuthResponse = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresIn: 3600,
        tokenType: "Bearer",
        user: {
          id: "1",
          email: "test@example.com",
          username: "testuser",
        } as User,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/auth/login",
        credentials
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("register", () => {
    it("should register a new user", async () => {
      const registerData: RegisterRequest = {
        email: "newuser@example.com",
        username: "newuser",
        password: "password123",
        passwordConfirm: "password123",
        firstName: "New",
        lastName: "User",
      };

      const mockResponse: AuthResponse = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresIn: 3600,
        tokenType: "Bearer",
        user: {
          id: "2",
          email: "newuser@example.com",
          username: "newuser",
        } as User,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register(registerData);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/auth/register",
        registerData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("refreshToken", () => {
    it("should refresh access token", async () => {
      const accessToken = "old-access-token";
      const refreshToken = "refresh-token";

      const mockResponse: AuthResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresIn: 3600,
        tokenType: "Bearer",
        user: {
          id: "1",
          email: "test@example.com",
        } as User,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken(accessToken, refreshToken);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/auth/refresh",
        { accessToken, refreshToken }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await authService.logout();

      expect(mockApiClient.post).toHaveBeenCalledWith("/auth/api/auth/logout");
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user", async () => {
      const mockUser: User = {
        id: "1",
        email: "test@example.com",
        username: "testuser",
      } as User;

      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith("/auth/api/users/me");
      expect(result).toEqual(mockUser);
    });
  });

  describe("checkPermission", () => {
    it("should check permission", async () => {
      const module = "users";
      const action = "create";

      const mockResponse: PermissionCheckResponse = {
        allowed: true,
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.checkPermission(module, action);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/auth/api/permissions/check",
        { module, action }
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
