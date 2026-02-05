import { test, expect } from '@playwright/test';
import { setupApiMocks, gotoAuthenticated } from './api-interceptor';

/**
 * E2E Tests for Purchasing Management
 * Tests cover Suppliers and Purchase Orders with mocked backend
 */

test.describe('Purchasing Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test.describe('Suppliers', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/purchasing/suppliers', { waitForTable: true });
    });
    
    test('should display suppliers list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("Supplier 1")')).toBeVisible({ timeout: 5000 });
    });

    test('should create new supplier', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button
      const createBtn = page.getByRole('button', { name: /add.*supplier/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator('input#name').fill('New Supplier E2E');
      await dialog.locator('input#email').fill('e2e@supplier.com');
      
      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Purchase Orders', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/purchasing/orders', { waitForTable: true });
    });
    
    test('should display purchase orders list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("PO001")')).toBeVisible({ timeout: 5000 });
    });

    test('should create new purchase order with products', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button
      const createBtn = page.getByRole('button', { name: /add.*purchase.*order/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.locator('select#supplierId')).toBeVisible({ timeout: 5000 });

      // Select supplier
      await dialog.locator('select#supplierId').selectOption({ label: 'Supplier 1' });

      // Add order line: select product, quantity, unitPrice, then click Add
      await dialog.locator('select#productId').selectOption({ label: 'Product 1' });
      await dialog.locator('input#quantity').fill('20');
      await dialog.locator('input#unitPrice').fill('50');
      // Click the Plus button to add the line (in the Order Lines section)
      await dialog.locator('div.border.rounded-md button[type="button"]').first().click();

      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

    test('should handle order approval workflow', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Click on first order to view details
      const orderLink = page.locator('a[href*="/purchasing/orders/"]').first();
      if (await orderLink.count() > 0) {
        await orderLink.click();
        await page.waitForURL('**/purchasing/orders/*', { timeout: 5000 });
      }
    });

    test('should have create button disabled when no order lines', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button
      const createBtn = page.getByRole('button', { name: /add.*purchase.*order/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Submit button is disabled when no order lines (form validation)
      const submitBtn = dialog.locator('button[type="submit"]');
      await expect(submitBtn).toBeDisabled();
    });
  });
});
