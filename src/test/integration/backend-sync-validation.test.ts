/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  RegisterSchema,
  CreateUserSchema,
  UpdateUserSchema,
  CreateRoleSchema,
  CreatePermissionSchema,
} from '@/lib/validation'
import type {
  User,
  PaginatedResponse,
  QuerySpec,
  ProductDto,
  OrderDto,
} from '@/types/api.types'

describe('Backend Synchronization Validation', () => {
  describe('Type Definitions', () => {
    it('should have correct User interface with all backend fields', () => {
      const mockUser: User = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailConfirmed: false,
        isExternalLogin: false,
        externalProvider: undefined,
        isActive: true,
        isAdmin: false,
        roles: [],
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: undefined,
        updatedBy: undefined,
      }
      expect(mockUser).toBeDefined()
      expect(mockUser.emailConfirmed).toBe(false)
      expect(mockUser.isExternalLogin).toBe(false)
      expect(mockUser.isAdmin).toBe(false)
    })

    it('should have correct PaginatedResponse interface matching backend', () => {
      const mockResponse: PaginatedResponse<User> = {
        items: [],
        page: 1, // Backend JSON property name
        pageSize: 10,
        total: 0, // Backend JSON property name
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }
      expect(mockResponse).toBeDefined()
      expect(mockResponse.page).toBe(1)
      expect(mockResponse.total).toBe(0)
    })

    it('should have QuerySpec interface for search/filter/sort', () => {
      const querySpec: QuerySpec = {
        page: 1,
        pageSize: 20,
        sortBy: 'createdAt',
        sortDesc: true,
        filters: { status: 'active' },
        searchFields: 'username,email',
        searchTerm: 'test',
      }
      expect(querySpec).toBeDefined()
    })

    it('should have Inventory DTOs defined', () => {
      const product: ProductDto = {
        id: '1',
        sku: 'TEST-001',
        name: 'Test Product',
        unitPrice: 10.99,
        quantityInStock: 100,
        reorderLevel: 10,
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      }
      expect(product).toBeDefined()
    })

    it('should have Orders DTOs defined', () => {
      const order: OrderDto = {
        id: '1',
        orderNumber: 'ORD-001',
        status: 'Pending' as any,
        orderDate: '2024-01-01T00:00:00Z',
        customerId: 'cust-1',
        orderLines: [],
        totalAmount: 100,
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      }
      expect(order).toBeDefined()
    })
  })

  describe('Validation Schemas', () => {
    it('should validate LoginDto with correct rules', () => {
      // Valid login
      const validLogin = { email: 'test@example.com', password: 'password123' }
      expect(LoginSchema.safeParse(validLogin).success).toBe(true)

      // Invalid email
      const invalidEmail = { email: 'notanemail', password: 'password123' }
      expect(LoginSchema.safeParse(invalidEmail).success).toBe(false)

      // Password too short
      const shortPassword = { email: 'test@example.com', password: '12345' }
      expect(LoginSchema.safeParse(shortPassword).success).toBe(false)

      // Password too long
      const longPassword = { 
        email: 'test@example.com', 
        password: 'a'.repeat(101) 
      }
      expect(LoginSchema.safeParse(longPassword).success).toBe(false)
    })

    it('should validate RegisterDto with password confirmation', () => {
      // Valid registration
      const valid = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }
      expect(RegisterSchema.safeParse(valid).success).toBe(true)

      // Passwords don't match
      const mismatch = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        passwordConfirm: 'different',
      }
      expect(RegisterSchema.safeParse(mismatch).success).toBe(false)

      // Username too short
      const shortUsername = {
        email: 'test@example.com',
        username: 'ab',
        password: 'password123',
        passwordConfirm: 'password123',
      }
      expect(RegisterSchema.safeParse(shortUsername).success).toBe(false)
    })

    it('should validate CreateUserDto with 8 char minimum', () => {
      // Valid user
      const valid = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'password123',
      }
      expect(CreateUserSchema.safeParse(valid).success).toBe(true)

      // Username too short (< 8 chars)
      const shortUsername = {
        email: 'test@example.com',
        username: 'test',
        password: 'password123',
      }
      expect(CreateUserSchema.safeParse(shortUsername).success).toBe(false)

      // Password too short (< 8 chars)
      const shortPassword = {
        email: 'test@example.com',
        username: 'testuser123',
        password: 'pass123',
      }
      expect(CreateUserSchema.safeParse(shortPassword).success).toBe(false)
    })

    it('should validate UpdateUserDto with all optional fields', () => {
      // Empty update (all optional)
      expect(UpdateUserSchema.safeParse({}).success).toBe(true)

      // Partial update
      const partial = { firstName: 'John', phoneNumber: '123-456-7890' }
      expect(UpdateUserSchema.safeParse(partial).success).toBe(true)

      // Invalid email format
      const invalidEmail = { email: 'notanemail' }
      expect(UpdateUserSchema.safeParse(invalidEmail).success).toBe(false)
    })

    it('should validate CreateRoleDto', () => {
      // Valid role
      const valid = { name: 'Admin', description: 'Administrator role' }
      expect(CreateRoleSchema.safeParse(valid).success).toBe(true)

      // Missing required name
      const noName = { description: 'Test' }
      expect(CreateRoleSchema.safeParse(noName).success).toBe(false)
    })

    it('should validate CreatePermissionDto', () => {
      // Valid permission
      const valid = { module: 'Users', action: 'Read' }
      expect(CreatePermissionSchema.safeParse(valid).success).toBe(true)

      // Missing required fields
      const noModule = { action: 'Read' }
      expect(CreatePermissionSchema.safeParse(noModule).success).toBe(false)

      const noAction = { module: 'Users' }
      expect(CreatePermissionSchema.safeParse(noAction).success).toBe(false)
    })
  })

  describe('Service Endpoint Mapping', () => {
    it('should have all auth service methods', async () => {
      const { authService } = await import('@/api/services/auth.service')
      expect(authService.login).toBeDefined()
      expect(authService.register).toBeDefined()
      expect(authService.refreshToken).toBeDefined()
      expect(authService.logout).toBeDefined()
      expect(authService.getCurrentUser).toBeDefined()
      expect(authService.checkPermission).toBeDefined()
    })

    it('should have all users service methods', async () => {
      const { usersService } = await import('@/api/services/users.service')
      expect(usersService.getUsers).toBeDefined()
      expect(usersService.getUsersPaginated).toBeDefined()
      expect(usersService.searchUsers).toBeDefined()
      expect(usersService.getUserById).toBeDefined()
      expect(usersService.getUserByEmail).toBeDefined()
      expect(usersService.getCurrentUser).toBeDefined()
      expect(usersService.createUser).toBeDefined()
      expect(usersService.updateUser).toBeDefined()
      expect(usersService.deleteUser).toBeDefined()
      expect(usersService.assignRole).toBeDefined()
      expect(usersService.removeRole).toBeDefined()
      expect(usersService.getUserRoles).toBeDefined()
    })

    it('should have all roles service methods', async () => {
      const { rolesService } = await import('@/api/services/roles.service')
      expect(rolesService.getRoles).toBeDefined()
      expect(rolesService.getRolesPaginated).toBeDefined()
      expect(rolesService.searchRoles).toBeDefined()
      expect(rolesService.getRoleById).toBeDefined()
      expect(rolesService.getRoleByName).toBeDefined()
      expect(rolesService.createRole).toBeDefined()
      expect(rolesService.updateRole).toBeDefined()
      expect(rolesService.deleteRole).toBeDefined()
      expect(rolesService.getUsersInRole).toBeDefined()
      expect(rolesService.addPermissionToRole).toBeDefined()
      expect(rolesService.removePermissionFromRole).toBeDefined()
      expect(rolesService.getRolePermissions).toBeDefined()
    })

    it('should have all permissions service methods', async () => {
      const { permissionsService } = await import('@/api/services/permissions.service')
      expect(permissionsService.getPermissions).toBeDefined()
      expect(permissionsService.getPermissionsPaginated).toBeDefined()
      expect(permissionsService.searchPermissions).toBeDefined()
      expect(permissionsService.getPermissionById).toBeDefined()
      expect(permissionsService.getPermissionByModuleAction).toBeDefined()
      expect(permissionsService.checkPermission).toBeDefined()
      expect(permissionsService.createPermission).toBeDefined()
      expect(permissionsService.updatePermission).toBeDefined()
      expect(permissionsService.deletePermission).toBeDefined()
    })

    it('should have products service methods', async () => {
      const { productsService } = await import('@/api/services/products.service')
      expect(productsService.getProducts).toBeDefined()
      expect(productsService.getProductsPaginated).toBeDefined()
      expect(productsService.searchProducts).toBeDefined()
      expect(productsService.getProductById).toBeDefined()
      expect(productsService.getProductBySku).toBeDefined()
      expect(productsService.getLowStockProducts).toBeDefined()
      expect(productsService.createProduct).toBeDefined()
      expect(productsService.updateProduct).toBeDefined()
      expect(productsService.deleteProduct).toBeDefined()
    })

    it('should have warehouses service methods', async () => {
      const { warehousesService } = await import('@/api/services/warehouses.service')
      expect(warehousesService.getWarehouses).toBeDefined()
      expect(warehousesService.getWarehousesPaginated).toBeDefined()
      expect(warehousesService.searchWarehouses).toBeDefined()
      expect(warehousesService.getWarehouseById).toBeDefined()
      expect(warehousesService.createWarehouse).toBeDefined()
      expect(warehousesService.updateWarehouse).toBeDefined()
      expect(warehousesService.deleteWarehouse).toBeDefined()
    })

    it('should have orders service methods', async () => {
      const { ordersService } = await import('@/api/services/orders.service')
      expect(ordersService.getOrders).toBeDefined()
      expect(ordersService.getOrderById).toBeDefined()
      expect(ordersService.createOrder).toBeDefined()
      expect(ordersService.updateOrder).toBeDefined()
      expect(ordersService.deleteOrder).toBeDefined()
      expect(ordersService.createOrderWithReservation).toBeDefined()
      expect(ordersService.fulfillOrder).toBeDefined()
      expect(ordersService.cancelOrder).toBeDefined()
    })

    it('should have sales orders service methods', async () => {
      const { salesOrdersService } = await import('@/api/services/sales-orders.service')
      expect(salesOrdersService.getSalesOrders).toBeDefined()
      expect(salesOrdersService.getSalesOrderById).toBeDefined()
      expect(salesOrdersService.searchSalesOrders).toBeDefined()
      expect(salesOrdersService.createSalesOrder).toBeDefined()
      expect(salesOrdersService.updateSalesOrder).toBeDefined()
      expect(salesOrdersService.deleteSalesOrder).toBeDefined()
      expect(salesOrdersService.createQuote).toBeDefined()
      expect(salesOrdersService.confirmQuote).toBeDefined()
      expect(salesOrdersService.checkStockAvailability).toBeDefined()
    })

    it('should have purchase orders service methods', async () => {
      const { purchaseOrdersService } = await import('@/api/services/purchase-orders.service')
      expect(purchaseOrdersService.getPurchaseOrders).toBeDefined()
      expect(purchaseOrdersService.getPurchaseOrderById).toBeDefined()
      expect(purchaseOrdersService.searchPurchaseOrders).toBeDefined()
      expect(purchaseOrdersService.getPurchaseOrdersBySupplier).toBeDefined()
      expect(purchaseOrdersService.getPurchaseOrdersByStatus).toBeDefined()
      expect(purchaseOrdersService.createPurchaseOrder).toBeDefined()
      expect(purchaseOrdersService.updatePurchaseOrder).toBeDefined()
      expect(purchaseOrdersService.updatePurchaseOrderStatus).toBeDefined()
      expect(purchaseOrdersService.deletePurchaseOrder).toBeDefined()
      expect(purchaseOrdersService.approvePurchaseOrder).toBeDefined()
      expect(purchaseOrdersService.receivePurchaseOrder).toBeDefined()
    })

    it('should have suppliers service methods', async () => {
      const { suppliersService } = await import('@/api/services/suppliers.service')
      expect(suppliersService.getSuppliers).toBeDefined()
      expect(suppliersService.getSupplierById).toBeDefined()
      expect(suppliersService.getSupplierByEmail).toBeDefined()
      expect(suppliersService.searchSuppliersByName).toBeDefined()
      expect(suppliersService.advancedSearchSuppliers).toBeDefined()
      expect(suppliersService.createSupplier).toBeDefined()
      expect(suppliersService.updateSupplier).toBeDefined()
      expect(suppliersService.deleteSupplier).toBeDefined()
    })
  })

  describe('DateTime Handling', () => {
    it('should use ISO-8601 string format for DateTime fields', () => {
      const mockUser: User = {
        id: '123',
        username: 'test',
        email: 'test@example.com',
        isActive: true,
        emailConfirmed: false,
        isExternalLogin: false,
        isAdmin: false,
        roles: [],
        permissions: [],
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-02T00:00:00Z',
        updatedBy: 'admin',
      }
      
      // Verify ISO-8601 format
      expect(typeof mockUser.createdAt).toBe('string')
      expect(mockUser.updatedAt).toBeDefined()
      expect(typeof mockUser.updatedAt).toBe('string')
      
      // Should be parseable as Date
      const createdDate = new Date(mockUser.createdAt)
      expect(createdDate.toISOString()).toBe('2024-01-01T00:00:00.000Z')
    })
  })
})
