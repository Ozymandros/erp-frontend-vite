/**
 * API Gateway routing constants based on Ocelot configuration
 *
 * IMPORTANT: These endpoints are the FULL upstream paths for Ocelot gateway!
 * Ocelot routes them to backend services without requiring /api duplication.
 *
 * Gateway Base URL: http://localhost:5000 (without /api suffix)
 *
 * Ocelot Routing Pattern:
 * - UpstreamPathTemplate: /auth/api/{everything}
 * - DownstreamPathTemplate: /api/{everything}
 *
 * This means:
 * - Frontend calls: /auth/api/users
 * - Gateway captures: {everything} = "users"
 * - Gateway routes to: /api/users (backend service)
 *
 * Usage:
 * - Set VITE_API_BASE_URL=http://localhost:5000 (NOT http://localhost:5000/api)
 * - Endpoints already include full gateway upstream path
 * - Example: AUTH_ENDPOINTS.LOGIN → '/auth/api/auth/login'
 */

// ==================== SERVICE BASE URLS ====================
// These are the gateway upstream prefixes. Ocelot routes these to backend /api/{everything}

/** Auth service gateway upstream: /auth/api/ → routes to /api/ */
export const AUTH_SERVICE_BASE = "/auth/api";

/** Inventory service gateway upstream: /inventory/api/inventory/ → routes to /api/inventory/ */
export const INVENTORY_SERVICE_BASE = "/inventory/api/inventory";

/** Orders service gateway upstream: /orders/api/ → routes to /api/ */
export const ORDERS_SERVICE_BASE = "/orders/api";

/** Sales service gateway upstream: /sales/api/sales/ → routes to /api/sales/ */
export const SALES_SERVICE_BASE = "/sales/api/sales";

/** Purchasing service gateway upstream: /purchasing/api/purchasing/ → routes to /api/purchasing/ */
export const PURCHASING_SERVICE_BASE = "/purchasing/api/purchasing";

// ==================== AUTH MODULE ENDPOINTS ====================

export const AUTH_ENDPOINTS = {
  // Login has specific Ocelot route: /auth/api/auth/login → /api/auth/login (backend)
  LOGIN: `${AUTH_SERVICE_BASE}/auth/login`,
  REGISTER: `${AUTH_SERVICE_BASE}/auth/register`,
  REFRESH: `${AUTH_SERVICE_BASE}/auth/refresh`,
  LOGOUT: `${AUTH_SERVICE_BASE}/auth/logout`,
  EXTERNAL_LOGIN: (provider: string) =>
    `${AUTH_SERVICE_BASE}/auth/external-login/${provider}`,
  EXTERNAL_CALLBACK: `${AUTH_SERVICE_BASE}/auth/external-callback`,
} as const;

export const USERS_ENDPOINTS = {
  // Gateway: /auth/api/users → Backend: /api/users
  BASE: `${AUTH_SERVICE_BASE}/users`,
  PAGINATED: `${AUTH_SERVICE_BASE}/users/paginated`,
  SEARCH: `${AUTH_SERVICE_BASE}/users/search`,
  CREATE: `${AUTH_SERVICE_BASE}/users/create`,
  ME: `${AUTH_SERVICE_BASE}/users/me`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/users/${id}`,
  BY_EMAIL: (email: string) => `${AUTH_SERVICE_BASE}/users/email/${email}`,
  ASSIGN_ROLE: (userId: string, roleName: string) =>
    `${AUTH_SERVICE_BASE}/users/${userId}/roles/${roleName}`,
  REMOVE_ROLE: (userId: string, roleName: string) =>
    `${AUTH_SERVICE_BASE}/users/${userId}/roles/${roleName}`,
  GET_ROLES: (userId: string) => `${AUTH_SERVICE_BASE}/users/${userId}/roles`,
} as const;

export const ROLES_ENDPOINTS = {
  // Gateway: /auth/api/roles → Backend: /api/roles
  BASE: `${AUTH_SERVICE_BASE}/roles`,
  PAGINATED: `${AUTH_SERVICE_BASE}/roles/paginated`,
  SEARCH: `${AUTH_SERVICE_BASE}/roles/search`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/roles/${id}`,
  BY_NAME: (name: string) => `${AUTH_SERVICE_BASE}/roles/name/${name}`,
  USERS_IN_ROLE: (name: string) => `${AUTH_SERVICE_BASE}/roles/${name}/users`,
  PERMISSIONS: (roleId: string) =>
    `${AUTH_SERVICE_BASE}/roles/${roleId}/permissions`,
  ADD_PERMISSION: (roleId: string) =>
    `${AUTH_SERVICE_BASE}/roles/${roleId}/permissions`,
  REMOVE_PERMISSION: (roleId: string, permissionId: string) =>
    `${AUTH_SERVICE_BASE}/roles/${roleId}/permissions/${permissionId}`,
} as const;

