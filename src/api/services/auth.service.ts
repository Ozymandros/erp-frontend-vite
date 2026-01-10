import { getApiClient } from "../clients";
import {
  AUTH_ENDPOINTS,
  USERS_ENDPOINTS,
  PERMISSIONS_ENDPOINTS,
} from "../constants/endpoints";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  PermissionCheckRequest,
  PermissionCheckResponse,
  User,
} from "@/types/api.types";

class AuthService {
  private apiClient = getApiClient();

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
  }

  async refreshToken(
    accessToken: string,
    refreshToken: string
  ): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { accessToken, refreshToken };
    return this.apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH, request);
  }

  async logout(): Promise<void> {
    return this.apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT);
  }

  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.ME);
  }

  async checkPermission(
    module: string,
    action: string
  ): Promise<PermissionCheckResponse> {
    const request: PermissionCheckRequest = { module, action };
    return this.apiClient.post<PermissionCheckResponse>(
      PERMISSIONS_ENDPOINTS.CHECK,
      request
    );
  }
}

export const authService = new AuthService();
