import { test, expect } from "@playwright/test";
import { setupApiMocks, gotoAuthenticated } from "./api-interceptor";

/**
 * E2E Tests for CRM Management
 * Tests cover Leads and Opportunities with mocked backend
 */
test.describe("CRM Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test.describe("Leads", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/crm/leads", { waitForTable: true });
    });

    test("should create a new lead", async ({ page }) => {
      const createBtn = page.getByRole("button", { name: /add.*lead/i }).first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator("input#title").fill("Lead E2E Created");
      await dialog.locator('button[type="submit"]').click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });

    test("should qualify an existing lead", async ({ page }) => {
      await page
        .locator('a[href="/crm/leads/lead-1"]')
        .first()
        .click();
      await page.waitForURL("**/crm/leads/lead-1", { timeout: 5000 });

      const qualifyBtn = page
        .getByRole("button", { name: /qualify lead/i })
        .first();
      await expect(qualifyBtn).toBeVisible({ timeout: 5000 });
      await qualifyBtn.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator("select#customerId").selectOption({ label: "Customer 1" });
      await dialog.locator('button[type="submit"]').click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Opportunities", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/crm/opportunities", { waitForTable: true });
    });

    test("should create a new opportunity", async ({ page }) => {
      const createBtn = page
        .getByRole("button", { name: /add.*opportunity/i })
        .first();
      await expect(createBtn).toBeVisible({ timeout: 5000 });
      await createBtn.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5000 });

      await dialog.locator("input#name").fill("Opportunity E2E Created");
      await dialog
        .locator("select#customerId")
        .selectOption({ label: "Customer 1" });

      // Lead is optional; leave as "No lead selected"
      await dialog.locator('button[type="submit"]').click();

      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    });
  });
});

