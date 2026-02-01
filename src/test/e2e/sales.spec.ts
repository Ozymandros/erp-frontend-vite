import { test, expect } from '@playwright/test';
import { setupApiMocks, setupAuthenticatedSession } from './api-interceptor';

/**
 * E2E Tests for Sales Management
 * Tests cover Customers and Sales Orders with mocked backend
 */

test.describe('Sales Management', () => {
  
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    await page.context().clearCookies();
    await page.waitForTimeout(500);
    await setupApiMocks(page);
    
    // Setup authenticated session
    await setupAuthenticatedSession(page);
  });

  test.describe('Customers', () => {
    test('should display customers list', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("Customer 1")')).toBeVisible();
    });

    test('should create new customer', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/sales/customers/new');

      await page.locator('input[name="name"]').fill('New Customer E2E');
      await page.locator('input[name="email"]').fill('e2e@customer.com');
      await page.locator('input[name="creditLimit"]').fill('5000');
      
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/sales/customers');
    });
  });

  test.describe('Sales Orders', () => {
    test('should display sales orders list', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("SO001")')).toBeVisible();
    });

    test('should create new sales order with items', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/sales/orders/new');

      // Select customer
      await page.locator('select[name="customerId"]').selectOption({ label: 'Customer 1' });

      // Add items
      const addItemBtn = page.locator('button:has-text("Add Item"), button:has-text("Add Product")');
      if (await addItemBtn.count() > 0) {
        await addItemBtn.first().click();
        
        // Fill item details
        await page.locator('select[name*="productId"]').first().selectOption({ label: 'Product 1' });
        await page.locator('input[name*="quantity"]').first().fill('5');
        await page.locator('input[name*="unitPrice"]').first().fill('100');
      }

      // Verify total calculation in UI if possible
      const totalText = page.locator('text=Total, .total-amount').first();
      if (await totalText.count() > 0) {
        // Just verify it's visible or has a value
        await expect(totalText).toBeVisible();
      }

      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/sales/orders');
    });

    test('should view order details and check status', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'networkidle' });
      
      // Click on order number to view details
      await page.locator('a:has-text("SO001"), td:has-text("SO001")').first().click();
      
      // Should be on detail page
      await page.waitForURL('**/sales/orders/*');
      
      // Verify status is shown
      await expect(page.locator('text=Pending, text=Confirmed, .status-badge')).toBeVisible();
    });
  });
});
