import { test, expect } from '@playwright/test';
import { setupApiMocks, setupAuthenticatedSession } from './api-interceptor';

/**
 * E2E Tests for Inventory Management
 * Tests cover Products and Warehouses CRUD operations with mocked backend
 */

test.describe('Inventory Management', () => {
  
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    await page.context().clearCookies();
    await page.waitForTimeout(500);
    await setupApiMocks(page);
    
    // Setup authenticated session
    await setupAuthenticatedSession(page);
  });

  test.describe('Products', () => {
    test('should display products list', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("Product 1")')).toBeVisible();
    });

    test('should create new product', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/inventory/products/new');

      await page.locator('input[name="name"]').fill('New Product E2E');
      await page.locator('input[name="sku"]').fill('SKU-E2E-001');
      await page.locator('input[name="price"]').fill('150');
      
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/inventory/products');
    });

    test('should search products', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'networkidle' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      await searchInput.first().fill('Product 1');
      await page.keyboard.press('Enter');
      
      await expect(page.locator('td:has-text("Product 1")')).toBeVisible();
    });
  });

  test.describe('Warehouses', () => {
    test('should display warehouses list', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'networkidle' });
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("Main Warehouse")')).toBeVisible();
    });

    test('should edit warehouse', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Edit"), button[aria-label*="edit" i]').first().click();
      await page.waitForURL('**/inventory/warehouses/*');

      // Verify data is loaded
      const nameInput = page.locator('input[name="name"]');
      await expect(nameInput).toHaveValue('Main Warehouse');

      await nameInput.fill('Updated Warehouse Name');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/inventory/warehouses');
    });
  });

  test.describe('Stock Operations', () => {
    test('should perform stock transfer', async ({ page }) => {
      // Assuming there is a page or modal for this
      await page.goto('/inventory/stock-ops', { waitUntil: 'networkidle' }).catch(() => {
        // Fallback or navigate via menu if direct URL fails in some environments
      });

      // Find transfer form if it exists or click to open it
      const transferBtn = page.locator('button:has-text("Transfer"), button:has-text("Stock Transfer")');
      if (await transferBtn.count() > 0) {
        await transferBtn.first().click();
      }

      const form = page.locator('form:has-text("Transfer Stock")');
      if (await form.count() === 0) {
          // If no specific form text, try to find by fields
          await expect(page.locator('select[name="productId"]')).toBeVisible();
      }

      await page.locator('select[name="productId"]').selectOption({ label: 'Product 1' });
      await page.locator('input[name="quantity"]').fill('10');
      await page.locator('select[name="fromWarehouseId"]').selectOption({ label: 'Main Warehouse' });
      await page.locator('select[name="toWarehouseId"]').selectOption({ label: 'Secondary Warehouse' });
      await page.locator('textarea[name="reason"]').fill('E2E Test Transfer');

      await page.locator('button[type="submit"]:has-text("Transfer")').click();
      
      await expect(page.locator('text=success, text=successfully, .ant-message-success')).toBeVisible();
    });
  });
});