export const PERMISSIONS_ENDPOINTS = {
  // Gateway: /auth/api/permissions → Backend: /api/permissions
  BASE: `${AUTH_SERVICE_BASE}/permissions`,
  PAGINATED: `${AUTH_SERVICE_BASE}/permissions/paginated`,
  SEARCH: `${AUTH_SERVICE_BASE}/permissions/search`,
  BY_ID: (id: string) => `${AUTH_SERVICE_BASE}/permissions/${id}`,
  BY_MODULE_ACTION: `${AUTH_SERVICE_BASE}/permissions/module-action`,
  CHECK: `${AUTH_SERVICE_BASE}/permissions/check`,
} as const;

// ==================== INVENTORY MODULE ENDPOINTS ====================

export const PRODUCTS_ENDPOINTS = {
  // Gateway: /inventory/api/inventory/products → Backend: /api/inventory/products
  BASE: `${INVENTORY_SERVICE_BASE}/products`,
  PAGINATED: `${INVENTORY_SERVICE_BASE}/products/paginated`,
  SEARCH: `${INVENTORY_SERVICE_BASE}/products/search`,
  BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/products/${id}`,
  BY_SKU: (sku: string) => `${INVENTORY_SERVICE_BASE}/products/sku/${sku}`,
  LOW_STOCK: `${INVENTORY_SERVICE_BASE}/products/low-stock`,
} as const;

export const WAREHOUSES_ENDPOINTS = {
  // Gateway: /inventory/api/inventory/warehouses → Backend: /api/inventory/warehouses
  BASE: `${INVENTORY_SERVICE_BASE}/warehouses`,
  PAGINATED: `${INVENTORY_SERVICE_BASE}/warehouses/paginated`,
  SEARCH: `${INVENTORY_SERVICE_BASE}/warehouses/search`,
  BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/warehouses/${id}`,
} as const;

export const WAREHOUSE_STOCKS_ENDPOINTS = {
  BY_PRODUCT_AND_WAREHOUSE: (productId: string, warehouseId: string) =>
    `${INVENTORY_SERVICE_BASE}/warehouse-stocks/${productId}/${warehouseId}`,
  BY_PRODUCT: (productId: string) =>
    `${INVENTORY_SERVICE_BASE}/warehouse-stocks/product/${productId}`,
  BY_WAREHOUSE: (warehouseId: string) =>
    `${INVENTORY_SERVICE_BASE}/warehouse-stocks/warehouse/${warehouseId}`,
  AVAILABILITY: (productId: string) =>
    `${INVENTORY_SERVICE_BASE}/warehouse-stocks/availability/${productId}`,
  LOW_STOCK: `${INVENTORY_SERVICE_BASE}/warehouse-stocks/low-stock`,
} as const;

export const STOCK_OPERATIONS_ENDPOINTS = {
  RESERVE: `${INVENTORY_SERVICE_BASE}/stock-operations/reserve`,
  RELEASE_RESERVATION: (reservationId: string) =>
    `${INVENTORY_SERVICE_BASE}/stock-operations/reservations/${reservationId}`,
  TRANSFER: `${INVENTORY_SERVICE_BASE}/stock-operations/transfer`,
  ADJUST: `${INVENTORY_SERVICE_BASE}/stock-operations/adjust`,
} as const;

