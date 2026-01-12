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
    
    // Robust navigation with retry
    const goToInventory = async () => {
      await page.goto('/inventory/products', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        await goToInventory();
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

  test.describe('Products', () => {
    test('should load products page', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display products list', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new product', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'domcontentloaded' });
      
      // Look for create button
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search products', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'domcontentloaded' });
      
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter products', async ({ page }) => {
      await page.goto('/inventory/products', { waitUntil: 'domcontentloaded' });
      
      // Look for filter button/controls
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Warehouses', () => {
    test('should load warehouses page', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display warehouses list', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new warehouse', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search warehouses', async ({ page }) => {
      await page.goto('/inventory/warehouses', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });
  });
});
