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
  public lines: OrderLineDto[] = [];
  public totalAmount!: number;

  constructor(data?: Partial<OrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.lines) {
        this.lines = data.lines.map(l => new OrderLineDto(l));
      }
    }
  }
}

export interface CreateUpdateOrderDto {
  customerId: string;
  lines: CreateUpdateOrderLineDto[];
  orderDate: string;
}

export interface CreateOrderWithReservationDto {
  customerId: string;
  lines: CreateUpdateOrderLineDto[];
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
  public lines: SalesOrderLineDto[] = [];
  // Quote tracking fields
  public isQuote: boolean = false;
  public quoteExpiryDate?: string;
  public convertedToOrderId?: string;
  public returnOrderId?: string | null;
  // Navigation properties
  public customer?: CustomerDto;

  constructor(data?: Partial<SalesOrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.lines) {
        this.lines = data.lines.map(l => new SalesOrderLineDto(l));
      }
    }
  }
}

export interface CreateUpdateSalesOrderDto {
  customerId: string;
  orderDate: string;
  status?: number;
  totalAmount?: number;
  lines: CreateUpdateSalesOrderLineDto[];
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
  lines: CreateUpdateSalesOrderLineDto[];
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

export interface CreateSalesReturnLineDto {
  productId: string;
  quantity: number;
}

export interface CreateSalesReturnDto {
  warehouseId: string;
  lines: CreateSalesReturnLineDto[];
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
  public lines: PurchaseOrderLineDto[] = [];
  public matchStatus?: PurchaseOrderMatchStatus;
  public matchedAt?: string;
  // Navigation properties
  public supplier?: SupplierDto;

