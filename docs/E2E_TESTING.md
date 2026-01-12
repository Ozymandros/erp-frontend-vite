# End-to-End Testing Guide

This guide explains how to run and maintain the E2E tests for the ERP Frontend application using Playwright.

## Overview

The E2E test suite provides comprehensive coverage of user workflows by:
- **Mocking all backend API calls** for isolated frontend testing
- **Testing meaningful interactions** that users perform in the application
- **Ensuring compliance** with documented backend API functionality
- **Running fast and reliably** without backend dependencies

## Quick Start

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run all E2E tests
pnpm test:e2e

# Run with browser visible (headed mode)
pnpm playwright test --headed

# Run specific test file
pnpm playwright test src/test/e2e/auth.spec.ts

# Run in interactive UI mode
pnpm playwright test --ui

# View test report
pnpm playwright show-report
```

## Test Structure

### Test Files

```
src/test/e2e/
├── auth.spec.ts          # Authentication & authorization (16 tests)
├── inventory.spec.ts     # Products & warehouses (20 tests)
├── sales.spec.ts         # Customers & sales orders (15 tests)
├── purchasing.spec.ts    # Suppliers & purchase orders (18 tests)
└── users.spec.ts         # Users, roles & permissions (20 tests)
```

### Mock Infrastructure

```
src/test/mocks/
├── api-mocks.ts          # Reusable API mocking functions
└── fixtures.ts           # Sample test data matching backend DTOs
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { mockLogin, mockGetProducts } from '../mocks/api-mocks';
import { mockAuthResponse, mockProducts } from '../mocks/fixtures';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup: Login and mock API calls
    await mockLogin(page, mockAuthResponse);
    await mockGetProducts(page, mockProducts);
    
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should display products list', async ({ page }) => {
    // Navigate to page
    await page.goto('/inventory/products');
    
    // Assert: Check what's displayed
    await expect(page.locator('text=Premium Widget')).toBeVisible();
  });
});
```

### Using Mock Helpers

The `api-mocks.ts` file provides helper functions for all API endpoints:

```typescript
// Mock successful responses
await mockGetProducts(page, mockProducts);
await mockCreateProduct(page, newProduct);
await mockUpdateProduct(page, productId, updatedProduct);

// Mock paginated responses
await mockPaginatedResponse(page, '**/products**', products, 1, 10);

// Mock error responses
await mockApiError(page, '**/products**', 'Product not found', 404);

