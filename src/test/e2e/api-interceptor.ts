import { Page } from '@playwright/test';

/**
 * API Route Interceptor for E2E Tests
 * Properly mocks backend API calls while allowing frontend navigation
 * Matches actual endpoint patterns from src/api/constants/endpoints.ts
 */

// Mock data helpers
const createMockUser = (overrides: Partial<unknown> = {}) => ({
  id: '1',
  email: 'admin@example.com',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  emailConfirmed: true,
  isExternalLogin: false,
  isActive: true,
  isAdmin: true,
  roles: [{ id: '1', name: 'Admin', description: 'Administrator' }],
  permissions: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
  ...overrides,
});

const createMockRole = (overrides: Partial<unknown> = {}) => ({
  id: '1',
  name: 'Admin',
  description: 'Administrator role',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
  ...overrides,
});

const createMockPermission = (overrides: Partial<unknown> = {}) => ({
  id: '1',
  module: 'Users',
  action: 'Read',
  description: 'View users',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
  ...overrides,
});

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const createPaginatedResponse = <T>(items: T[], page = 1, pageSize = 10): PaginatedResponse<T> => ({
  items,
  page,
  pageSize,
  total: items.length,
  totalPages: Math.ceil(items.length / pageSize),
  hasPreviousPage: page > 1,
  hasNextPage: page * pageSize < items.length,
});

