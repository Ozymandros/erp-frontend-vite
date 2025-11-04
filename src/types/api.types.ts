// API Response Types based on OpenAPI spec

export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  success: boolean
}

// Base DTO Types
export interface BaseDto<T> {
  id: T
}

export interface IAuditableDto<T> extends BaseDto<T> {
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export abstract class AuditableDto<T = string> implements IAuditableDto<T> {
  public id!: T
  public createdAt!: string
  public createdBy: string = ''
  public updatedAt?: string
  public updatedBy?: string

  constructor(data?: Partial<AuditableDto<T>>) {
    if (data) {
      Object.assign(this, data)
    }
  }
}

// Concrete DTO Classes
export class UserDto extends AuditableDto<string> {
  public username!: string
  public email!: string
  public firstName?: string
  public lastName?: string
  public isActive: boolean = true
  public roles: RoleDto[] = []

  constructor(data?: Partial<UserDto>) {
    super(data)
    if (data) {
      this.roles = data.roles?.map(role => new RoleDto(role)) ?? []
    }
  }
}

export class RoleDto extends AuditableDto<string> {
  public name!: string
  public description?: string
  public permissions: PermissionDto[] = []

  constructor(data?: Partial<RoleDto>) {
    super(data)
    if (data) {
      this.permissions = data.permissions?.map(permission => new PermissionDto(permission)) ?? []
    }
  }
}

export class PermissionDto extends AuditableDto<string> {
  public resource!: string
  public action!: string
  public description?: string

  constructor(data?: Partial<PermissionDto>) {
    super(data)
  }
}

// Utility functions for auditable entities
export const createAuditableEntity = <T extends AuditableDto>(
  ctor: new (data?: any) => T,
  data: any,
  createdBy: string
): T => {
  const entity = new ctor(data)
  entity.createdAt = new Date().toISOString()
  entity.createdBy = createdBy
  return entity
}

export const updateAuditableEntity = <T extends AuditableDto>(
  entity: T,
  updates: Partial<T>,
  updatedBy: string
): T => {
  Object.assign(entity, updates)
  entity.updatedAt = new Date().toISOString()
  entity.updatedBy = updatedBy
  return entity
}

export const isAuditable = (obj: any): obj is IAuditableDto<any> => {
  return obj && 
    typeof obj.id !== 'undefined' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.createdBy === 'string'
}

// DTO Factory for converting API responses to DTO instances
export class DtoFactory {
  static createUser(data: any): UserDto {
    return new UserDto(data)
  }

  static createRole(data: any): RoleDto {
    return new RoleDto(data)
  }

  static createPermission(data: any): PermissionDto {
    return new PermissionDto(data)
  }

  static createUserList(data: any[]): UserDto[] {
    return data.map(item => this.createUser(item))
  }

  static createRoleList(data: any[]): RoleDto[] {
    return data.map(item => this.createRole(item))
  }

  static createPermissionList(data: any[]): PermissionDto[] {
    return data.map(item => this.createPermission(item))
  }
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
export interface User extends IAuditableDto<string> {
  username: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  roles: Role[]
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
export interface Role extends IAuditableDto<string> {
  name: string
  description?: string
  permissions: Permission[]
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
export interface Permission extends IAuditableDto<string> {
  resource: string
  action: string
  description?: string
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
