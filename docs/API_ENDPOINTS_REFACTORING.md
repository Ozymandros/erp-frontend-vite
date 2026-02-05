# API Endpoints Constants - Refactoring Guide

## ✅ Improvements Made

### 1. **Centralized Endpoint Management**

All API endpoints are now defined in a single source of truth: `src/api/constants/endpoints.ts`

**Benefits:**

- **Single Source of Truth**: All URLs defined in one place
- **Easy Maintenance**: Update routes in one location
- **Type Safety**: Constants prevent typos
- **Autocomplete**: IDE suggestions for all endpoints
- **Refactoring**: Easy to find and update endpoint usage

### 2. **Modular Organization**

Endpoints are organized by service module:

```typescript
// Auth Module
AUTH_ENDPOINTS;
USERS_ENDPOINTS;
ROLES_ENDPOINTS;
PERMISSIONS_ENDPOINTS;

// Inventory Module
PRODUCTS_ENDPOINTS;
WAREHOUSES_ENDPOINTS;
WAREHOUSE_STOCKS_ENDPOINTS;
STOCK_OPERATIONS_ENDPOINTS;
INVENTORY_TRANSACTIONS_ENDPOINTS;

// Orders Module
ORDERS_ENDPOINTS;

// Sales Module
SALES_ORDERS_ENDPOINTS;
CUSTOMERS_ENDPOINTS;

// Purchasing Module
PURCHASE_ORDERS_ENDPOINTS;
SUPPLIERS_ENDPOINTS;
```

### 3. **Function Factories for Dynamic Routes**

Dynamic route segments use function factories:

```typescript
// Before
`/auth/api/users/${id}`;

// After
USERS_ENDPOINTS.BY_ID(id);
```

**Benefits:**

- Type-safe parameters
- No string interpolation errors
- Clear parameter requirements
- IDE autocomplete for parameters

## Usage Examples

### Before Refactoring

```typescript
class UsersService {
  async getUserById(id: string): Promise<User> {
    return this.apiClient.get<User>(`/auth/api/users/${id}`);
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.post<void>(
      `/auth/api/users/${userId}/roles/${roleName}`
    );
  }
}
```

**Problems:**
❌ Hardcoded strings scattered across codebase  
❌ Easy to make typos  
❌ Difficult to find all usages  
❌ No compile-time safety  
❌ Gateway prefix duplicated everywhere

### After Refactoring

```typescript
import { USERS_ENDPOINTS } from "../constants/endpoints";

class UsersService {
  async getUserById(id: string): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_ID(id));
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.post<void>(
      USERS_ENDPOINTS.ASSIGN_ROLE(userId, roleName)
    );
  }
}
```

**Advantages:**
✅ Centralized endpoint definitions  
✅ Type-safe with autocomplete  
✅ Easy to refactor  
✅ Compile-time error detection  
✅ Gateway prefix managed centrally

## Service Base URLs

All service base URLs are defined as constants:

```typescript
/** Auth service routes through /auth/api/ */
export const AUTH_SERVICE_BASE = "/auth/api";

/** Inventory service routes through /inventory/api/inventory/ */
export const INVENTORY_SERVICE_BASE = "/inventory/api/inventory";

/** Orders service routes through /orders/api/ */
export const ORDERS_SERVICE_BASE = "/orders/api";

/** Sales service routes through /sales/api/sales/ */
export const SALES_SERVICE_BASE = "/sales/api/sales";

/** Purchasing service routes through /purchasing/api/purchasing/ */
export const PURCHASING_SERVICE_BASE = "/purchasing/api/purchasing";
```

**If the gateway routing changes**, you only need to update these 5 constants!

## Endpoint Patterns

### 1. Simple Endpoints

```typescript
// Static paths
AUTH_ENDPOINTS.LOGIN; // '/auth/api/auth/login'
AUTH_ENDPOINTS.REGISTER; // '/auth/api/auth/register'
AUTH_ENDPOINTS.LOGOUT; // '/auth/api/auth/logout'
```

### 2. Parameterized Endpoints (Functions)

```typescript
// Dynamic paths with parameters
USERS_ENDPOINTS.BY_ID(userId); // '/auth/api/users/{userId}'
USERS_ENDPOINTS.BY_EMAIL(email); // '/auth/api/users/email/{email}'
ROLES_ENDPOINTS.BY_NAME(name); // '/auth/api/roles/name/{name}'
PRODUCTS_ENDPOINTS.BY_SKU(sku); // '/inventory/api/inventory/products/sku/{sku}'
```

### 3. Nested Resource Endpoints

```typescript
// Multi-parameter routes
USERS_ENDPOINTS.ASSIGN_ROLE(userId, roleName);
// '/auth/api/users/{userId}/roles/{roleName}'

ROLES_ENDPOINTS.REMOVE_PERMISSION(roleId, permissionId);
// '/auth/api/roles/{roleId}/permissions/{permissionId}'

WAREHOUSE_STOCKS_ENDPOINTS.BY_PRODUCT_AND_WAREHOUSE(productId, warehouseId);
// '/inventory/api/inventory/warehouse-stocks/{productId}/{warehouseId}'
```

