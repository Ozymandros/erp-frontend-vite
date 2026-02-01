import { test, expect } from '@playwright/test';
import { setupApiMocks, setupAuthenticatedSession } from './api-interceptor';

/**
 * E2E Tests for Purchasing Management
 * Tests cover Suppliers and Purchase Orders with mocked backend
 */

test.describe('Purchasing Management', () => {
  
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    await page.context().clearCookies();
    await page.waitForTimeout(500);
    await setupApiMocks(page);
    
    // Setup authenticated session
    await setupAuthenticatedSession(page);
  });

  test.describe('Suppliers', () => {
    test('should display suppliers list', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("Supplier 1")')).toBeVisible();
    });

    test('should create new supplier', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/purchasing/suppliers/new');

      await page.locator('input[name="name"]').fill('New Supplier E2E');
      await page.locator('input[name="email"]').fill('e2e@supplier.com');
      await page.locator('select[name="paymentTerms"]').selectOption('Net30');
      
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/purchasing/suppliers');
    });
  });

  test.describe('Purchase Orders', () => {
    test('should display purchase orders list', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("PO001")')).toBeVisible();
    });

    test('should create new purchase order with products', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/purchasing/orders/new');

      // Select supplier
      await page.locator('select[name="supplierId"]').selectOption({ label: 'Supplier 1' });

      // Add product items
      const addRowBtn = page.locator('button:has-text("Add Product"), button:has-text("Add Item")');
      if (await addRowBtn.count() > 0) {
        await addRowBtn.first().click();
        
        await page.locator('select[name*="productId"]').first().selectOption({ label: 'Product 1' });
        await page.locator('input[name*="quantity"]').first().fill('20');
        await page.locator('input[name*="unitPrice"]').first().fill('50');
      }

      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/purchasing/orders');
    });

    test('should handle order approval workflow', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'networkidle' });
      
      // Click on a draft order
      await page.locator('td:has-text("Draft")').first().click();
      await page.waitForURL('**/purchasing/orders/*');

      const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Confirm Approval")');
      if (await approveBtn.count() > 0) {
        await approveBtn.first().click();
        // Verify success message or status change
        await expect(page.locator('text=Approved, .status-badge:has-text("Approved")')).toBeVisible();
      }
    });

    test('should show error on invalid order submission', async ({ page }) => {
      await page.goto('/purchasing/orders/new', { waitUntil: 'networkidle' });
      
      // Submit without filling anything
      await page.locator('button[type="submit"]').click();
      
      // Should show validation errors
      await expect(page.locator('text=required, .text-red-500, .ant-form-item-explain-error')).toBeVisible();
    });
  });
});
