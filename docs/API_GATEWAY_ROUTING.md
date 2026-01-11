# API Gateway Routing Configuration

This document describes the API Gateway routing structure based on the Ocelot configuration.

## Gateway Base URL
- **Gateway**: `http://localhost:5000`

## Service Routing Prefixes

All frontend API calls must use the correct gateway prefix for each service:

### 1. Auth Service
- **Gateway Prefix**: `/auth/api/`
- **Downstream**: Routes to `auth-service:8080/api/`
- **Examples**:
  - `/auth/api/auth/login` → `http://auth-service:8080/api/auth/login`
  - `/auth/api/users/me` → `http://auth-service:8080/api/users/me`
  - `/auth/api/roles` → `http://auth-service:8080/api/roles`
  - `/auth/api/permissions` → `http://auth-service:8080/api/permissions`

### 2. Inventory Service
- **Gateway Prefix**: `/inventory/api/inventory/`
- **Downstream**: Routes to `inventory-service:8080/api/inventory/`
- **Examples**:
  - `/inventory/api/inventory/products` → `http://inventory-service:8080/api/inventory/products`
  - `/inventory/api/inventory/warehouses` → `http://inventory-service:8080/api/inventory/warehouses`
  - `/inventory/api/inventory/warehouse-stocks` → `http://inventory-service:8080/api/inventory/warehouse-stocks`
  - `/inventory/api/inventory/transactions` → `http://inventory-service:8080/api/inventory/transactions`

### 3. Orders Service
- **Gateway Prefix**: `/orders/api/`
- **Downstream**: Routes to `orders-service:8080/api/`
- **Examples**:
  - `/orders/api/orders` → `http://orders-service:8080/api/orders`
  - `/orders/api/orders/with-reservation` → `http://orders-service:8080/api/orders/with-reservation`

### 4. Sales Service
- **Gateway Prefix**: `/sales/api/sales/`
- **Downstream**: Routes to `sales-service:8080/api/sales/`
- **Examples**:
  - `/sales/api/sales/orders` → `http://sales-service:8080/api/sales/orders`
  - `/sales/api/sales/customers` → `http://sales-service:8080/api/sales/customers`
  - `/sales/api/sales/orders/quotes` → `http://sales-service:8080/api/sales/orders/quotes`

### 5. Purchasing Service
- **Gateway Prefix**: `/purchasing/api/purchasing/`
- **Downstream**: Routes to `purchasing-service:8080/api/purchasing/`
- **Examples**:
  - `/purchasing/api/purchasing/orders` → `http://purchasing-service:8080/api/purchasing/orders`
  - `/purchasing/api/purchasing/suppliers` → `http://purchasing-service:8080/api/purchasing/suppliers`

## Authentication
- All routes (except `/auth/api/auth/login` and `/auth/api/auth/register`) require Bearer token authentication
- Token should be included in `Authorization` header: `Bearer <token>`

## Rate Limiting
- Most endpoints: 100 requests per minute
- Login endpoint: No rate limiting

## Frontend Configuration

### Environment Variables

⚠️ **IMPORTANT**: The `VITE_API_BASE_URL` should **NOT** include the `/api` suffix!

All endpoints in `src/api/constants/endpoints.ts` already include the full gateway path (e.g., `/auth/api/`, `/inventory/api/inventory/`).

```env
# ✅ CORRECT: Gateway mode (recommended)
VITE_API_BASE_URL=http://localhost:5000

# ❌ WRONG: This would cause double /api in paths
VITE_API_BASE_URL=http://localhost:5000/api

# ✅ CORRECT: Direct service mode (for development without gateway)
VITE_API_BASE_URL=http://localhost:8080
```

**Example:**
- Base URL: `http://localhost:5000`
- Endpoint: `/auth/api/auth/login` (from `AUTH_ENDPOINTS.LOGIN`)
- **Final URL**: `http://localhost:5000/auth/api/auth/login` ✅

If you accidentally included `/api` in base URL:
- Base URL: `http://localhost:5000/api` ❌
- Endpoint: `/auth/api/auth/login`
- **Final URL**: `http://localhost:5000/api/auth/api/auth/login` ❌ (double `/api`)

### Service Implementation
All service classes use the gateway prefixes automatically:
- `authService` → uses `/auth/api/` prefix
- `usersService` → uses `/auth/api/` prefix
- `rolesService` → uses `/auth/api/` prefix
- `permissionsService` → uses `/auth/api/` prefix
- `productsService` → uses `/inventory/api/inventory/` prefix
- `warehousesService` → uses `/inventory/api/inventory/` prefix
- `ordersService` → uses `/orders/api/` prefix
- `salesOrdersService` → uses `/sales/api/sales/` prefix
- `customersService` → uses `/sales/api/sales/` prefix
- `purchaseOrdersService` → uses `/purchasing/api/purchasing/` prefix
- `suppliersService` → uses `/purchasing/api/purchasing/` prefix

## Complete Request Flow

```
Frontend (React)
    ↓
axios/fetch → http://localhost:5000/auth/api/users
    ↓
Ocelot Gateway (localhost:5000)
    ↓
auth-service:8080/api/users
    ↓
ASP.NET Core Controller
    ↓
Response (JSON with PaginatedResult, ProblemDetails, etc.)
    ↓
Frontend receives typed response
```

## Notes
- All DateTime fields are returned as ISO-8601 strings
- Paginated responses use `page` and `total` properties (not `pageNumber` and `totalCount`)
- Validation errors return `ProblemDetails` with `errors` object
- All gateway routes include `X-Request-ID` and `X-Forwarded-For` headers
