import type { User, Role, Permission, AuthResponse } from "@/types/api.types"

export const mockUser: User = {
  id: "user-1",
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  emailConfirmed: false,
  isExternalLogin: false,
  isActive: true,
  isAdmin: false,
  roles: [],
  permissions: [],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
  updatedAt: "2024-01-01T00:00:00Z",
}

export const mockPermission: Permission = {
  id: "perm-1",
  module: "users",
  action: "read",
  description: "Read users",
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
  updatedAt: "2024-01-01T00:00:00Z",
}

export const mockRole: Role = {
  id: "role-1",
  name: "Admin",
  description: "Administrator role",
  permissions: [mockPermission],
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "system",
  updatedAt: "2024-01-01T00:00:00Z",
}

export const mockUserWithRole: User = {
  ...mockUser,
  roles: [mockRole],
}

export const mockAuthResponse: AuthResponse = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresIn: 3600,
  tokenType: "Bearer",
  user: mockUser,
}
