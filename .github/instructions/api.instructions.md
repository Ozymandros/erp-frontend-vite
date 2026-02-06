---
applyTo: "src/api/**/*.ts"
---

# API Layer Instructions

## Architecture

- **Clients:** `src/api/clients/` - Axios and Dapr implementations. Same interface.
- **Services:** `src/api/services/` - One service per domain (auth, users, products, etc.)
- **Constants:** `src/api/constants/` - Endpoint URLs and constants

## HTTP Client Selection

Controlled by `VITE_USE_DAPR`:
- `false` (default): Axios, base URL from `import.meta.env.VITE_API_BASE_URL`
- `true`: Dapr, uses `VITE_DAPR_APP_ID` and `VITE_DAPR_PORT`

**Never include `/api` in base URL** - endpoints already include full gateway paths.

## Service Layer Patterns

- Services use the shared API client from `src/api/clients/`
- Use `Promise.all()` for independent fetches - never sequential await
- Return typed data. Use Zod for validation when parsing responses.

## Example: Parallel Fetches

```typescript
// Incorrect - sequential
const user = await userService.getUser(id);
const orders = await orderService.getOrders(id);

// Correct - parallel
const [user, orders] = await Promise.all([
  userService.getUser(id),
  orderService.getOrders(id),
]);
```

## Never

- Never use `process.env` - use `import.meta.env.VITE_*`
- Never chain sequential awaits for independent operations
- Never include `/api` in `VITE_API_BASE_URL`
- Never bypass the service layer for direct fetch in components
