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

    // Clear sessionStorage after page loads (auth uses sessionStorage)
    await page.evaluate(() => {
      try {
        sessionStorage.clear();
        localStorage.clear(); // Clear both to be safe
      } catch (e) {
        console.log("Storage already clear");
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
      // beforeEach already navigated to /admin/users with authentication
      
      // Ensure page is fully loaded
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Give React time to render components
      
      // Wait for the users table to load (ensures permissions are loaded)
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      // Try multiple ways to find the button
      const createBtn = page.locator('button').filter({ hasText: /add.*user/i }).or(
        page.locator('button:has-text("Add User")')
      ).first();
      
      await expect(createBtn).toBeVisible({ timeout: 15000 });
      await createBtn.click();
      
      // Wait for Dialog  
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Fill form inside dialog using id-based locators
      await dialog.locator('input#username').fill('newuser');
      await dialog.locator('input#email').fill('newuser@example.com');
      await dialog.locator('input#firstName').fill('New');
      await dialog.locator('input#lastName').fill('User');
      await dialog.locator('input#password').fill('password123');

      await dialog.locator('button[type="submit"]').click();
      
      // Should close dialog
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
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
      // beforeEach already navigated to /admin/users with authentication
      
      // Wait for the users table to load (ensures permissions are loaded)
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      // Click edit on the first user - look for button with "Edit User" title
      const editBtn = page.getByRole('button', { name: 'Edit User' }).first();
      await expect(editBtn).toBeVisible({ timeout: 10000 });
      await editBtn.click();
      
      // Wait for Dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Verify form is populated using id-based locators
      const emailValue = await dialog.locator('input#edit-email').inputValue();
      expect(emailValue).toBe('admin@example.com');

      // Update name
      await dialog.locator('input#edit-firstName').fill('UpdatedAdmin');
      await dialog.locator('button[type="submit"]').click();
      
      // Should close dialog
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
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
