# Vite ERP Frontend - Agent Rules

**Project:** erp-frontend-vite | **Stack:** Vite + React + TypeScript + React Router

This is a Vite SPA, NOT Next.js. Never use Next.js patterns.

## Canonical References

- API clients: @src/api/clients/
- Vite config: @vite.config.ts
- Routes: @src/config/routes.config.ts

## When Writing Code

### 1. Use Vite Conventions

**When you see:** `process.env` or Next.js imports

**Action:** Use `import.meta.env` (Vite). Use `react-router-dom` for routing. Use `React.lazy()` for code splitting.

**Never:** `getServerSideProps`, `next/link`, `next/image`, `next/dynamic`, Next.js API routes.

### 2. API Client Architecture

Two HTTP clients via `VITE_USE_DAPR`:
- **Axios** (default): `import.meta.env.VITE_API_BASE_URL` - never include `/api` suffix
- **Dapr**: `VITE_DAPR_APP_ID`, `VITE_DAPR_PORT`

See @src/api/clients/ for implementations.

### 3. Eliminate Async Waterfalls

**When you see:** Sequential `await` in API services

**Action:** Use `Promise.all()` for independent fetches.

```typescript
// Incorrect
const user = await userService.getUser(id);
const orders = await orderService.getOrders(id);

// Correct
const [user, orders] = await Promise.all([
  userService.getUser(id),
  orderService.getOrders(id),
]);
```

### 4. Code Quality

- **TypeScript:** Strict mode. Never use `any` - use proper types or `unknown`.
- **ESLint:** Zero warnings. Run `pnpm type-check` and `pnpm lint` before committing.
- **Immutability:** Use `.toSorted()` not `.sort()`, spread operators `[...arr]`, `{...obj}`.
- **Testing:** New features need unit tests (Vitest). Complex flows need E2E (Playwright).

### 5. Build Commands

```bash
pnpm type-check  # MUST pass
pnpm lint        # MUST pass (zero warnings)
pnpm build       # MUST succeed
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
```

## Never Do These

1. Never use Next.js patterns
2. Never include `/api` in `VITE_API_BASE_URL`
3. Never use `any` type
4. Never skip type-check or lint
5. Never mutate props or state
6. Never create sequential awaits for independent operations
7. Never import from barrel files (e.g. `lucide-react` - use direct path)
8. Never commit `.env` - only `.env.example`

## Trust These Instructions

Follow directly. Only search if instructions are incomplete or you encounter an uncovered error.
