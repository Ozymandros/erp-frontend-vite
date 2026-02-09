/* eslint-disable @typescript-eslint/no-explicit-any */
// API Response Types based on OpenAPI spec

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

// Base DTO Types
export interface IDto<T> {
  id: T;
}

export abstract class BaseDto<T> implements IDto<T> {
  public id!: T;

  constructor(_data?: Partial<BaseDto<T>>) {
    // Moved Object.assign to leaf constructors to avoid issues with initializers
  }
}

export interface IAuditableDto<T> extends IDto<T> {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export abstract class AuditableDto<T> extends BaseDto<T> implements IAuditableDto<T> {
  public createdAt: string = new Date().toISOString();
  public createdBy: string = "system";
  public updatedAt?: string;
  public updatedBy?: string;

  constructor(data?: Partial<AuditableDto<T>>) {
    super(data);
  }
}

export abstract class AuditableGuidDto extends AuditableDto<string> {
  constructor(data?: Partial<AuditableGuidDto>) {
    super(data);
  }
}

// Concrete DTO Classes
export class UserDto extends AuditableGuidDto {
  public username!: string;
  public email!: string;
  public firstName?: string;
  public lastName?: string;
  public emailConfirmed: boolean = false;
  public isExternalLogin: boolean = false;
  public externalProvider?: string;
  public isActive: boolean = true;
  public isAdmin: boolean = false;
  public roles: RoleDto[] = [];
  public permissions: PermissionDto[] = [];

  constructor(data?: Partial<UserDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      this.roles = data.roles?.map(role => new RoleDto(role)) ?? [];
      this.permissions =
        data.permissions?.map(permission => new PermissionDto(permission)) ??
        [];
    }
  }
}

export class RoleDto extends AuditableGuidDto {
  public name!: string;
  public description?: string;
  public permissions: PermissionDto[] = [];

  constructor(data?: Partial<RoleDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      this.permissions =
        data.permissions?.map(permission => new PermissionDto(permission)) ??
        [];
    }
  }
}

export class PermissionDto extends AuditableGuidDto {
  public module!: string;
  public action!: string;
  public description?: string;

