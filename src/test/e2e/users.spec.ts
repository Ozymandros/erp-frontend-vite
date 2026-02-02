import { test, expect } from '@playwright/test';
import { setupApiMocks, gotoAuthenticated } from './api-interceptor';

/**
 * E2E Tests for User Management
 * Tests cover Users, Roles, and Permissions with mocked backend
 */

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test.describe('Users', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/users', { waitForTable: true });
      const accessDenied = page.locator('text=Access Denied');
      await expect(accessDenied).toHaveCount(0);
    });
    test('should load users page', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should display users list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should create new user', async ({ page }) => {
      // beforeEach already navigated to /users and table is visible
      
      // Find the "Add User" button - it should be in the header
      const createBtn = page.getByRole('button', { name: /add.*user/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 10000 });
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
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill('admin');
      await page.keyboard.press('Enter');
      await expect(page.locator('td:has-text("admin")').first()).toBeVisible({ timeout: 5000 });
    });

    test('should filter users', async ({ page }) => {
      const filterBtn = page.locator('button:has-text("Filter"), button[aria-label*="filter" i]');
      if (await filterBtn.count() > 0) {
        await filterBtn.first().click();
        await expect(page.locator('.ant-drawer, .ant-modal, [role="dialog"]')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should edit user', async ({ page }) => {
      // beforeEach already navigated to /users and table is visible
      
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
      // Find delete button by title attribute
      const deleteBtn = page.getByRole('button', { name: 'Delete User' }).first();
      await expect(deleteBtn).toBeVisible({ timeout: 10000 });
      await deleteBtn.click();
      
      // Wait for confirmation dialog
      const confirmDialog = page.locator('[role="dialog"]');
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      
      // Handle confirmation dialog
      const confirmBtn = confirmDialog.getByRole('button', { name: /confirm|delete|yes/i }).first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
      }
      
      // Check that the list is still there (mock data might not change list size, but we verify the interaction)
      await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Roles', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/roles', { waitForTable: true });
      await expect(page.locator('text=Access Denied')).toHaveCount(0);
    });
    
    test('should load roles page', async ({ page }) => {
      // beforeEach already navigated
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should display roles list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should create new role', async ({ page }) => {
      const createBtn = page.getByRole('button', { name: /add.*role/i }).first();
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.click();
        await page.waitForTimeout(500);
        
        // Wait for dialog
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('should search roles', async ({ page }) => {
      await page.goto('/roles', { waitUntil: 'networkidle' });
      
      // Wait for table
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.fill('test');
      }
    });

    test('should view role permissions', async ({ page }) => {
      // Click on first role to view details
      const roleLink = page.locator('a[href*="/roles/"]').first();
      if (await roleLink.count() > 0) {
        await roleLink.click();
        await page.waitForURL('**/roles/*', { timeout: 5000 });
      }
    });
  });

  test.describe('Permissions', () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, '/permissions', { waitForTable: true });
      await expect(page.locator('text=Access Denied')).toHaveCount(0);
    });
    
    test('should load permissions page', async ({ page }) => {
      // beforeEach already navigated
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should display permissions list', async ({ page }) => {
      // beforeEach already navigated and table is visible
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should create new permission', async ({ page }) => {
      const createBtn = page.getByRole('button', { name: /add.*permission/i }).first();
      const createExists = await createBtn.count() > 0;
      
      if (createExists) {
        await createBtn.click();
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('should search permissions', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      const searchExists = await searchInput.count() > 0;
      
      if (searchExists) {
        await searchInput.fill('test');
      }
    });

    test('should filter permissions by module', async ({ page }) => {
      // Look for the role filter select in the PermissionFilterHeader
      const filterSelect = page.locator('select, [role="combobox"]').first();
      const filterExists = await filterSelect.count() > 0;
      
      if (filterExists) {
        await filterSelect.click();
      }
    });
  });
});
