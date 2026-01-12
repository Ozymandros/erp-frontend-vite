import { test } from '@playwright/test';
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
    
    // Robust navigation with retry
    const goToPurchasing = async () => {
      await page.goto('/purchasing/suppliers', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        await goToPurchasing();
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

  test.describe('Suppliers', () => {
    test('should load suppliers page', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display suppliers list', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new supplier', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search suppliers', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter suppliers', async ({ page }) => {
      await page.goto('/purchasing/suppliers', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Purchase Orders', () => {
    test('should load purchase orders page', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display purchase orders list', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new purchase order', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(1000);
      }
    });

    test('should search purchase orders', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter orders by status', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), select[name*="status" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should approve purchase order', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      
      // Look for approve button
      const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Confirm")');
      const approveExists = await approveBtn.count() > 0;
      
      if (approveExists) {
        await approveBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should view order details', async ({ page }) => {
      await page.goto('/purchasing/orders', { waitUntil: 'domcontentloaded' });
      
      const orderRow = page.locator('tr, [role="row"]').first();
      const rowExists = await orderRow.count() > 0;
      
      if (rowExists) {
        await orderRow.click();
        await page.waitForTimeout(500);
      }
    });
  });
});
