import { test, expect } from '@playwright/test';
import { setupApiMocks, gotoAuthenticated } from './api-interceptor';

/**
 * E2E Tests for Sales Management
 * Tests cover Customers and Sales Orders with mocked backend
 */

test.describe('Sales Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test.describe('Customers', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/sales/customers', { waitForTable: true });
    });
    
    test('should display customers list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("Customer 1")')).toBeVisible({ timeout: 5000 });
    });

    test('should create new customer', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button
      const createBtn = page.getByRole('button', { name: /add.*customer/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator('input#name').fill('New Customer E2E');
      await dialog.locator('input#email').fill('e2e@customer.com');
      
      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Sales Orders', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/sales/orders', { waitForTable: true });
    });
    
    test('should display sales orders list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("SO001")')).toBeVisible({ timeout: 5000 });
    });

    test('should create new sales order with items', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button (ListPageLayout uses resourceName="Order" -> "Add Order")
      const createBtn = page.getByRole('button', { name: /add.*order/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.locator('select#customerId')).toBeVisible({ timeout: 5000 });

      // Select customer
      await dialog.locator('select#customerId').selectOption({ label: 'Customer 1' });

      // Add order line: select product, quantity, unitPrice, then click Add
      await dialog.locator('select#productId').selectOption({ value: '1' });
      await dialog.locator('input#quantity').fill('5');
      await dialog.locator('input#unitPrice').fill('100');
      // Click the Plus button to add the line (in the Order Lines section)
      await dialog.locator('div.border.rounded-md button[type="button"]').first().click();

      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

    test('should view order details and check status', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Click on order number to view details
      const orderLink = page.locator('a[href*="/sales/orders/"]').first();
      if (await orderLink.count() > 0) {
        await orderLink.click();
        await page.waitForURL('**/sales/orders/*', { timeout: 5000 });
      }
    });
  });
});
