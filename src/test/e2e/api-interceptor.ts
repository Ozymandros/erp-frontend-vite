import { Page } from '@playwright/test';

/**
 * API Route Interceptor for E2E Tests
 * Properly mocks backend API calls while allowing frontend navigation
 */

export async function setupApiMocks(page: Page) {
  // Intercept all API calls
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    
    try {
      // Auth endpoints
      if (url.includes('/auth/api/')) {
        if (url.includes('login') && method === 'POST') {
          const body = request.postDataJSON();
          if (body.email === 'admin@example.com' && body.password === 'password123') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                data: {
                  token: 'mock-jwt-token',
                  user: {
                    id: '1',
                    email: 'admin@example.com',
                    name: 'Admin User',
                    role: 'Admin',
                    permissions: ['*'],
                    isActive: true
                  }
                }
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
        
        if (url.includes('logout') && method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          });
          return;
        }
        
        if (url.includes('current-user') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'Admin',
                permissions: ['*'],
                isActive: true
              }
            })
          });
          return;
        }
        
        if (url.includes('register') && method === 'POST') {
          const body = request.postDataJSON();
          if (body && body.email && body.password && body.username) {
            // Simulate successful registration
            await route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                success: true,
                message: 'User registered successfully',
                data: {
                  id: '3',
                  email: body.email,
                  username: body.username,
                  name: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
                  isActive: true
                }
              })
            });
          } else {
            // Validation error
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
      }
      
      // Inventory endpoints
      if (url.includes('/inventory/api/')) {
        if (url.includes('/products') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Product 1', sku: 'SKU001', price: 100, stock: 50 },
                { id: '2', name: 'Product 2', sku: 'SKU002', price: 200, stock: 30 }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/products') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/products') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
        
        if (url.includes('/warehouses') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Main Warehouse', location: 'New York', capacity: 1000 },
                { id: '2', name: 'Secondary Warehouse', location: 'Los Angeles', capacity: 500 }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/warehouses') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/warehouses') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
      }
      
      // Sales endpoints
      if (url.includes('/orders/api/')) {
        if (url.includes('/customers') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Customer 1', email: 'customer1@example.com', creditLimit: 50000 },
                { id: '2', name: 'Customer 2', email: 'customer2@example.com', creditLimit: 100000 }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/customers') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/customers') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
        
        if (url.includes('/sales-orders') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', customerId: '1', orderNumber: 'SO001', total: 1500, status: 'Pending' },
                { id: '2', customerId: '2', orderNumber: 'SO002', total: 2500, status: 'Confirmed' }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/sales-orders') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/sales-orders') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
      }
      
      // Purchasing endpoints
      if (url.includes('/purchasing/api/')) {
        if (url.includes('/suppliers') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Supplier 1', email: 'supplier1@example.com', paymentTerms: 'Net30' },
                { id: '2', name: 'Supplier 2', email: 'supplier2@example.com', paymentTerms: 'Net60' }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/suppliers') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/suppliers') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
        
        if (url.includes('/purchase-orders') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', supplierId: '1', orderNumber: 'PO001', total: 5000, status: 'Draft' },
                { id: '2', supplierId: '2', orderNumber: 'PO002', total: 7500, status: 'Approved' }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/purchase-orders') && (method === 'POST' || method === 'PUT')) {
          const body = request.postDataJSON();
          await route.fulfill({
            status: method === 'POST' ? 201 : 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: { id: body.id || '3', ...body }
            })
          });
          return;
        }
        
        if (url.includes('/purchase-orders') && method === 'DELETE') {
          await route.fulfill({
            status: 204,
            contentType: 'application/json'
          });
          return;
        }
      }
      
      // User management endpoints
      if (url.includes('/users/api/') || url.includes('/roles/api/') || url.includes('/permissions/api/')) {
        if (url.includes('/users') && method === 'GET' && !url.includes('/roles') && !url.includes('/permissions')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', email: 'admin@example.com', username: 'admin', isActive: true, roles: ['Admin'] },
                { id: '2', email: 'user@example.com', username: 'user', isActive: true, roles: ['User'] }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/roles') && method === 'GET' && !url.includes('/permissions')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Admin', description: 'Administrator role' },
                { id: '2', name: 'User', description: 'Regular user role' }
              ]
            })
          });
          return;
        }
        
        if (url.includes('/permissions') && method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: [
                { id: '1', name: 'Create', module: 'Users', description: 'Create users' },
                { id: '2', name: 'Read', module: 'Users', description: 'View users' },
                { id: '3', name: 'Update', module: 'Users', description: 'Update users' },
                { id: '4', name: 'Delete', module: 'Users', description: 'Delete users' }
              ]
            })
          });
          return;
        }
      }
      
      // Default: continue with actual request
      await route.continue();
    } catch (error) {
      console.error('API mock error:', error);
      await route.continue();
    }
  });
}

export async function setupAuthenticatedSession(page: Page, token = 'mock-jwt-token') {
  // Set auth token in localStorage
  await page.evaluate((t) => {
    localStorage.setItem('authToken', t);
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'Admin',
      permissions: ['*'],
      isActive: true
    }));
  }, token);
  
  // Set auth header in page context
  await page.setExtraHTTPHeaders({
    'Authorization': `Bearer ${token}`
  });
}