// Mock delays for loading states
await mockApiSuccess(page, '**/products**', data, { delay: 1000 });
```

### Using Test Fixtures

The `fixtures.ts` file contains realistic test data:

```typescript
import { 
  mockAdminUser,      // Admin user with all permissions
  mockManagerUser,    // Manager with limited permissions
  mockProducts,       // 5 sample products
  mockWarehouses,     // 3 sample warehouses
  mockCustomers,      // 3 sample customers
  mockSalesOrders,    // 2 sample sales orders
  mockSuppliers,      // 3 sample suppliers
  mockPurchaseOrders, // 2 sample purchase orders
} from '../mocks/fixtures';
```

## Test Patterns

### 1. Authentication Setup

```typescript
test.beforeEach(async ({ page }) => {
  await mockLogin(page, mockAuthResponse);
  await mockAuthenticatedState(page, mockAdminUser);
  
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### 2. CRUD Operations

```typescript
test('should create new item', async ({ page }) => {
  // Mock the create endpoint
  await mockCreateProduct(page, newProduct);
  
  // Open dialog
  await page.click('button:has-text("Create")');
  
  // Fill form
  await page.fill('input[name="name"]', 'New Product');
  await page.fill('input[name="price"]', '99.99');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Assert success
  await expect(page.locator('text=/success/i')).toBeVisible();
});
```

### 3. Testing Validation

```typescript
test('should show validation errors', async ({ page }) => {
  await page.goto('/products');
  
  // Try to submit empty form
  await page.click('button:has-text("Create")');
  await page.click('button[type="submit"]');
  
  // Assert validation messages
  await expect(page.locator('text=/required/i')).toHaveCount(3);
});
```

### 4. Testing Error Handling

```typescript
test('should handle API errors gracefully', async ({ page }) => {
  // Mock API error
  await mockApiError(
    page,
    '**/products',
    'Server error',
    500
  );
  
  await page.goto('/products');
  
  // Assert error message is displayed
  await expect(page.locator('text=/error occurred/i')).toBeVisible();
});
```

### 5. Testing Search & Filter

```typescript
test('should filter by search term', async ({ page }) => {
  await mockGetProducts(page, mockProducts);
  
  await page.goto('/products');
  
  // Enter search
  await page.fill('input[type="search"]', 'Widget');
  
  // Wait for results
  await page.waitForTimeout(500);
  
  // Assert filtered results
  await expect(page.locator('text=Premium Widget')).toBeVisible();
});
```

## Selectors Best Practices

### Good Selectors (Stable)

```typescript
// Use data-testid
await page.click('[data-testid="create-button"]');

// Use semantic HTML
await page.click('button[type="submit"]');

// Use accessible labels
await page.fill('input[name="email"]', 'test@example.com');

// Use text content
await page.click('button:has-text("Save")');

// Use ARIA roles
await page.click('[role="dialog"]');
```

### Avoid (Unstable)

```typescript
// CSS classes (can change with styling)
await page.click('.btn-primary');

// XPath (brittle)
await page.click('//div[3]/button[1]');

// Deep nesting
await page.click('div > div > div > button');
```

## Debugging Tests

### Run in Headed Mode

```bash
# See browser while tests run
pnpm playwright test --headed

# Run with slow-mo for easier observation
pnpm playwright test --headed --slow-mo=1000
```

### Debug Specific Test

```bash
# Debug single test
pnpm playwright test --debug src/test/e2e/auth.spec.ts

# Debug test by name
pnpm playwright test --debug -g "should login successfully"
```

### Use Playwright Inspector

```typescript
test('debugging example', async ({ page }) => {
  // Add breakpoint in code
  await page.pause();
  
  // Test execution will pause here
  await page.goto('/products');
});
```

### View Trace

```bash
# Run with trace
pnpm playwright test --trace on

# View trace after failure
pnpm playwright show-trace trace.zip
```

## Configuration

### playwright.config.ts

Key configuration options:

```typescript
export default defineConfig({
  testDir: './src/test/e2e',        // E2E test location
  fullyParallel: true,                // Run tests in parallel
  retries: process.env.CI ? 2 : 0,   // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Sequential in CI
  
  use: {
    baseURL: 'http://localhost:5173', // Vite dev server
    trace: 'on-first-retry',          // Trace on failure
    screenshot: 'only-on-failure',    // Capture screenshots
    video: 'retain-on-failure',       // Record video on failure
  },
  
  webServer: {
    command: 'pnpm dev',              // Start dev server
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: pnpm install

- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps

- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Coverage Summary

| Module | Test Files | Test Cases | Coverage |
|--------|-----------|------------|----------|
| Authentication | 1 | 16 | Login, logout, registration, protected routes |
| Inventory | 1 | 20 | Products & warehouses CRUD, search, filter |
| Sales | 1 | 15 | Customers & sales orders, stock checking |
| Purchasing | 1 | 18 | Suppliers & POs, approval workflows |
| Users | 1 | 20 | Users, roles, permissions management |
| **Total** | **5** | **89+** | **Comprehensive E2E coverage** |

## Maintenance

### Adding New Tests

1. Create test data in `fixtures.ts`
2. Add mock functions in `api-mocks.ts` if needed
3. Write tests following existing patterns
4. Run tests locally before committing

### Updating Tests

When UI changes:
1. Update selectors if needed
2. Update assertions to match new behavior
3. Run all affected tests
4. Update documentation if workflows change

### Common Issues

**Test timeout:**
```typescript
// Increase timeout for slow operations
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

**Flaky test:**
```typescript
// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('text=Data loaded', { timeout: 10000 });

// Use soft assertions
await expect.soft(page.locator('text=Optional')).toBeVisible();
```

**Element not found:**
```typescript
// Debug: Print page content
console.log(await page.content());

// Check if element exists
const exists = await page.locator('button').count() > 0;

// Use more flexible selectors
await page.click('button:has-text("Save"), button:has-text("Submit")');
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing Tests](https://playwright.dev/docs/writing-tests)
- [API Testing](https://playwright.dev/docs/api-testing)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Support

For questions or issues:
1. Check this documentation
2. Review existing test files for examples
3. Consult Playwright documentation
4. Ask team members for help
