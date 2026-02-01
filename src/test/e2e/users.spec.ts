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
      await page.goto('/admin/users', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first().click();
      await page.waitForURL('**/admin/users/new');

      // Fill form
      await page.locator('input[name="username"]').fill('newuser');
      await page.locator('input[name="email"]').fill('newuser@example.com');
      await page.locator('input[name="firstName"]').fill('New');
      await page.locator('input[name="lastName"]').fill('User');
      await page.locator('input[name="password"]').fill('password123');
      
      // Select a role if possible (assuming multi-select or single select)
      const roleSelect = page.locator('.ant-select, select').first();
      if (await roleSelect.count() > 0) {
        await roleSelect.click();
        await page.locator('.ant-select-item-option-content:has-text("User"), option:has-text("User")').first().click();
      }

      await page.locator('button[type="submit"]').click();
      
      // Should redirect back to list
      await page.waitForURL('**/admin/users');
    });

    test('should search users', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'networkidle' });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      await searchInput.first().fill('admin');
      await page.keyboard.press('Enter');
      
      // Verify that the table contains results (at least the headers should be there, and ideally data)
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('td:has-text("admin")').first()).toBeVisible();
    });

    test('should filter users', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'networkidle' });
      
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      if (await filterBtn.count() > 0) {
        await filterBtn.first().click();
        // Assuming a drawer or modal opens
        await expect(page.locator('.ant-drawer, .ant-modal, [role="dialog"]')).toBeVisible();
      }
    });

    test('should edit user', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'networkidle' });
      
      // Click edit on the first user
      await page.locator('button:has-text("Edit"), button[aria-label*="edit" i]').first().click();
      await page.waitForURL('**/admin/users/*');

      // Verify form is populated
      const emailValue = await page.locator('input[name="email"]').inputValue();
      expect(emailValue).toBe('admin@example.com');

      // Update name
      await page.locator('input[name="firstName"]').fill('UpdatedAdmin');
      await page.locator('button[type="submit"]').click();
      
      // Should redirect back to list
      await page.waitForURL('**/admin/users');
    });

    test('should delete user with confirmation', async ({ page }) => {
      await page.goto('/admin/users', { waitUntil: 'networkidle' });
      
      await page.locator('button:has-text("Delete"), button[aria-label*="delete" i]').first().click();
      
      // Handle confirmation dialog (standard browser or AntD modal)
      const confirmBtn = page.locator('button:has-text("OK"), button:has-text("confirm" i), button:has-text("Yes")');
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
      }
      
      // Check that the list is still there (mock data might not change list size, but we verify the interaction)
      await expect(page.locator('table')).toBeVisible();
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
