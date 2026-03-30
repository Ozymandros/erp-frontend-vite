# CRM Module (Frontend Integration)

This document summarizes how the CRM module is integrated into the ERP Frontend (Vite + React Router).

## API Gateway Mapping

All CRM requests are routed through the API gateway under the shared base:

- `CRM_SERVICE_BASE = "/crm/api/crm"` (see `src/api/constants/endpoints.ts`)

Entity endpoints are defined under this base, for example:

- Leads: `"/crm/api/crm/leads"`
- Opportunities: `"/crm/api/crm/opportunities"`

The frontend API services live under `src/api/services/` and call the gateway endpoints via the shared API client (`AxiosApiClient` by default).

## Frontend Routes & Navigation

CRM pages are under `src/pages/crm/` and registered in `src/config/app-routes.tsx`:

- `/crm/leads` and `/crm/leads/:id`
- `/crm/opportunities` and `/crm/opportunities/:id`
- `/crm/accounts` and `/crm/accounts/:id`
- `/crm/contacts` and `/crm/contacts/:id`
- `/crm/activities` and `/crm/activities/:id`

The sidebar navigation group is configured in `src/config/routes.config.ts` under the `CRM` section.

## Permissions (RBAC)

CRM is protected by module-level permissions:

- `PERMISSION_MODULES.CRM` + `PERMISSION_ACTIONS.READ`

Route-to-permission mappings are defined in `src/config/routes.config.ts` via `ROUTE_PERMISSIONS`.

## UI Building Blocks

List pages use:

- `ListPageLayout` (standard header + search + table)
- `useDataTable` (querySpec, sorting, pagination)
- `useModulePermissions` + `useListActions` (create dialogs visibility)

Detail pages and dialogs are implemented with Zod form validation and the corresponding CRM API services.

## Test Strategy

### Unit Tests (Vitest)

- API services: `src/api/services/**/__tests__/*.service.test.ts`
- CRM dialogs/components: `src/components/crm/__tests__/*.test.tsx`

### E2E Tests (Playwright)

- CRM E2E spec: `src/test/e2e/crm.spec.ts`
- Backend mocking: `src/test/e2e/api-interceptor.ts`

The interceptor mocks CRM gateway calls under `/crm/api/crm/*` so the CRM UI can be tested without a running backend.

## Extending CRM Coverage

When adding new CRM UI flows:

1. Add/update the corresponding API service in `src/api/services/`.
2. Add/extend a dialog or page under `src/components/crm/` or `src/pages/crm/`.
3. Update `src/test/e2e/api-interceptor.ts` with new CRM handlers for any newly called endpoints.
4. Add Vitest unit tests for the new API service / dialog behavior.
5. Add Playwright coverage for the key user workflow.

