import { test, expect } from "@playwright/test";
import { setupApiMocks, gotoAuthenticated } from "./api-interceptor";

test.describe("Projects Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test("lists projects and creates one", async ({ page }) => {
    await gotoAuthenticated(page, "/projects", { waitForTable: true });

    const createBtn = page.getByRole("button", { name: /add.*project/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    await createBtn.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.locator("input#description").fill("E2E Project Created");
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test("opens project detail", async ({ page }) => {
    await gotoAuthenticated(page, "/projects", { waitForTable: true });
    await page.locator('a[href="/projects/proj-1"]').first().click();
    await page.waitForURL("**/projects/proj-1", { timeout: 5000 });
    await expect(page.getByText(/PRJ-001/i)).toBeVisible();
  });
});