export async function setupApiMocks(page: Page) {
  // Intercept all API calls - use broad pattern to catch requests to any origin
  await page.route(/\/auth\/api\/|\/inventory\/api\/|\/sales\/api\/|\/purchasing\/api\/|\/orders\/api\//, async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    
    try {
      // Auth endpoints - /auth/api/*
      if (url.includes('/auth/api/')) {
        // Login: POST /auth/api/auth/login
        if (url.includes('/auth/login') && method === 'POST') {
          const body = request.postDataJSON();
          if (body.email === 'admin@example.com' && body.password === 'password123') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                accessToken: 'mock-jwt-token',
                refreshToken: 'mock-refresh-token',
                tokenType: 'Bearer',
                expiresIn: 3600,
                user: createMockUser(),
              })
            });
          } else {
            await route.fulfill({
              status: 401,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                message: 'Invalid credentials'
              })
            });
          }
          return;
        }
        
        // Logout: POST /auth/api/auth/logout
        if (url.includes('/auth/logout') && method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
          return;
        }
        
        // Get current user: GET /auth/api/users/me
        if (url.includes('/users/me') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(createMockUser())
          });
          return;
        }
        
        // Register: POST /auth/api/auth/register
        if (url.includes('/auth/register') && method === 'POST') {
          const body = request.postDataJSON();
          if (body && body.email && body.password && body.username) {
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                accessToken: 'mock-jwt-token',
                refreshToken: 'mock-refresh-token',
                tokenType: 'Bearer',
                expiresIn: 3600,
                user: createMockUser({
                  id: '3',
                  email: body.email,
                  username: body.username,
                  firstName: body.firstName,
                  lastName: body.lastName,
                })
              })
            });
          } else {
            await route.fulfill({
              status: 400,
              contentType: 'application/json',
              body: JSON.stringify({
                success: false,
                message: 'Missing required fields'
              })
            });
          }
          return;
        }
        
        // Users endpoints - /auth/api/users/*
        if (url.includes('/users')) {
          // Search users: GET /auth/api/users/search
          if (url.includes('/users/search') && method === 'GET') {
            const mockUsers = [
              createMockUser({ id: '1', email: 'admin@example.com', username: 'admin' }),
              createMockUser({ id: '2', email: 'user@example.com', username: 'user', firstName: 'Regular', lastName: 'User', isAdmin: false }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockUsers))
            });
            return;
          }
          
          // Paginated users: GET /auth/api/users/paginated
          if (url.includes('/users/paginated') && method === 'GET') {
            const mockUsers = [
              createMockUser({ id: '1', email: 'admin@example.com', username: 'admin' }),
              createMockUser({ id: '2', email: 'user@example.com', username: 'user', firstName: 'Regular', lastName: 'User', isAdmin: false }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockUsers))
            });
            return;
          }
          
          // Get all users: GET /auth/api/users
          if (method === 'GET' && !url.includes('/search') && !url.includes('/paginated') && !url.includes('/roles') && !url.includes('/permissions') && !url.includes('/me')) {
            const mockUsers = [
              createMockUser({ id: '1', email: 'admin@example.com', username: 'admin' }),
              createMockUser({ id: '2', email: 'user@example.com', username: 'user', firstName: 'Regular', lastName: 'User', isAdmin: false }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockUsers)
            });
            return;
          }
          
          // Get user by ID: GET /auth/api/users/{id}
          if (method === 'GET' && url.match(/\/users\/[^/]+$/) && !url.includes('/roles') && !url.includes('/permissions')) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createMockUser({ id, email: 'admin@example.com', username: 'admin' }))
            });
            return;
          }
          
          // Create user: POST /auth/api/users/create
          if (url.includes('/users/create') && method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify(createMockUser({
                id: '3',
                email: body.email,
                username: body.username,
                firstName: body.firstName,
                lastName: body.lastName,
              }))
            });
            return;
          }
          
          // Update user: PUT /auth/api/users/{id}
          if (method === 'PUT' && url.match(/\/users\/[^/]+$/)) {
            // const _body = request.postDataJSON();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete user: DELETE /auth/api/users/{id}
          if (method === 'DELETE' && url.match(/\/users\/[^/]+$/)) {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Roles endpoints - /auth/api/roles/*
        if (url.includes('/roles')) {
          // Get all roles: GET /auth/api/roles
          if (method === 'GET' && !url.includes('/permissions') && !url.includes('/paginated') && !url.includes('/search')) {
            const mockRoles = [
              createMockRole({ id: '1', name: 'Admin', description: 'Administrator role' }),
              createMockRole({ id: '2', name: 'User', description: 'Regular user role' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockRoles)
            });
            return;
          }
          
          // Search roles: GET /auth/api/roles/search
          if (url.includes('/roles/search') && method === 'GET') {
            const mockRoles = [
              createMockRole({ id: '1', name: 'Admin', description: 'Administrator role' }),
              createMockRole({ id: '2', name: 'User', description: 'Regular user role' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockRoles))
            });
            return;
          }
          
          // Paginated roles: GET /auth/api/roles/paginated
          if (url.includes('/roles/paginated') && method === 'GET') {
            const mockRoles = [
              createMockRole({ id: '1', name: 'Admin', description: 'Administrator role' }),
              createMockRole({ id: '2', name: 'User', description: 'Regular user role' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockRoles))
            });
            return;
          }
          
          // Get role by ID: GET /auth/api/roles/{id}
          if (method === 'GET' && url.match(/\/roles\/[^/]+$/) && !url.includes('/permissions')) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createMockRole({ id }))
            });
            return;
          }
          
          // Create role: POST /auth/api/roles
          if (method === 'POST' && !url.includes('/permissions')) {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify(createMockRole({
                id: '3',
                name: body.name,
                description: body.description,
              }))
            });
            return;
          }
          
          // Update role: PUT /auth/api/roles/{id}
          if (method === 'PUT' && url.match(/\/roles\/[^/]+$/) && !url.includes('/permissions')) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete role: DELETE /auth/api/roles/{id}
          if (method === 'DELETE' && url.match(/\/roles\/[^/]+$/) && !url.includes('/permissions')) {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
          
          // Get role permissions: GET /auth/api/roles/{id}/permissions
          if (method === 'GET' && url.includes('/permissions') && url.includes('/roles/')) {
            const mockPermissions = [
              createMockPermission({ id: '1', module: 'Users', action: 'Read' }),
              createMockPermission({ id: '2', module: 'Users', action: 'Create' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockPermissions)
            });
            return;
          }
          
          // Add permission to role: POST /auth/api/roles/{id}/permissions?permissionId={permissionId}
          if (method === 'POST' && url.includes('/permissions') && url.includes('/roles/')) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Remove permission from role: DELETE /auth/api/roles/{id}/permissions/{permissionId}
          if (method === 'DELETE' && url.includes('/permissions') && url.includes('/roles/')) {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Permissions endpoints - /auth/api/permissions/*
        if (url.includes('/permissions') && !url.includes('/roles/')) {
          // Get all permissions: GET /auth/api/permissions
          if (method === 'GET' && !url.includes('/paginated') && !url.includes('/search') && !url.includes('/check') && !url.includes('/module-action')) {
            const mockPermissions = [
              createMockPermission({ id: '1', module: 'Users', action: 'Read' }),
              createMockPermission({ id: '2', module: 'Users', action: 'Create' }),
              createMockPermission({ id: '3', module: 'Users', action: 'Update' }),
              createMockPermission({ id: '4', module: 'Users', action: 'Delete' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockPermissions)
            });
            return;
          }
          
          // Search permissions: GET /auth/api/permissions/search
          if (url.includes('/permissions/search') && method === 'GET') {
            const mockPermissions = [
              createMockPermission({ id: '1', module: 'Users', action: 'Read' }),
              createMockPermission({ id: '2', module: 'Users', action: 'Create' }),
              createMockPermission({ id: '3', module: 'Users', action: 'Update' }),
              createMockPermission({ id: '4', module: 'Users', action: 'Delete' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockPermissions))
            });
            return;
          }
          
          // Paginated permissions: GET /auth/api/permissions/paginated
          if (url.includes('/permissions/paginated') && method === 'GET') {
            const mockPermissions = [
              createMockPermission({ id: '1', module: 'Users', action: 'Read' }),
              createMockPermission({ id: '2', module: 'Users', action: 'Create' }),
              createMockPermission({ id: '3', module: 'Users', action: 'Update' }),
              createMockPermission({ id: '4', module: 'Users', action: 'Delete' }),
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockPermissions))
            });
            return;
          }
          
          // Check permission: GET /auth/api/permissions/check?module={module}&action={action}
          if (url.includes('/permissions/check') && method === 'GET') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                allowed: true,
              })
            });
            return;
          }
          
          // Create permission: POST /auth/api/permissions
          if (method === 'POST' && !url.includes('/check')) {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify(createMockPermission({
                id: '5',
                module: body.module,
                action: body.action,
                description: body.description,
              }))
            });
            return;
          }
          
          // Update permission: PUT /auth/api/permissions/{id}
          if (method === 'PUT' && url.match(/\/permissions\/[^/]+$/)) {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete permission: DELETE /auth/api/permissions/{id}
          if (method === 'DELETE' && url.match(/\/permissions\/[^/]+$/)) {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
      }
      
      // Inventory endpoints - /inventory/api/inventory/*
      if (url.includes('/inventory/api/inventory/')) {
        // Products endpoints
        if (url.includes('/products')) {
          // Search products: GET /inventory/api/inventory/products/search
          if (url.includes('/products/search') && method === 'GET') {
            const mockProducts = [
              { id: '1', name: 'Product 1', sku: 'SKU001', unitPrice: 100, price: 100, stock: 50, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Product 2', sku: 'SKU002', unitPrice: 200, price: 200, stock: 30, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockProducts))
            });
            return;
          }
          
          // Paginated products: GET /inventory/api/inventory/products/paginated
          if (url.includes('/products/paginated') && method === 'GET') {
            const mockProducts = [
              { id: '1', name: 'Product 1', sku: 'SKU001', unitPrice: 100, price: 100, stock: 50, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Product 2', sku: 'SKU002', unitPrice: 200, price: 200, stock: 30, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockProducts))
            });
            return;
          }
          
          // Get all products: GET /inventory/api/inventory/products
          if (method === 'GET' && !url.includes('/search') && !url.includes('/paginated') && !url.includes('/sku/') && !url.includes('/low-stock')) {
            const mockProducts = [
              { id: '1', name: 'Product 1', sku: 'SKU001', unitPrice: 100, price: 100, stock: 50, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Product 2', sku: 'SKU002', unitPrice: 200, price: 200, stock: 30, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockProducts)
            });
            return;
          }
          
          // Create product: POST /inventory/api/inventory/products
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update product: PUT /inventory/api/inventory/products/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete product: DELETE /inventory/api/inventory/products/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Warehouses endpoints
        if (url.includes('/warehouses')) {
          // Search warehouses: GET /inventory/api/inventory/warehouses/search
          if (url.includes('/warehouses/search') && method === 'GET') {
            const mockWarehouses = [
              { id: '1', name: 'Main Warehouse', location: 'New York', capacity: 1000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Secondary Warehouse', location: 'Los Angeles', capacity: 500, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockWarehouses))
            });
            return;
          }
          
          // Paginated warehouses: GET /inventory/api/inventory/warehouses/paginated
          if (url.includes('/warehouses/paginated') && method === 'GET') {
            const mockWarehouses = [
              { id: '1', name: 'Main Warehouse', location: 'New York', capacity: 1000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Secondary Warehouse', location: 'Los Angeles', capacity: 500, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockWarehouses))
            });
            return;
          }
          
          // Get all warehouses: GET /inventory/api/inventory/warehouses
          if (method === 'GET' && !url.includes('/search') && !url.includes('/paginated')) {
            const mockWarehouses = [
              { id: '1', name: 'Main Warehouse', location: 'New York', capacity: 1000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Secondary Warehouse', location: 'Los Angeles', capacity: 500, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockWarehouses)
            });
            return;
          }
          
          // Get warehouse by ID: GET /inventory/api/inventory/warehouses/{id}
          if (method === 'GET' && url.match(/\/warehouses\/[^/]+$/)) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id,
                name: 'Main Warehouse',
                location: 'New York',
                capacity: 1000,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Create warehouse: POST /inventory/api/inventory/warehouses
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update warehouse: PUT /inventory/api/inventory/warehouses/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete warehouse: DELETE /inventory/api/inventory/warehouses/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Stock operations endpoints
        if (url.includes('/stock-operations')) {
          // Transfer stock: POST /inventory/api/inventory/stock-operations/transfer
          if (url.includes('/transfer') && method === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'Stock transferred successfully'
              })
            });
            return;
          }
          
          // Reserve stock: POST /inventory/api/inventory/stock-operations/reserve
          if (url.includes('/reserve') && method === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                reservationId: 'res-1',
              })
            });
            return;
          }
          
          // Adjust stock: POST /inventory/api/inventory/stock-operations/adjust
          if (url.includes('/adjust') && method === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'Stock adjusted successfully'
              })
            });
            return;
          }
        }
      }
      
      // Sales endpoints - /sales/api/sales/*
      if (url.includes('/sales/api/sales/')) {
        // Customers endpoints
        if (url.includes('/customers')) {
          // Search customers: GET /sales/api/sales/customers/search
          if (url.includes('/customers/search') && method === 'GET') {
            const mockCustomers = [
              { id: '1', name: 'Customer 1', email: 'customer1@example.com', creditLimit: 50000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Customer 2', email: 'customer2@example.com', creditLimit: 100000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockCustomers))
            });
            return;
          }
          
          // Get all customers: GET /sales/api/sales/customers
          if (method === 'GET' && !url.includes('/search')) {
            const mockCustomers = [
              { id: '1', name: 'Customer 1', email: 'customer1@example.com', creditLimit: 50000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Customer 2', email: 'customer2@example.com', creditLimit: 100000, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockCustomers)
            });
            return;
          }
          
          // Get customer by ID: GET /sales/api/sales/customers/{id}
          if (method === 'GET' && url.match(/\/customers\/[^/]+$/)) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id,
                name: 'Customer 1',
                email: 'customer1@example.com',
                creditLimit: 50000,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Create customer: POST /sales/api/sales/customers
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update customer: PUT /sales/api/sales/customers/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete customer: DELETE /sales/api/sales/customers/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Sales orders endpoints
        if (url.includes('/orders') && !url.includes('/quotes')) {
          // Search sales orders: GET /sales/api/sales/orders/search
          if (url.includes('/orders/search') && method === 'GET') {
            const mockOrders = [
              { id: '1', customerId: '1', orderNumber: 'SO001', total: 1500, status: 0, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', customerId: '2', orderNumber: 'SO002', total: 2500, status: 1, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockOrders))
            });
            return;
          }
          
          // Get all sales orders: GET /sales/api/sales/orders
          if (method === 'GET' && !url.includes('/search') && !url.includes('/quotes')) {
            const mockOrders = [
              { id: '1', customerId: '1', orderNumber: 'SO001', total: 1500, status: 0, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', customerId: '2', orderNumber: 'SO002', total: 2500, status: 1, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockOrders)
            });
            return;
          }
          
          // Get sales order by ID: GET /sales/api/sales/orders/{id}
          if (method === 'GET' && url.match(/\/orders\/[^/]+$/)) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id,
                customerId: '1',
                orderNumber: 'SO001',
                total: 1500,
                status: 0,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Create sales order: POST /sales/api/sales/orders
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update sales order: PUT /sales/api/sales/orders/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete sales order: DELETE /sales/api/sales/orders/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
      }
      
      // Purchasing endpoints - /purchasing/api/purchasing/*
      if (url.includes('/purchasing/api/purchasing/')) {
        // Suppliers endpoints
        if (url.includes('/suppliers')) {
          // Advanced search suppliers: GET /purchasing/api/purchasing/suppliers/advanced-search
          if (url.includes('/suppliers/advanced-search') && method === 'GET') {
            const mockSuppliers = [
              { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', paymentTerms: 'Net30', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Supplier 2', email: 'supplier2@example.com', paymentTerms: 'Net60', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockSuppliers))
            });
            return;
          }
          
          // Search suppliers: GET /purchasing/api/purchasing/suppliers/search
          if (url.includes('/suppliers/search') && method === 'GET') {
            const mockSuppliers = [
              { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', paymentTerms: 'Net30', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Supplier 2', email: 'supplier2@example.com', paymentTerms: 'Net60', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockSuppliers))
            });
            return;
          }
          
          // Get all suppliers: GET /purchasing/api/purchasing/suppliers
          if (method === 'GET' && !url.includes('/search') && !url.includes('/email/') && !url.includes('/advanced-search')) {
            const mockSuppliers = [
              { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', paymentTerms: 'Net30', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', name: 'Supplier 2', email: 'supplier2@example.com', paymentTerms: 'Net60', createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockSuppliers)
            });
            return;
          }
          
          // Get supplier by ID: GET /purchasing/api/purchasing/suppliers/{id}
          if (method === 'GET' && url.match(/\/suppliers\/[^/]+$/) && !url.includes('/email/') && !url.includes('/search')) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id,
                name: 'Supplier 1',
                email: 'supplier1@example.com',
                paymentTerms: 'Net30',
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Create supplier: POST /purchasing/api/purchasing/suppliers
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update supplier: PUT /purchasing/api/purchasing/suppliers/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete supplier: DELETE /purchasing/api/purchasing/suppliers/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
        
        // Purchase orders endpoints
        if (url.includes('/orders')) {
          // Search purchase orders: GET /purchasing/api/purchasing/orders/search
          if (url.includes('/orders/search') && method === 'GET') {
            const mockOrders = [
              { id: '1', supplierId: '1', orderNumber: 'PO001', total: 5000, status: 0, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', supplierId: '2', orderNumber: 'PO002', total: 7500, status: 1, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(createPaginatedResponse(mockOrders))
            });
            return;
          }
          
          // Get all purchase orders: GET /purchasing/api/purchasing/orders
          if (method === 'GET' && !url.includes('/search') && !url.includes('/supplier/') && !url.includes('/status/')) {
            const mockOrders = [
              { id: '1', supplierId: '1', orderNumber: 'PO001', total: 5000, status: 0, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
              { id: '2', supplierId: '2', orderNumber: 'PO002', total: 7500, status: 1, createdAt: '2024-01-01T00:00:00Z', createdBy: 'system' },
            ];
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(mockOrders)
            });
            return;
          }
          
          // Get purchase order by ID: GET /purchasing/api/purchasing/orders/{id}
          if (method === 'GET' && url.match(/\/orders\/[^/]+$/) && !url.includes('/status/') && !url.includes('/approve') && !url.includes('/receive')) {
            const id = url.split('/').pop();
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                id,
                supplierId: '1',
                orderNumber: 'PO001',
                total: 5000,
                status: 0,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Create purchase order: POST /purchasing/api/purchasing/orders
          if (method === 'POST') {
            const body = request.postDataJSON();
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                id: '3',
                ...body,
                createdAt: '2024-01-01T00:00:00Z',
                createdBy: 'system',
              })
            });
            return;
          }
          
          // Update purchase order: PUT /purchasing/api/purchasing/orders/{id}
          if (method === 'PUT') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({})
            });
            return;
          }
          
          // Delete purchase order: DELETE /purchasing/api/purchasing/orders/{id}
          if (method === 'DELETE') {
            await route.fulfill({
              status: 204,
              contentType: 'application/json'
            });
            return;
          }
        }
      }
      
      // Unmatched API request - NEVER hit real backend; return 404
      console.warn('[E2E] Unmatched API request (no mock):', method, url);
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'E2E mock: No handler for this API request. Add a mock in api-interceptor.ts.',
          url,
          method,
        }),
      });
    } catch (error) {
      console.error('API mock error:', error);
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'E2E mock error',
          error: error instanceof Error ? error.message : String(error),
        }),
      });
    }
  });
}

export async function setupAuthenticatedSession(page: Page, token = 'mock-jwt-token') {
  // Ensure tokens are present BEFORE app scripts run
  await page.addInitScript((t) => {
    sessionStorage.setItem('access_token', t);
    sessionStorage.setItem('refresh_token', 'mock-refresh-token');
    // Set expiry to 1 hour from now
    const expiryTime = Date.now() + (60 * 60 * 1000);
    sessionStorage.setItem('token_expiry', expiryTime.toString());
  }, token);

  // If we're already on a page, also set tokens immediately
  try {
    await page.evaluate((t) => {
      sessionStorage.setItem('access_token', t);
      sessionStorage.setItem('refresh_token', 'mock-refresh-token');
      const expiryTime = Date.now() + (60 * 60 * 1000);
      sessionStorage.setItem('token_expiry', expiryTime.toString());
    }, token);
  } catch {
    // Ignore if no document is available yet
  }

  // Set auth header in page context
  await page.setExtraHTTPHeaders({
    'Authorization': `Bearer ${token}`
  });
}

/**
 * Navigate to a protected page with auth already set. Use load (not networkidle) for speed.
 * Call after setupApiMocks. Establishes origin, sets sessionStorage, then navigates.
 */
export async function gotoAuthenticated(
  page: Page,
  path: string,
  options?: { waitForTable?: boolean; timeout?: number; tableTimeout?: number }
) {
  await setupAuthenticatedSession(page);
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: options?.timeout ?? 30000 });
  if (options?.waitForTable) {
    const tableTimeout = options?.tableTimeout ?? 20000;
    const table = page.locator('table');
    const emptyState = page.locator('text=/No .* found./i');
    const errorState = page.locator('.text-destructive');
    await Promise.race([
      table.waitFor({ state: 'visible', timeout: tableTimeout }),
      emptyState.waitFor({ state: 'visible', timeout: tableTimeout }),
      errorState.waitFor({ state: 'visible', timeout: tableTimeout }),
    ]);
  }
}