export const INVENTORY_TRANSACTIONS_ENDPOINTS = {
  BASE: `${INVENTORY_SERVICE_BASE}/transactions`,
  PAGINATED: `${INVENTORY_SERVICE_BASE}/transactions/paginated`,
  SEARCH: `${INVENTORY_SERVICE_BASE}/transactions/search`,
  BY_ID: (id: string) => `${INVENTORY_SERVICE_BASE}/transactions/${id}`,
  BY_PRODUCT: (productId: string) =>
    `${INVENTORY_SERVICE_BASE}/transactions/product/${productId}`,
  BY_WAREHOUSE: (warehouseId: string) =>
    `${INVENTORY_SERVICE_BASE}/transactions/warehouse/${warehouseId}`,
  BY_TYPE: (type: string) =>
    `${INVENTORY_SERVICE_BASE}/transactions/type/${type}`,
} as const;

// ==================== ORDERS MODULE ENDPOINTS ====================

export const ORDERS_ENDPOINTS = {
  // Gateway: /orders/api/orders → Backend: /api/orders
  BASE: `${ORDERS_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${ORDERS_SERVICE_BASE}/orders/${id}`,
  WITH_RESERVATION: `${ORDERS_SERVICE_BASE}/orders/with-reservation`,
  FULFILL: `${ORDERS_SERVICE_BASE}/orders/fulfill`,
  CANCEL: `${ORDERS_SERVICE_BASE}/orders/cancel`,
} as const;

// ==================== SALES MODULE ENDPOINTS ====================

export const SALES_ORDERS_ENDPOINTS = {
  // Gateway: /sales/api/sales/orders → Backend: /api/sales/orders
  BASE: `${SALES_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${SALES_SERVICE_BASE}/orders/${id}`,
  SEARCH: `${SALES_SERVICE_BASE}/orders/search`,
  QUOTES: `${SALES_SERVICE_BASE}/orders/quotes`,
  CONFIRM_QUOTE: (id: string) =>
    `${SALES_SERVICE_BASE}/orders/quotes/${id}/confirm`,
  CHECK_AVAILABILITY: `${SALES_SERVICE_BASE}/orders/quotes/check-availability`,
} as const;

export const CUSTOMERS_ENDPOINTS = {
  // Gateway: /sales/api/sales/customers → Backend: /api/sales/customers
  BASE: `${SALES_SERVICE_BASE}/customers`,
  BY_ID: (id: string) => `${SALES_SERVICE_BASE}/customers/${id}`,
  SEARCH: `${SALES_SERVICE_BASE}/customers/search`,
} as const;

// ==================== PURCHASING MODULE ENDPOINTS ====================

export const PURCHASE_ORDERS_ENDPOINTS = {
  // Gateway: /purchasing/api/purchasing/orders → Backend: /api/purchasing/orders
  BASE: `${PURCHASING_SERVICE_BASE}/orders`,
  BY_ID: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}`,
  SEARCH: `${PURCHASING_SERVICE_BASE}/orders/search`,
  BY_SUPPLIER: (supplierId: string) =>
    `${PURCHASING_SERVICE_BASE}/orders/supplier/${supplierId}`,
  BY_STATUS: (status: string) =>
    `${PURCHASING_SERVICE_BASE}/orders/status/${status}`,
  UPDATE_STATUS: (id: string, status: string) =>
    `${PURCHASING_SERVICE_BASE}/orders/${id}/status/${status}`,
  APPROVE: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}/approve`,
  RECEIVE: (id: string) => `${PURCHASING_SERVICE_BASE}/orders/${id}/receive`,
} as const;

export const SUPPLIERS_ENDPOINTS = {
  // Gateway: /purchasing/api/purchasing/suppliers → Backend: /api/purchasing/suppliers
  BASE: `${PURCHASING_SERVICE_BASE}/suppliers`,
  BY_ID: (id: string) => `${PURCHASING_SERVICE_BASE}/suppliers/${id}`,
  BY_EMAIL: (email: string) =>
    `${PURCHASING_SERVICE_BASE}/suppliers/email/${email}`,
  SEARCH_BY_NAME: (name: string) =>
    `${PURCHASING_SERVICE_BASE}/suppliers/search/${name}`,
  ADVANCED_SEARCH: `${PURCHASING_SERVICE_BASE}/suppliers/advanced-search`,
} as const;