  constructor(data?: Partial<PurchaseOrderDto>) {
    super(data);
    if (data) {
      Object.assign(this, data);
      if (data.lines) {
        this.lines = data.lines.map(l => new PurchaseOrderLineDto(l));
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
  lines: CreateUpdatePurchaseOrderLineDto[];
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

export enum PurchaseOrderMatchStatus {
  Unmatched = "Unmatched",
  Partial = "Partial",
  Matched = "Matched",
  Overbilled = "Overbilled",
}

export interface PurchaseOrderMatchResultDto {
  purchaseOrderId: string;
  matchStatus: PurchaseOrderMatchStatus;
  matchedAt?: string;
  summary: string;
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

// ==================== CRM MODULE ====================

export class LeadDto extends AuditableGuidDto {
  public title!: string;
  public source?: string;
  public contactName?: string;
  public contactEmail?: string;
  public contactPhone?: string;
  public customerId?: string;
  public status!: string;
  public ownerUsername!: string;

  constructor(data?: Partial<LeadDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateLeadDto {
  title: string;
  ownerUsername: string;
  source?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateLeadDto {
  title: string;
  source?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface QualifyLeadDto {
  customerId: string;
}

export class AccountDto extends AuditableGuidDto {
  public customerId!: string;
  public name!: string;
  public taxId?: string;
  public billingAddress?: string;
  public shippingAddress?: string;
  public isActive!: boolean;
  public ownerUsername?: string;
  public lastSyncedAt!: string;

  constructor(data?: Partial<AccountDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface UpsertAccountDto {
  customerId: string;
  name: string;
  taxId?: string;
  billingAddress?: string;
  shippingAddress?: string;
  syncedAt?: string;
}

export interface UpdateAccountOwnerDto {
  ownerUsername: string;
}

export class ContactDto extends AuditableGuidDto {
  public accountId!: string;
  public fullName!: string;
  public email?: string;
  public phone?: string;
  public title?: string;
  public isPrimary!: boolean;
  public isActive!: boolean;

  constructor(data?: Partial<ContactDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateContactDto {
  accountId: string;
  fullName: string;
  email?: string;
  phone?: string;
  title?: string;
  isPrimary?: boolean;
}

export interface UpdateContactDto {
  fullName: string;
  email?: string;
  phone?: string;
  title?: string;
}

export interface SetPrimaryContactDto {
  contactId: string;
}

export class ActivityDto extends AuditableGuidDto {
  public subject!: string;
  public type!: string;
  public status!: string;
  public dueAt!: string;
  public completedAt?: string;
  public assignedToUsername!: string;
  public leadId?: string;
  public opportunityId?: string;
  public customerId?: string;

  constructor(data?: Partial<ActivityDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateActivityDto {
  subject: string;
  type: string;
  dueAt: string;
  assignedToUsername: string;
  leadId?: string;
  opportunityId?: string;
  customerId?: string;
}

export interface CompleteActivityDto {
  note?: string;
}

export class OpportunityDto extends AuditableGuidDto {
  public customerId!: string;
  public leadId?: string;
  public name!: string;
  public stage!: string;
  public probability!: number;
  public expectedAmount?: number;
  public expectedCloseDate?: string;
  public convertedSalesQuoteId?: string;
  public convertedSalesQuoteNumber?: string;
  public ownerUsername!: string;

  constructor(data?: Partial<OpportunityDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateOpportunityDto {
  customerId: string;
  name: string;
  ownerUsername: string;
  leadId?: string;
}

export interface UpdateOpportunityForecastDto {
  probability: number;
  expectedAmount?: number;
  expectedCloseDate?: string;
}

export interface MoveOpportunityStageDto {
  stage: string;
}

export interface MarkOpportunityLostDto {
  reason: string;
}

export class OpportunityLineDto extends AuditableGuidDto {
  public opportunityId!: string;
  public productId?: string;
  public sku?: string;
  public description!: string;
  public quantity!: number;
  public unitPrice!: number;
  public discountPercent!: number;
  public lineTotal!: number;

  constructor(data?: Partial<OpportunityLineDto>) {
    super(data);
    if (data) Object.assign(this, data);
  }
}

export interface CreateOpportunityLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  productId?: string;
  sku?: string;
}

export interface UpdateOpportunityLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  productId?: string;
  sku?: string;
}

export interface ForecastByStageDto {
  stage: string;
  count: number;
  sumExpectedAmount?: number;
  weightedAmount: number;
}

export interface ForecastSummaryDto {
  ownerUsername: string;
  fromExpectedCloseDate?: string;
  toExpectedCloseDate?: string;
  totalCount: number;
  totalExpectedAmount?: number;
  totalWeightedAmount: number;
  byStage: ForecastByStageDto[];
}

export interface ConvertOpportunityToQuoteDto {
  validityDays: number;
  lines: unknown[];
  orderDate?: string;
}

export interface MarkOpportunityWonRequest {
  note?: string;
  convertToQuote: boolean;
  quote?: ConvertOpportunityToQuoteDto;
}

// ==================== BILLING MODULE ====================

export interface CreateInvoiceLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
}

export interface CreateInvoiceDto {
  invoiceNumber: string;
  customerId: string;
  orderId?: string | null;
  currency: string;
  lines: CreateInvoiceLineDto[];
  paymentTermsDays?: number;
}

export type InvoiceStatus =
  | "Draft"
  | "Issued"
  | "Sent"
  | "Paid"
  | "Cancelled"
  | "WrittenOff";

export interface InvoiceLineDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineNet: number;
  lineTax: number;
  lineGross: number;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  orderId?: string | null;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  totalNet: number;
  totalTax: number;
  totalGross: number;
  outstandingAmount: number;
  lines: InvoiceLineDto[];
  createdAt: string;
  updatedAt: string;
}

export interface IssueInvoiceRequest {
  invoiceNumber: string;
  issueDate: string;
}

export interface CancelInvoiceRequest {
  reason: string;
}

export interface CreateSupplierInvoiceLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSupplierInvoiceDto {
  purchaseOrderId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  lines: CreateSupplierInvoiceLineDto[];
}

export interface SupplierInvoiceLineDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SupplierInvoiceDto {
  id: string;
  purchaseOrderId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: string;
  currency: string;
  totalAmount: number;
  lines: SupplierInvoiceLineDto[];
  createdAt: string;
  updatedAt: string;
}

export interface RecordPaymentDto {
  amount: number;
  method: string;
  paidAt: string;
  externalPaymentId?: string | null;
}

export interface PaymentDto {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  paidAt: string;
}

export interface CreditNoteLineDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
}

export interface CreateCreditNoteDto {
  lines: CreditNoteLineDto[];
  reason: string;
}

export interface CreditNoteDto {
  id: string;
  originalInvoiceId: string;
  reason: string;
  status: string;
  totalNet: number;
  totalTax: number;
  totalGross: number;
  createdAt: string;
}

// ==================== AUDIT MODULE ====================

export interface PropertyChangeDto {
  id: string;
  propertyName: string;
  originalValue: string | null;
  newValue: string | null;
}

export interface EntityChangeDto {
  id: string;
  entityName: string;
  entityId: string;
  changeType: string;
  originalValue: string | null;
  newValue: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string | null;
  propertyChanges: PropertyChangeDto[];
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
  Invoiced = "Invoiced",
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

// ==================== PROJECTS MODULE ====================

export enum ProjectStatus {
  Planning = 0,
  Quote = 1,
  Open = 2,
  Completed = 3,
}

export enum ProjectBlocked {
  None = 0,
  Posting = 1,
  All = 2,
}

export enum ProjectTaskType {
  Posting = 0,
  Heading = 1,
}

export enum PlanningLineType {
  Budget = 0,
  Billable = 1,
  BudgetAndBillable = 2,
}

export enum ProjectLineKind {
  Resource = 0,
  Item = 1,
  Expense = 2,
  Text = 3,
}

export enum ResourceType {
  Person = 0,
  Machine = 1,
}

export enum ProjectLedgerEntryType {
  Usage = 0,
  Sale = 1,
}

export enum ProjectSourceDocument {
  Manual = 0,
  ConsumptionOrder = 1,
  Invoice = 2,
}

export enum ProjectInvoiceRequestStatus {
  Requested = 0,
  Drafted = 1,
  Invoiced = 2,
  Cancelled = 3,
}

export enum ProjectConsumptionStatus {
  Pending = 0,
  Fulfilled = 1,
  Cancelled = 2,
}

export interface ProjectDto extends IAuditableDto<string> {
  id: string;
  projectNumber: string;
  description: string;
  customerId: string;
  projectManagerUserId?: string;
  status: string;
  blocked: string;
  startingDate?: string;
  endingDate?: string;
  currencyCode: string;
  externalReference?: string;
}

export interface CreateProjectDto {
  description: string;
  customerId: string;
  projectManagerUserId?: string;
  startingDate?: string;
  endingDate?: string;
  currencyCode?: string;
  externalReference?: string;
}

export interface UpdateProjectDto {
  description: string;
  customerId: string;
  projectManagerUserId?: string;
  startingDate?: string;
  endingDate?: string;
  currencyCode: string;
  blocked: ProjectBlocked;
  externalReference?: string;
}

export interface ChangeProjectStatusDto {
  status: ProjectStatus;
}

export interface CopyProjectDto {
  description?: string;
  customerId?: string;
  includePlanningLines?: boolean;
}

export interface ProjectAmountsDto {
  budgetCostLcy: number;
  budgetPrice: number;
  billablePrice: number;
  usageCostLcy: number;
  usagePrice: number;
  invoicedPrice: number;
  invoicedPriceLcy: number;
  remainingBudgetCostLcy?: number;
  profitLcy?: number;
}

export interface TaskStatisticsDto {
  taskId: string;
  parentTaskId?: string;
  taskNo: string;
  description: string;
  taskType: string;
  amounts: ProjectAmountsDto;
}

export interface ProjectStatisticsDto {
  projectId: string;
  currencyCode: string;
  localCurrency: string;
  totals: ProjectAmountsDto;
  tasks: TaskStatisticsDto[];
}

export interface ProjectTaskDto extends IAuditableDto<string> {
  id: string;
  projectId: string;
  parentTaskId?: string;
  taskNo: string;
  description: string;
  taskType: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
}

export interface ProjectTaskTreeNodeDto {
  task: ProjectTaskDto;
  level: number;
  children: ProjectTaskTreeNodeDto[];
}

export interface CreateProjectTaskDto {
  parentTaskId?: string;
  taskNo: string;
  description: string;
  taskType?: ProjectTaskType;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectTaskDto {
  taskNo: string;
  description: string;
  taskType?: ProjectTaskType;
  startDate?: string;
  endDate?: string;
}

export interface MoveProjectTaskDto {
  newParentTaskId?: string;
  sortOrder?: number;
}

export interface PlanningLineDto extends IAuditableDto<string> {
  id: string;
  projectId: string;
  projectTaskId: string;
  lineNo: number;
  lineType: string;
  kind: string;
  resourceId?: string;
  productId?: string;
  warehouseId?: string;
  description: string;
  unitOfMeasure?: string;
  planningDate: string;
  quantity: number;
  unitCostLcy: number;
  unitPrice: number;
  lineDiscountPercent: number;
  currencyCode: string;
  exchangeRate: number;
  totalCostLcy: number;
  lineAmount: number;
  lineAmountLcy: number;
  quantityPosted: number;
  quantityInConsumption: number;
  quantityTransferredToInvoice: number;
  quantityInvoiced: number;
  quantityToInvoice: number;
  remainingQuantity: number;
}

export interface CreateUpdatePlanningLineDto {
  projectTaskId: string;
  lineType?: PlanningLineType;
  kind?: ProjectLineKind;
  resourceId?: string;
  productId?: string;
  warehouseId?: string;
  description?: string;
  unitOfMeasure?: string;
  planningDate?: string;
  quantity: number;
  unitCostLcy?: number;
  unitPrice?: number;
  lineDiscountPercent?: number;
}

export interface ProjectLedgerEntryDto extends IAuditableDto<string> {
  id: string;
  entryNo: number;
  entryType: string;
  postingDate: string;
  projectId: string;
  projectTaskId: string;
  planningLineId?: string;
  kind: string;
  resourceId?: string;
  productId?: string;
  description: string;
  quantity: number;
  unitCostLcy: number;
  totalCostLcy: number;
  unitPrice: number;
  lineAmount: number;
  lineAmountLcy: number;
  currencyCode: string;
  exchangeRate: number;
  sourceDocument: string;
  sourceDocumentId?: string;
  sourceDocumentNo?: string;
}

export interface PostUsageDto {
  projectTaskId: string;
  planningLineId?: string;
  kind?: ProjectLineKind;
  resourceId?: string;
  description?: string;
  quantity: number;
  unitCostLcy?: number;
  unitPrice?: number;
  postingDate?: string;
}

export interface ItemConsumptionLineDto {
  planningLineId: string;
  quantity: number;
}

export interface CreateItemConsumptionDto {
  warehouseId: string;
  postingDate?: string;
  destinationAddress?: string;
  lines: ItemConsumptionLineDto[];
}

export interface ConsumptionOrderLineDto extends IAuditableDto<string> {
  id: string;
  planningLineId: string;
  productId: string;
  quantity: number;
}

export interface ConsumptionOrderDto extends IAuditableDto<string> {
  id: string;
  projectId: string;
  orderId: string;
  orderNumber: string;
  warehouseId: string;
  status: string;
  postingDate: string;
  lines: ConsumptionOrderLineDto[];
}

export interface InvoiceRequestLineInputDto {
  planningLineId: string;
  quantity?: number;
}

export interface CreateInvoiceRequestDto {
  lines?: InvoiceRequestLineInputDto[];
  taxRate: number;
}

export interface InvoiceRequestLineDto extends IAuditableDto<string> {
  id: string;
  planningLineId: string;
  projectTaskId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineAmount: number;
}

export interface InvoiceRequestDto extends IAuditableDto<string> {
  id: string;
  projectId: string;
  customerId: string;
  currencyCode: string;
  status: string;
  requestedAt: string;
  invoiceId?: string;
  invoiceNumber?: string;
  totalAmount: number;
  lines: InvoiceRequestLineDto[];
}

export interface ResourceDto extends IAuditableDto<string> {
  id: string;
  resourceNo: string;
  name: string;
  type: string;
  resourceGroupId?: string;
  resourceGroupCode?: string;
  userId?: string;
  baseUnitOfMeasure: string;
  unitCost: number;
  unitPrice: number;
  dailyCapacity: number;
  blocked: boolean;
}

export interface CreateUpdateResourceDto {
  resourceNo: string;
  name: string;
  type?: ResourceType;
  resourceGroupId?: string;
  userId?: string;
  baseUnitOfMeasure: string;
  unitCost?: number;
  unitPrice?: number;
  dailyCapacity?: number;
  blocked?: boolean;
}

export interface ResourceGroupDto extends IAuditableDto<string> {
  id: string;
  code: string;
  name: string;
}

export interface CreateUpdateResourceGroupDto {
  code: string;
  name: string;
}

export interface ExchangeRateDto extends IAuditableDto<string> {
  id: string;
  currencyId: string;
  startingDate: string;
  rateToLocal: number;
}

export interface ProjectCurrencyDto extends IAuditableDto<string> {
  id: string;
  code: string;
  description: string;
  symbol?: string;
  isLocalCurrency: boolean;
  exchangeRates: ExchangeRateDto[];
}

export interface CreateUpdateCurrencyDto {
  code: string;
  description: string;
  symbol?: string;
}

export interface CreateExchangeRateDto {
  startingDate: string;
  rateToLocal: number;
}
