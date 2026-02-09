import { test, expect } from '@playwright/test';
import { setupApiMocks, gotoAuthenticated } from './api-interceptor';

test.describe('Warehouse Stocks', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await gotoAuthenticated(page, '/inventory/warehouse-stocks');
  });

  test('should display warehouse stocks list', async ({ page }) => {
    await expect(page.locator('h1:has-text("Warehouse Stocks")')).toBeVisible();
    // Default filter is 'Low Stock', expect at least one item (mock data might vary)
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter by product', async ({ page }) => {
    const productSelect = page.getByLabel('Filter by product');
    await productSelect.selectOption({ label: 'Product 1' });
    
    // Check if the list updates or the card description changes
    await expect(page.locator('text=Stock for Product 1')).toBeVisible();
  });

  test('should filter by warehouse', async ({ page }) => {
    const warehouseSelect = page.getByLabel('Filter by warehouse');
    await warehouseSelect.selectOption({ label: 'Main Warehouse' });
    
    await expect(page.locator('text=Stock in Main Warehouse')).toBeVisible();
  });

  test('should switch between Low Stock and All Stocks', async ({ page }) => {
    const allStocksBtn = page.getByRole('button', { name: /all stocks/i });
    const lowStockBtn = page.getByRole('button', { name: /low stock/i });

    await allStocksBtn.click();
    await expect(page.locator('text=All warehouse stocks')).toBeVisible();

    await lowStockBtn.click();
    await expect(page.locator('text=Products with low stock levels')).toBeVisible();
  });

  test('should handle exports', async ({ page }) => {
    const exportXlsxBtn = page.getByRole('button', { name: /export xlsx/i });
    const exportPdfBtn = page.getByRole('button', { name: /export pdf/i });

    await expect(exportXlsxBtn).toBeEnabled();
    await expect(exportPdfBtn).toBeEnabled();
    
    // We don't necessarily need to trigger the actual download in E2E mock tests
    // unless we want to verify the API call.
  });
});