## Files Updated

### ✅ Auth Module (Completed)

- [x] `auth.service.ts` - Using `AUTH_ENDPOINTS`, `USERS_ENDPOINTS`, `PERMISSIONS_ENDPOINTS`
- [x] `users.service.ts` - Using `USERS_ENDPOINTS`
- [x] `roles.service.ts` - Using `ROLES_ENDPOINTS`
- [x] `permissions.service.ts` - Using `PERMISSIONS_ENDPOINTS`

### ✅ Inventory Module (Completed)

- [x] `products.service.ts` - Updated to use `PRODUCTS_ENDPOINTS`
- [x] `warehouses.service.ts` - Updated to use `WAREHOUSES_ENDPOINTS`
- [x] `warehouse-stocks.service.ts` - Updated to use `WAREHOUSE_STOCKS_ENDPOINTS`
- [x] `stock-operations.service.ts` - Updated to use `STOCK_OPERATIONS_ENDPOINTS`
- [x] `inventory-transactions.service.ts` - Updated to use `INVENTORY_TRANSACTIONS_ENDPOINTS`

### ✅ Orders Module (Completed)

- [x] `orders.service.ts` - Updated to use `ORDERS_ENDPOINTS`

### ✅ Sales Module (Completed)

- [x] `sales-orders.service.ts` - Updated to use `SALES_ORDERS_ENDPOINTS`
- [x] `customers.service.ts` - Updated to use `CUSTOMERS_ENDPOINTS`

### ✅ Purchasing Module (Completed)

- [x] `purchase-orders.service.ts` - Updated to use `PURCHASE_ORDERS_ENDPOINTS`
- [x] `suppliers.service.ts` - Updated to use `SUPPLIERS_ENDPOINTS`

## Migration Pattern

For each service file:

1. Import the constants:

```typescript
import { SERVICE_ENDPOINTS } from "../constants/endpoints";
```

1. Replace hardcoded strings with constants:

```typescript
// Before
return this.apiClient.get<Type>(`/service/api/resource/${id}`);

// After
return this.apiClient.get<Type>(SERVICE_ENDPOINTS.BY_ID(id));
```

1. Test to ensure endpoints still work correctly

## Benefits Summary

### For Developers

- ✅ **IntelliSense Support**: Autocomplete for all endpoints
- ✅ **Type Safety**: Compiler catches endpoint errors
- ✅ **Consistency**: Same pattern across all services
- ✅ **Documentation**: Self-documenting code

### For Maintenance

- ✅ **Single Source of Truth**: Update routes in one place
- ✅ **Easy Refactoring**: Find all usages easily
- ✅ **Gateway Changes**: Update base URLs once
- ✅ **No Magic Strings**: All URLs are constants

### For Testing

- ✅ **Mock Endpoints**: Easy to mock specific endpoints
- ✅ **URL Testing**: Test endpoint construction
- ✅ **Endpoint Discovery**: See all API routes at once

## Next Steps

To complete the refactoring:

1. Update remaining 10 service files to use constants
1. Run linter to ensure no errors
1. Run tests to verify functionality
1. Update documentation if needed
1. Consider adding endpoint constants to API documentation

## Example: Complete Service with Constants

```typescript
import { getApiClient } from "../clients";
import { USERS_ENDPOINTS } from "../constants/endpoints";
import type { User, PaginatedResponse, QuerySpec } from "@/types/api.types";

class UsersService {
  private apiClient = getApiClient();

  async getUsers(): Promise<User[]> {
    return this.apiClient.get<User[]>(USERS_ENDPOINTS.BASE);
  }

  async getUsersPaginated(
    params?: SearchParams
  ): Promise<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(
      USERS_ENDPOINTS.PAGINATED,
      { params }
    );
  }

  async searchUsers(querySpec: QuerySpec): Promise<PaginatedResponse<User>> {
    return this.apiClient.get<PaginatedResponse<User>>(USERS_ENDPOINTS.SEARCH, {
      params: querySpec,
    });
  }

  async getUserById(id: string): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_ID(id));
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.apiClient.get<User>(USERS_ENDPOINTS.BY_EMAIL(email));
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.apiClient.post<User>(USERS_ENDPOINTS.CREATE, data);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<void> {
    return this.apiClient.put<void>(USERS_ENDPOINTS.BY_ID(id), data);
  }

  async deleteUser(id: string): Promise<void> {
    return this.apiClient.delete<void>(USERS_ENDPOINTS.BY_ID(id));
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.post<void>(
      USERS_ENDPOINTS.ASSIGN_ROLE(userId, roleName)
    );
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    return this.apiClient.delete<void>(
      USERS_ENDPOINTS.REMOVE_ROLE(userId, roleName)
    );
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.apiClient.get<Role[]>(USERS_ENDPOINTS.GET_ROLES(userId));
  }
}

export const usersService = new UsersService();
```

## Conclusion

This refactoring significantly improves code maintainability, type safety, and developer experience. The centralized endpoint management makes it trivial to update routes when the backend gateway configuration changes.
