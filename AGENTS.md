# ERP Frontend - Agent Instructions

**Project:** erp-frontend-vite  
**Stack:** Vite + React + TypeScript + React Router  
**Last Updated:** February 5, 2026

> **Note:** This is a **Vite-based SPA**, NOT Next.js. Never use Next.js patterns.

---

## Quick Reference

### Build & Test Commands

```bash
pnpm type-check  # TypeScript validation (MUST pass)
pnpm lint        # ESLint (MUST pass with zero warnings)
pnpm build       # Production build (MUST succeed)
pnpm test        # Unit tests (Vitest)
pnpm test:e2e    # E2E tests (Playwright)
```

### Project Structure

- `src/api/` - API clients (Axios/Dapr) and services
- `src/components/` - React components (auth, inventory, layout, sales, ui, users)
- `src/pages/` - Page components (routes)
- `src/contexts/` - React contexts (auth, toast)
- `src/lib/` - Utilities, hooks, validation schemas
- `src/test/` - Test utilities, mocks, E2E tests

### API Client Architecture

Two interchangeable HTTP clients:

1. **Axios** (default): `VITE_USE_DAPR=false`

   - Base URL: `import.meta.env.VITE_API_BASE_URL`
   - **Never include `/api` suffix** - endpoints already include full gateway paths

2. **Dapr**: `VITE_USE_DAPR=true`
   - Uses Dapr service invocation
   - App ID: `import.meta.env.VITE_DAPR_APP_ID`
   - Port: `import.meta.env.VITE_DAPR_PORT`

---

## Critical Rules

### 1. This is Vite, NOT Next.js

**Never use:**

- ❌ `getServerSideProps`, `getStaticProps`
- ❌ `next/link`, `next/image`, `next/dynamic`
- ❌ Next.js API routes
- ❌ `process.env` (use `import.meta.env`)

**Always use:**

- ✅ `react-router-dom` for routing
- ✅ `React.lazy()` for code splitting
- ✅ `import.meta.env` for environment variables
- ✅ Client-side data fetching with `useEffect` + `useState`

### 2. Eliminate Async Waterfalls

**When you see sequential `await` statements:**

```typescript
// ❌ Incorrect
const user = await fetchUser();
const posts = await fetchPosts();
const comments = await fetchComments();

// ✅ Correct
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments(),
]);
```

### 3. Bundle Optimization

**Avoid barrel file imports:**

```typescript
// ❌ Incorrect
import { Check, X } from "lucide-react";

// ✅ Correct
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
```

**Use dynamic imports for heavy components:**

```typescript
// ✅ Correct
const MonacoEditor = lazy(() =>
  import("./monaco-editor").then(m => ({ default: m.MonacoEditor }))
);
```

### 4. React Performance

**Use functional setState updates:**

```typescript
// ❌ Incorrect
setItems([...items, newItem]); // Requires items dependency

// ✅ Correct
setItems(curr => [...curr, newItem]); // No dependency needed
```

**Derive state during rendering:**

```typescript
// ❌ Incorrect
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);

// ✅ Correct
const fullName = firstName + " " + lastName; // Derive during render
```

### 5. Code Quality

**TypeScript:**

- ✅ Strict mode enabled
- ❌ Never use `any` - use proper types or `unknown`
- ✅ Always run `pnpm type-check` before committing

**ESLint:**

- ✅ Zero warnings policy (`--max-warnings 0`)
- ✅ Fix all warnings before committing

**Immutability:**

- ✅ Use `.toSorted()` instead of `.sort()`
- ✅ Use spread operators: `[...arr]`, `{...obj}`
- ❌ Never mutate props or state directly

**Testing:**

- ✅ New features require unit tests (Vitest)
- ✅ Complex flows require E2E tests (Playwright)
- ✅ Mock API calls in tests (see `src/test/mocks/`)

---

## Never Do These

1. ❌ **Never use Next.js patterns** - This is Vite
2. ❌ **Never include `/api` in `VITE_API_BASE_URL`** - Endpoints already include full paths
3. ❌ **Never use `any` type** - Use proper TypeScript types
4. ❌ **Never skip type checking** - Always run `pnpm type-check`
5. ❌ **Never skip linting** - ESLint must pass with zero warnings
6. ❌ **Never mutate props/state** - Use immutable patterns
7. ❌ **Never create sequential awaits** - Use `Promise.all()` for independent operations
8. ❌ **Never import from barrel files** - Import directly from source
9. ❌ **Never skip tests** - New features require tests
10. ❌ **Never commit `.env` file** - Only commit `.env.example`

---

## Environment Variables

**Required `.env` file:**

```env
VITE_API_BASE_URL=http://localhost:5000  # NO /api suffix!
VITE_USE_DAPR=false  # true = Dapr, false = Axios
VITE_DAPR_APP_ID=auth-service  # Only if VITE_USE_DAPR=true
VITE_DAPR_PORT=3500  # Only if VITE_USE_DAPR=true
```

---

## Validation Checklist

Before submitting code:

1. ✅ `pnpm type-check` passes
2. ✅ `pnpm lint` passes with zero warnings
3. ✅ `pnpm build` succeeds
4. ✅ `pnpm test` passes (if applicable)
5. ✅ `pnpm test:e2e` passes (if applicable)
6. ✅ No console errors in browser
7. ✅ Environment variables documented in `.env.example`

---

## References

- **Cursor Rules:** `.cursor/rules/*.mdc` - Modular rules with activation conditions
- **GitHub Copilot:** `.github/copilot-instructions.md` - Repository-wide instructions
- **React Best Practices:** `.agents/skills/vercel-react-best-practices/AGENTS.md` - Performance guide

---

**Trust these instructions.** Only search the codebase if instructions are incomplete for your specific task.
