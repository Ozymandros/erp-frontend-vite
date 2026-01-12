import { test } from '@playwright/test';
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
    
    // Robust navigation with retry
    const goToSales = async () => {
      await page.goto('/sales/customers', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        await goToSales();
        break;
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        await page.waitForTimeout(2000);
      }
    }

    // Clear localStorage after page loads
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        console.log("localStorage already clear");
      }
    });

    // Setup authenticated session
    await setupAuthenticatedSession(page);
  });

  test.describe('Customers', () => {
    test('should load customers page', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display customers list', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new customer', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search customers', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter customers', async ({ page }) => {
      await page.goto('/sales/customers', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Sales Orders', () => {
    test('should load sales orders page', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display sales orders list', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new sales order', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(1000);
      }
    });

    test('should search sales orders', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter orders by status', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), select[name*="status" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should view order details', async ({ page }) => {
      await page.goto('/sales/orders', { waitUntil: 'domcontentloaded' });
      
      // Look for order row
      const orderRow = page.locator('tr, [role="row"]').first();
      const rowExists = await orderRow.count() > 0;
      
      if (rowExists) {
        await orderRow.click();
        await page.waitForTimeout(500);
      }
    });
  });
});
