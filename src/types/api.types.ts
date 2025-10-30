// API Response Types based on OpenAPI spec

export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  success: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface PermissionCheckRequest {
  resource: string
  action: string
}

export interface PermissionCheckResponse {
  allowed: boolean
  reason?: string
}

// User Types
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  roleIds?: string[]
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
  roleIds?: string[]
}

// Role Types
export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissionIds?: string[]
}

// Permission Types
export interface Permission {
  id: string
  resource: string
  action: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePermissionRequest {
  resource: string
  action: string
  description?: string
}

export interface UpdatePermissionRequest {
  resource?: string
  action?: string
  description?: string
}

// Query Parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface SearchParams extends PaginationParams {
  search?: string
}
