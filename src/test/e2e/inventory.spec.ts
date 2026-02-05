import { test, expect } from '@playwright/test';
import { setupApiMocks, gotoAuthenticated } from './api-interceptor';

/**
 * E2E Tests for Inventory Management
 * Tests cover Products and Warehouses CRUD operations with mocked backend
 */

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test.describe('Products', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/inventory/products', { waitForTable: true });
    });
    
    test('should display products list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("Product 1")')).toBeVisible({ timeout: 5000 });
    });

    test('should create new product', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Find create button
      const createBtn = page.getByRole('button', { name: /add.*product/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator('input#name').fill('New Product E2E');
      await dialog.locator('input#sku').fill('SKU-E2E-001');
      await dialog.locator('input#unitPrice').fill('150');
      
      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

    test('should search products', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('Product 1');
      await page.keyboard.press('Enter');
      await expect(page.locator('td:has-text("Product 1")')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Warehouses', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/inventory/warehouses', { waitForTable: true });
    });
    
    test('should display warehouses list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('td:has-text("Main Warehouse")')).toBeVisible({ timeout: 5000 });
    });

    test('should edit warehouse', async ({ page }) => {
      // beforeEach already navigated and table is visible
      
      // Click edit button (icon button with title)
      const editBtn = page.getByTitle('Edit Warehouse').first();
      await expect(editBtn).toBeVisible({ timeout: 5000 });
      await editBtn.click();
      
      // Wait for dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify data is loaded
      const nameInput = dialog.locator('input#name');
      await expect(nameInput).toHaveValue('Main Warehouse');

      await nameInput.fill('Updated Warehouse Name');
      await dialog.locator('button[type="submit"]').click();
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Stock Operations', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/inventory/stock-ops');
    });
    
    test('should perform stock transfer', async ({ page }) => {
      // beforeEach already navigated

      // Find transfer button or form
      const transferBtn = page.locator('button:has-text("Transfer"), button:has-text("Stock Transfer")').first();
      if (await transferBtn.count() > 0) {
        await transferBtn.click();
        
        // Wait for dialog/form
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog.or(page.locator('form'))).toBeVisible({ timeout: 5000 });
        
        const form = dialog.or(page.locator('form')).first();
        
        await form.locator('select[name="productId"]').selectOption({ label: 'Product 1' });
        await form.locator('input[name="quantity"]').fill('10');
        await form.locator('select[name="fromWarehouseId"]').selectOption({ label: 'Main Warehouse' });
        await form.locator('select[name="toWarehouseId"]').selectOption({ label: 'Secondary Warehouse' });
        await form.locator('textarea[name="reason"]').fill('E2E Test Transfer');

        await form.locator('button[type="submit"]:has-text("Transfer")').click();
        await expect(dialog).not.toBeVisible({ timeout: 5000 });
      }
    });
  });
});