  constructor(data?: Partial<PermissionDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

// Utility functions for auditable entities
export const createAuditableEntity = <T extends AuditableDto<any>>(
  ctor: new (data?: any) => T,
  data: any,
  createdBy: string
): T => {
  const entity = new ctor(data);
  entity.createdAt = new Date().toISOString();
  entity.createdBy = createdBy;
  return entity;
};

export const updateAuditableEntity = <T extends AuditableDto<any>>(
  entity: T,
  updates: Partial<T>,
  updatedBy: string
): T => {
  Object.assign(entity, updates);
  entity.updatedAt = new Date().toISOString();
  entity.updatedBy = updatedBy;
  return entity;
};

export const isAuditable = (obj: any): obj is IAuditableDto<any> => {
  return (
    obj?.id !== undefined &&
    typeof obj.createdAt === "string" &&
    typeof obj.createdBy === "string"
  );
};

// DTO Factory for converting API responses to DTO instances
export class DtoFactory {
  static createUser(data: any): UserDto {
    return new UserDto(data);
  }

  static createRole(data: any): RoleDto {
    return new RoleDto(data);
  }

  static createPermission(data: any): PermissionDto {
    return new PermissionDto(data);
  }

  static createUserList(data: any[]): UserDto[] {
    return data?.map(item => this.createUser(item));
  }

  static createRoleList(data: any[]): RoleDto[] {
    return data?.map(item => this.createRole(item));
  }

  static createPermissionList(data: any[]): PermissionDto[] {
    return data?.map(item => this.createPermission(item));
  }
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ProblemDetails for ASP.NET Core validation errors
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Pagination and Query Types
export interface PaginatedResponse<T> {
  items: T[];
  page: number; // Maps to backend PageNumber (JSON property name)
  pageSize: number;
  total: number; // Maps to backend TotalCount (JSON property name)
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface QuerySpec {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  filters?: Record<string, string>;
  searchFields?: string;
  searchTerm?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  search?: string;
}

// ==================== AUTH MODULE ====================

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ExternalLoginDto {
  provider: string;
  externalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface PermissionCheckRequest {
  module: string;
  action: string;
}

export interface PermissionCheckResponse {
  allowed: boolean;
  reason?: string;
}

// User Types
export interface User extends IAuditableDto<string> {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailConfirmed: boolean;
  isExternalLogin: boolean;
  externalProvider?: string;
  isActive: boolean;
  isAdmin: boolean;
  roles: Role[];
  permissions: Permission[];
}

export interface CreateUserRequest {
  id?: string; // Optional Guid for backend
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// Role Types
export interface Role extends IAuditableDto<string> {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

// Permission Types
export interface Permission extends IAuditableDto<string> {
  module: string;
  action: string;
  description?: string;
}

export interface CreatePermissionRequest {
  module: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  module: string;
  action: string;
  description?: string;
}

// ==================== INVENTORY MODULE ====================

// Product Types
export class ProductDto extends AuditableGuidDto {
  public sku!: string;
  public name!: string;
  public description?: string;
  public unitPrice!: number;
  public quantityInStock!: number;
  public reorderLevel!: number;

  constructor(data?: Partial<ProductDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateProductDto {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantityInStock?: number;
  reorderLevel: number;
}

// Warehouse Types
export class WarehouseDto extends AuditableGuidDto {
  public name!: string;
  public location!: string;

  constructor(data?: Partial<WarehouseDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateWarehouseDto {
  name: string;
  location: string;
}

// Warehouse Stock Types
export class WarehouseStockDto extends AuditableGuidDto {
  public productId!: string;
  public warehouseId!: string;
  public quantity!: number;
  public reservedQuantity!: number;
  public reorderLevel!: number;
  public lastUpdated!: string;

  constructor(data?: Partial<WarehouseStockDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface StockAvailabilityDto {
  productId: string;
  totalAvailable: number;
  warehouseStocks: WarehouseStockDto[];
}

// Stock Operations Types
export interface ReserveStockDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  orderId: string;
  expiresAt?: string;
}

export class ReservationDto extends AuditableGuidDto {
  public productId!: string;
  public warehouseId!: string;
  public quantity!: number;
  public orderId!: string;
  public reservedAt!: string;
  public expiresAt!: string;

  constructor(data?: Partial<ReservationDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface StockTransferDto {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reason: string;
}

export interface StockAdjustmentDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  adjustmentType: AdjustmentType;
}

// Inventory Transaction Types
export class InventoryTransactionDto extends AuditableGuidDto {
  public transactionType!: TransactionType;
  public productId!: string;
  public warehouseId!: string;
  public quantity!: number;
  public referenceId?: string;
  public referenceType?: string;
  public reason?: string;
  public transactionDate!: string;

  constructor(data?: Partial<InventoryTransactionDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateInventoryTransactionDto {
  transactionType: TransactionType;
  productId: string;
  warehouseId: string;
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
  transactionDate: string;
}

// ==================== ORDERS MODULE ====================

export class OrderDto extends AuditableGuidDto {
  public orderNumber!: string;
  public status!: OrderStatus;
  public orderDate!: string;
  public customerId!: string;
  public orderLines: OrderLineDto[] = [];
  public totalAmount!: number;

  constructor(data?: Partial<OrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.orderLines) {
        this.orderLines = data.orderLines.map(l => new OrderLineDto(l));
      }
    }
  }
}

export interface CreateUpdateOrderDto {
  customerId: string;
  orderLines: CreateUpdateOrderLineDto[];
  orderDate: string;
}

export interface CreateOrderWithReservationDto {
  customerId: string;
  orderLines: CreateUpdateOrderLineDto[];
  orderDate: string;
}

export interface CreateUpdateOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface FulfillOrderDto {
  orderId: string;
  fulfillmentDate: string;
}

export interface CancelOrderDto {
  orderId: string;
  cancellationReason: string;
}

export class OrderLineDto extends AuditableGuidDto {
  public productId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;

  constructor(data?: Partial<OrderLineDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

// ==================== SALES MODULE ====================

export class SalesOrderDto extends AuditableGuidDto {
  public orderNumber!: string;
  public customerId!: string;
  public status!: SalesOrderStatus;
  public orderDate!: string;
  public totalAmount!: number;
  public orderLines: SalesOrderLineDto[] = [];
  // Quote tracking fields
  public isQuote: boolean = false;
  public quoteExpiryDate?: string;
  public convertedToOrderId?: string;
  // Navigation properties
  public customer?: CustomerDto;

  constructor(data?: Partial<SalesOrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.orderLines) {
        this.orderLines = data.orderLines.map(l => new SalesOrderLineDto(l));
      }
    }
  }
}

export interface CreateUpdateSalesOrderDto {
  customerId: string;
  orderDate: string;
  status?: number;
  totalAmount?: number;
  orderLines: CreateUpdateSalesOrderLineDto[];
}

export class SalesOrderLineDto extends AuditableGuidDto {
  public salesOrderId!: string;
  public productId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public lineTotal!: number;

  constructor(data?: Partial<SalesOrderLineDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateSalesOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteDto {
  customerId: string;
  orderDate: string;
  validityDays?: number;
  orderLines: CreateUpdateSalesOrderLineDto[];
}

export interface ConfirmQuoteDto {
  quoteId: string;
  warehouseId: string;
  shippingAddress?: string;
}

export interface ConfirmQuoteResponseDto {
  convertedToOrderId: string;
  salesOrder: SalesOrderDto;
}

export interface StockAvailabilityCheckDto {
  productId: string;
  requestedQuantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  warehouseStock: WarehouseAvailabilityDto[];
}

export interface WarehouseAvailabilityDto {
  warehouseId: string;
  warehouseName: string;
  availableQuantity: number;
}

export class CustomerDto extends AuditableGuidDto {
  public name!: string;
  public email!: string;
  public phoneNumber?: string;
  public address?: string;

  constructor(data?: Partial<CustomerDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateCustomerDto {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
}

// ==================== PURCHASING MODULE ====================

export class PurchaseOrderDto extends AuditableGuidDto {
  public orderNumber!: string;
  public supplierId!: string;
  public status!: PurchaseOrderStatus;
  public orderDate!: string;
  public expectedDeliveryDate?: string;
  public totalAmount!: number;
  public orderLines: PurchaseOrderLineDto[] = [];
  // Navigation properties
  public supplier?: SupplierDto;

  constructor(data?: Partial<PurchaseOrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.orderLines) {
        this.orderLines = data.orderLines.map(l => new PurchaseOrderLineDto(l));
      }
    }
  }
}

export interface CreateUpdatePurchaseOrderDto {
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  status?: number;
  totalAmount?: number;
  orderLines: CreateUpdatePurchaseOrderLineDto[];
}

export class PurchaseOrderLineDto extends AuditableGuidDto {
  public purchaseOrderId!: string;
  public productId!: string;
  public quantity!: number;
  public unitPrice!: number;
  public lineTotal!: number;

  constructor(data?: Partial<PurchaseOrderLineDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdatePurchaseOrderLineDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface ApprovePurchaseOrderDto {
  purchaseOrderId: string;
  notes?: string;
}

export interface ReceivePurchaseOrderDto {
  purchaseOrderId: string;
  warehouseId: string;
  receivedDate: string;
  notes?: string;
  lines: ReceivePurchaseOrderLineDto[];
}

export interface ReceivePurchaseOrderLineDto {
  purchaseOrderLineId: string;
  receivedQuantity: number;
  notes?: string;
}

export class SupplierDto extends AuditableGuidDto {
  public name!: string;
  public email!: string;
  public phone?: string;
  public address?: string;
  public city?: string;
  public country?: string;
  public postalCode?: string;
  public isActive: boolean = true;

  constructor(data?: Partial<SupplierDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateUpdateSupplierDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  isActive: boolean;
}

// ==================== ENUMS ====================

export enum TransactionType {
  Purchase = "Purchase",
  Sale = "Sale",
  Adjustment = "Adjustment",
  Transfer = "Transfer",
  Return = "Return",
  Damage = "Damage",
  Loss = "Loss",
}

export enum OrderStatus {
  Pending = "Pending",
  Processing = "Processing",
  Fulfilled = "Fulfilled",
  Cancelled = "Cancelled",
  Shipped = "Shipped",
  Delivered = "Delivered",
}

export enum SalesOrderStatus {
  Draft = "Draft",
  Quote = "Quote",
  Confirmed = "Confirmed",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export enum PurchaseOrderStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Ordered = "Ordered",
  PartiallyReceived = "PartiallyReceived",
  Received = "Received",
  Cancelled = "Cancelled",
}

export enum AdjustmentType {
  Increase = "Increase",
  Decrease = "Decrease",
  Found = "Found",
  Lost = "Lost",
  Damaged = "Damaged",
  Expired = "Expired",
}
