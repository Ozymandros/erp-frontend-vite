import { test, expect } from "@playwright/test";
import { setupApiMocks, gotoAuthenticated } from "./api-interceptor";

test.describe("Projects Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
  });

  test("lists projects and creates one", async ({ page }) => {
    await gotoAuthenticated(page, "/projects", { waitForTable: true });

    await expect(page.getByRole("link", { name: "PRJ-001" })).toBeVisible({
      timeout: 10000,
    });

    const createBtn = page.getByRole("button", { name: /add.*project/i }).first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    await createBtn.click();

    const dialog = page.getByRole("dialog", { name: /create project/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await expect(dialog.locator("select#customerId option")).toHaveCount(3, {
      timeout: 10000,
    });

    await dialog.locator("input#description").fill("E2E Project Created");
    await dialog.locator("select#customerId").selectOption({ label: "Customer 1" });
    await dialog.getByRole("button", { name: /^create$/i }).click();

    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByText("E2E Project Created")).toBeVisible({
      timeout: 10000,
    });
  });

  test("opens project detail", async ({ page }) => {
    await gotoAuthenticated(page, "/projects", { waitForTable: true });

    const projectLink = page.getByRole("link", { name: "PRJ-001" });
    await expect(projectLink).toBeVisible({ timeout: 10000 });
    await projectLink.click();

    await page.waitForURL("**/projects/proj-1", { timeout: 10000 });
    await expect(page.getByText(/PRJ-001/i)).toBeVisible();
    await expect(page.getByText(/E2E Project/i)).toBeVisible();
  });
});
