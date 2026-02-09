/* eslint-disable @typescript-eslint/no-explicit-any */
import { Page, Route } from '@playwright/test';
import { AUTH_SERVICE_BASE, INVENTORY_SERVICE_BASE, SALES_SERVICE_BASE, PURCHASING_SERVICE_BASE } from '../../api/constants/endpoints';

/**
 * API Mocking utilities for Playwright E2E tests
 * 
 * These helpers allow you to mock backend API calls and return predictable responses
 * for testing frontend functionality in isolation.
 */

export interface MockOptions {
  status?: number;
  delay?: number;
  contentType?: string;
}

/**
 * Mock a successful API response
 */
export async function mockApiSuccess<T>(
  page: Page,
  urlPattern: string | RegExp,
  responseData: T,
  options: MockOptions = {}
): Promise<void> {
  const { status = 200, delay = 0, contentType = 'application/json' } = options;
  
  await page.route(urlPattern, async (route: Route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await route.fulfill({
      status,
      contentType,
      body: JSON.stringify(responseData),
    });
  });
}

/**
 * Mock an API error response
 */
export async function mockApiError(
  page: Page,
  urlPattern: string | RegExp,
  errorMessage: string,
  status: number = 400,
  options: MockOptions = {}
): Promise<void> {
  const { delay = 0 } = options;
  
  await page.route(urlPattern, async (route: Route) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Validation Error',
        status,
        detail: errorMessage,
        errors: {},
      }),
    });
  });
}

/**
 * Mock a paginated API response
 */
export async function mockPaginatedResponse<T>(
  page: Page,
  urlPattern: string | RegExp,
  items: T[],
  page_num: number = 1,
  pageSize: number = 10,
  options: MockOptions = {}
): Promise<void> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page_num - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  
  await mockApiSuccess(page, urlPattern, {
    items: pageItems,
    page: page_num,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page_num > 1,
    hasNextPage: page_num < totalPages,
  }, options);
}

// ==================== AUTH SERVICE MOCKS ====================

/**
 * Mock successful login
 */
export async function mockLogin(
  page: Page,
  authResponse: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: any;
  }
): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/auth/login`,
    authResponse
  );
}

/**
 * Mock login failure (invalid credentials)
 */
export async function mockLoginFailure(page: Page): Promise<void> {
  await mockApiError(
    page,
    `**${AUTH_SERVICE_BASE}/auth/login`,
    'Invalid email or password',
    401
  );
}

/**
 * Mock getting current user info
 */
export async function mockGetCurrentUser(page: Page, user: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/users/me`,
    user
  );
}

/**
 * Mock logout
 */
export async function mockLogout(page: Page): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/auth/logout`,
    { success: true }
  );
}

/**
 * Mock users list (paginated)
 */
export async function mockGetUsers(page: Page, users: any[]): Promise<void> {
  await mockPaginatedResponse(
    page,
    `**${AUTH_SERVICE_BASE}/users/paginated**`,
    users
  );
}

/**
 * Mock user by ID
 */
export async function mockGetUserById(page: Page, userId: string, user: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/users/${userId}`,
    user
  );
}

/**
 * Mock create user
 */
export async function mockCreateUser(page: Page, user: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/users/create`,
    user,
    { status: 201 }
  );
}

/**
 * Mock update user
 */
export async function mockUpdateUser(page: Page, userId: string, user: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/users/${userId}`,
    user
  );
}

/**
 * Mock delete user
 */
export async function mockDeleteUser(page: Page, userId: string): Promise<void> {
  await mockApiSuccess(
    page,
    `**${AUTH_SERVICE_BASE}/users/${userId}`,
    { success: true },
    { status: 204 }
  );
}

/**
 * Mock roles list
 */
export async function mockGetRoles(page: Page, roles: any[]): Promise<void> {
  await mockPaginatedResponse(
    page,
    `**${AUTH_SERVICE_BASE}/roles/paginated**`,
    roles
  );
}

/**
 * Mock permissions list
 */
export async function mockGetPermissions(page: Page, permissions: any[]): Promise<void> {
  await mockPaginatedResponse(
    page,
    `**${AUTH_SERVICE_BASE}/permissions/paginated**`,
    permissions
  );
}

// ==================== INVENTORY SERVICE MOCKS ====================

/**
 * Mock products list (paginated)
 */
export async function mockGetProducts(page: Page, products: any[]): Promise<void> {
  await mockPaginatedResponse(
    page,
    `**${INVENTORY_SERVICE_BASE}/products/paginated**`,
    products
  );
}

