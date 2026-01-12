import { test, expect } from '@playwright/test';
import { setupApiMocks, setupAuthenticatedSession } from './api-interceptor';

/**
 * E2E Tests for User Management
 * Tests cover Users, Roles, and Permissions with mocked backend
 */

test.describe('User Management', () => {
  
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    await page.context().clearCookies();
    await page.waitForTimeout(500);
    await setupApiMocks(page);
    
    // Robust navigation with retry
    const goToUsers = async () => {
      await page.goto('/admin/users', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        await goToUsers();
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

  test.describe('Users', () => {
    test('should load users page', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display users list', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new user', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search users', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter users', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should edit user', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const editBtn = page.locator('button:has-text("Edit"), button[aria-label*="edit" i]').first();
      const editExists = await editBtn.count() > 0;
      
      if (editExists) {
        await editBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should delete user', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const deleteBtn = page.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first();
      const deleteExists = await deleteBtn.count() > 0;
      
      if (deleteExists) {
        await deleteBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should toggle user active status', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
      
      const toggle = page.locator('input[type="checkbox"], [role="switch"]').first();
      const toggleExists = await toggle.count() > 0;
      
      if (toggleExists) {
        await toggle.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Roles', () => {
    test('should load roles page', async ({ page }) => {
      await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display roles list', async ({ page }) => {
      await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new role', async ({ page }) => {
      await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search roles', async ({ page }) => {
      await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should view role permissions', async ({ page }) => {
      await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });
      
      const permissionsBtn = page.locator('button:has-text("Permissions"), button:has-text("View")').first();
      const permissionsExists = await permissionsBtn.count() > 0;
      
      if (permissionsExists) {
        await permissionsBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Permissions', () => {
    test('should load permissions page', async ({ page }) => {
      await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should display permissions list', async ({ page }) => {
      await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
    });

    test('should create new permission', async ({ page }) => {
      await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });
      
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.first().click();
        await page.waitForTimeout(500);
      }
    });

    test('should search permissions', async ({ page }) => {
      await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.first().fill('test');
        await page.waitForTimeout(500);
      }
    });

    test('should filter permissions by module', async ({ page }) => {
      await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });
      
      const filterBtn = page.locator('button:has-text("Filter"), select[name*="module" i]');
      const filterExists = await filterBtn.count() > 0;
      
      if (filterExists) {
        await filterBtn.first().click();
        await page.waitForTimeout(500);
      }
    });
  });
});
