# ERP Frontend - Copilot Instructions

## Repository Overview

This is a **Vite + React + TypeScript** ERP frontend application (NOT Next.js). The project uses React Router for client-side routing, not Next.js App Router. Key technologies:

- **Build Tool:** Vite 7.3.1
- **Framework:** React 18.3.1 with React Router DOM 6.30.3
- **Language:** TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS + Radix UI components
- **State Management:** React Context API
- **HTTP Client:** Axios (default) or Dapr HTTP Proxy (configurable)
- **Testing:** Vitest (unit) + Playwright (E2E)

## Build & Validation

### Always Run Before Committing

```bash
# 1. Install dependencies (if lockfile changed)
pnpm install

# 2. Type check (MUST pass)
pnpm type-check

# 3. Lint (MUST pass with zero warnings)
pnpm lint

# 4. Build (MUST succeed)
pnpm build

# 5. Run tests (MUST pass)
pnpm test
```

### Build Commands

- **Development:** `pnpm dev` (starts Vite dev server on port 3000)
- **Production Build:** `pnpm build` (runs `tsc` then `vite build`)
- **Preview:** `pnpm preview` (previews production build locally)
- **Type Check:** `pnpm type-check` (TypeScript validation only)
- **Lint:** `pnpm lint` (ESLint with zero warnings policy)

### Test Commands

- **Unit Tests:** `pnpm test` (Vitest)
- **E2E Tests:** `pnpm test:e2e` (Playwright - requires port 3000 available)
- **Coverage:** `pnpm test:coverage` (Vitest with coverage report)

**Critical:** E2E tests use mocked API endpoints and don't require a running backend. Tests must pass before merging.

## Project Structure

```
src/
├── api/
│   ├── clients/          # HTTP client implementations (Axios, Dapr)
│   ├── constants/        # API endpoints and constants
│   └── services/         # API service layers (auth, users, inventory, etc.)
├── components/
│   ├── auth/            # Authentication components
│   ├── inventory/       # Inventory management components
│   ├── layout/          # Layout components (header, sidebar)
│   ├── sales/           # Sales components
│   ├── ui/              # Reusable UI components (Radix UI based)
│   └── users/           # User management components
├── contexts/            # React contexts (auth, toast)
├── lib/
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── validation/      # Zod validation schemas
├── pages/               # Page components (routes)
├── test/                # Test utilities, mocks, and E2E tests
└── types/               # TypeScript type definitions
```

## API Client Architecture

**CRITICAL:** The app supports two interchangeable HTTP clients selected via `VITE_USE_DAPR`:

1. **Axios Client** (default, `VITE_USE_DAPR=false`)

   - Standard HTTP client using Axios
   - Base URL: `VITE_API_BASE_URL` (e.g., `http://localhost:5000`)
   - **Never include `/api` suffix in base URL** - endpoints already include full gateway paths

2. **Dapr HTTP Proxy** (`VITE_USE_DAPR=true`)
   - Uses Dapr service invocation for microservices
   - App ID: `VITE_DAPR_APP_ID` (e.g., `auth-service`)
   - Port: `VITE_DAPR_PORT` (default: 3500)

Both clients share the same interface and handle authentication, error handling, and request/response transformation consistently.

**Common Mistake:** If you see URLs like `http://localhost:5000/api/auth/api/auth/login` (double `/api`), the `VITE_API_BASE_URL` includes `/api`. Remove it!

## Environment Variables

**Required:** Create `.env` file in root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000  # NO /api suffix!

# API Client Selection
VITE_USE_DAPR=false  # true = Dapr, false = Axios

# Dapr Configuration (only if VITE_USE_DAPR=true)
VITE_DAPR_APP_ID=auth-service
VITE_DAPR_PORT=3500
```

## Code Quality Standards

### TypeScript

- **Strict mode enabled** - All code must pass `tsc --noEmit`
- **No `any` types** - Use proper types or `unknown`
- **Type imports** - Use `import type` for type-only imports

### ESLint

- **Zero warnings policy** - `pnpm lint` must pass with `--max-warnings 0`
- **React Hooks rules** - Follow exhaustive-deps rule
- **TypeScript rules** - Follow strict TypeScript rules

### Testing

- **New features require unit tests** - Use Vitest + Testing Library
- **Complex flows require E2E tests** - Use Playwright
- **Mock API calls** - E2E tests use mocked endpoints (see `src/test/mocks/`)

## Never Do These

1. **Never use Next.js patterns** - This is Vite, not Next.js. No `getServerSideProps`, `getStaticProps`, or Next.js API routes.

2. **Never include `/api` in `VITE_API_BASE_URL`** - Endpoints already include full gateway paths.

3. **Never commit `.env` file** - Only commit `.env.example`.

4. **Never use `any` type** - Use proper TypeScript types or `unknown`.

5. **Never skip type checking** - Always run `pnpm type-check` before committing.

6. **Never skip linting** - ESLint must pass with zero warnings.

7. **Never mutate props or state directly** - Use immutable patterns (`.toSorted()`, spread operators).

8. **Never create sequential `await` calls** - Use `Promise.all()` for independent operations.

9. **Never import from barrel files** - Import directly from source files (e.g., `lucide-react/dist/esm/icons/check`).

10. **Never skip tests** - New features require tests; complex flows require E2E tests.

## React Patterns (Vite-Specific)

### Routing

- Use `react-router-dom` for routing (NOT Next.js routing)
- Routes defined in `src/config/routes.config.ts`
- Use `<Navigate>` for redirects, `<Link>` for navigation

### Data Fetching

- Use `useEffect` + `useState` for client-side fetching
- Use React Context for global state (auth, toast)
- Consider SWR for automatic deduplication (if needed)

### Component Structure

- Functional components only
- Use TypeScript interfaces for props
- Extract reusable UI components to `src/components/ui/`

## Performance Guidelines

1. **Avoid waterfalls** - Use `Promise.all()` for independent async operations
2. **Bundle optimization** - Import directly from source files, avoid barrel imports
3. **Code splitting** - Use dynamic imports for heavy components (`React.lazy()`)
4. **Memoization** - Use `useMemo`/`useCallback` for expensive computations
5. **Re-render optimization** - Extract memoized components, narrow effect dependencies

## Validation Steps

Before submitting code, verify:

1. ✅ `pnpm type-check` passes
2. ✅ `pnpm lint` passes with zero warnings
3. ✅ `pnpm build` succeeds
4. ✅ `pnpm test` passes
5. ✅ `pnpm test:e2e` passes (if applicable)
6. ✅ No console errors in browser
7. ✅ Environment variables documented in `.env.example`

## Trust These Instructions

These instructions are validated and tested. Only search the codebase if:

- Instructions are incomplete for your specific task
- You encounter an error not covered here
- You need to understand existing code patterns

Otherwise, follow these instructions directly to minimize exploration time.