/**
 * Mock product by ID
 */
export async function mockGetProductById(page: Page, productId: string, product: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/products/${productId}`,
    product
  );
}

/**
 * Mock create product
 */
export async function mockCreateProduct(page: Page, product: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/products`,
    product,
    { status: 201 }
  );
}

/**
 * Mock update product
 */
export async function mockUpdateProduct(page: Page, productId: string, product: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/products/${productId}`,
    product
  );
}

/**
 * Mock delete product
 */
export async function mockDeleteProduct(page: Page, productId: string): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/products/${productId}`,
    { success: true },
    { status: 204 }
  );
}

/**
 * Mock warehouses list (paginated)
 */
export async function mockGetWarehouses(page: Page, warehouses: any[]): Promise<void> {
  await mockPaginatedResponse(
    page,
    `**${INVENTORY_SERVICE_BASE}/warehouses/paginated**`,
    warehouses
  );
}

/**
 * Mock warehouse by ID
 */
export async function mockGetWarehouseById(page: Page, warehouseId: string, warehouse: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/warehouses/${warehouseId}`,
    warehouse
  );
}

/**
 * Mock create warehouse
 */
export async function mockCreateWarehouse(page: Page, warehouse: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/warehouses`,
    warehouse,
    { status: 201 }
  );
}

/**
 * Mock update warehouse
 */
export async function mockUpdateWarehouse(page: Page, warehouseId: string, warehouse: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/warehouses/${warehouseId}`,
    warehouse
  );
}

/**
 * Mock delete warehouse
 */
export async function mockDeleteWarehouse(page: Page, warehouseId: string): Promise<void> {
  await mockApiSuccess(
    page,
    `**${INVENTORY_SERVICE_BASE}/warehouses/${warehouseId}`,
    { success: true },
    { status: 204 }
  );
}

// ==================== SALES SERVICE MOCKS ====================

/**
 * Mock customers list (paginated)
 */
export async function mockGetCustomers(page: Page, customers: any[]): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/customers/search**`,
    customers
  );
}

/**
 * Mock customer by ID
 */
export async function mockGetCustomerById(page: Page, customerId: string, customer: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/customers/${customerId}`,
    customer
  );
}

/**
 * Mock create customer
 */
export async function mockCreateCustomer(page: Page, customer: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/customers`,
    customer,
    { status: 201 }
  );
}

/**
 * Mock sales orders list
 */
export async function mockGetSalesOrders(page: Page, orders: any[]): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/orders/search**`,
    orders
  );
}

/**
 * Mock sales order by ID
 */
export async function mockGetSalesOrderById(page: Page, orderId: string, order: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/orders/${orderId}`,
    order
  );
}

/**
 * Mock create sales order
 */
export async function mockCreateSalesOrder(page: Page, order: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${SALES_SERVICE_BASE}/orders`,
    order,
    { status: 201 }
  );
}

// ==================== PURCHASING SERVICE MOCKS ====================

/**
 * Mock suppliers list
 */
export async function mockGetSuppliers(page: Page, suppliers: any[]): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/suppliers/advanced-search**`,
    suppliers
  );
}

/**
 * Mock supplier by ID
 */
export async function mockGetSupplierById(page: Page, supplierId: string, supplier: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/suppliers/${supplierId}`,
    supplier
  );
}

/**
 * Mock create supplier
 */
export async function mockCreateSupplier(page: Page, supplier: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/suppliers`,
    supplier,
    { status: 201 }
  );
}

/**
 * Mock purchase orders list
 */
export async function mockGetPurchaseOrders(page: Page, orders: any[]): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/orders/search**`,
    orders
  );
}

/**
 * Mock purchase order by ID
 */
export async function mockGetPurchaseOrderById(page: Page, orderId: string, order: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/orders/${orderId}`,
    order
  );
}

/**
 * Mock create purchase order
 */
export async function mockCreatePurchaseOrder(page: Page, order: any): Promise<void> {
  await mockApiSuccess(
    page,
    `**${PURCHASING_SERVICE_BASE}/orders`,
    order,
    { status: 201 }
  );
}

/**
 * Mock all common API calls for authenticated pages
 * This sets up the baseline mocks that most tests will need
 */
export async function mockAuthenticatedState(page: Page, user: any): Promise<void> {
  await mockGetCurrentUser(page, user);
  await mockGetRoles(page, user.roles || []);
  await mockGetPermissions(page, user.permissions || []);
}
