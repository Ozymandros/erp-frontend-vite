import { getApiClient } from "../clients"
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  PermissionCheckRequest,
  PermissionCheckResponse,
  User,
} from "@/types/api.types"

class AuthService {
  private apiClient = getApiClient()

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>("/auth/login", credentials)
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.apiClient.post<AuthResponse>("/auth/register", data)
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const request: RefreshTokenRequest = { refreshToken }
    return this.apiClient.post<AuthResponse>("/auth/refresh", request)
  }

  async logout(refreshToken: string): Promise<void> {
    return this.apiClient.post<void>("/auth/logout", { refreshToken })
  }

  async getCurrentUser(): Promise<User> {
    return this.apiClient.get<User>("/users/me")
  }

  async checkPermission(resource: string, action: string): Promise<PermissionCheckResponse> {
    const request: PermissionCheckRequest = { resource, action }
    return this.apiClient.post<PermissionCheckResponse>("/permissions/check", request)
  }
}

export const authService = new AuthService()
