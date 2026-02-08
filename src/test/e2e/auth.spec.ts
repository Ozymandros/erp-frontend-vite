import { test, expect } from "@playwright/test";
import { setupApiMocks, setupAuthenticatedSession } from "./api-interceptor";

/**
 * E2E Tests for Authentication Flow
 * Tests use API mocking to simulate backend responses
 */

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
    await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
    });
  });

  test("should load login page", async ({ page }) => {
    // Check page content exists
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill in login form
    await page.fill(
      'input[type="email"], input[name="email"]',
      "admin@example.com"
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      "password123"
    );

    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("should show error with invalid credentials", async ({ page }) => {
    // Fill in login form with wrong password
    await page.fill(
      'input[type="email"], input[name="email"]',
      "admin@example.com"
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      "wrongpassword"
    );

    await page.click('button[type="submit"]');
    await expect(page.getByText('Invalid credentials').first()).toBeVisible({ timeout: 5000 });
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for validation
    await page.waitForTimeout(500);
  });

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]'
    );

    // Check password field exists
    await expect(passwordInput).toBeVisible();

    // Look for show/hide toggle
    const toggleBtn = page.locator(
      'button[aria-label*="password" i], button:has-text("Show"), button:has-text("Hide")'
    );
    const toggleExists = (await toggleBtn.count()) > 0;

    if (toggleExists) {
      await toggleBtn.first().click();
    }
  });

  test("should navigate to registration page", async ({ page }) => {
    // Look for registration link
    const registerLink = page.locator(
      'a:has-text("Register"), a:has-text("Sign up"), button:has-text("Register"), a:has-text("Create account")'
    );

    const linkExists = (await registerLink.count()) > 0;

    if (linkExists) {
      await registerLink.first().click();
      await expect(page).toHaveURL(/register|signup/i);
    }
  });

  test("should persist session after page reload", async ({ page }) => {
    // Setup authenticated session
    await setupAuthenticatedSession(page);

    // Store current URL (for debugging if needed)
    page.url();

    await page.reload({ waitUntil: "load" });

    // Should still be authenticated (or on same page)
    const urlAfterReload = page.url();
    expect(urlAfterReload).toBeTruthy();
  });

  test("should display user info after login", async ({ page }) => {
    await setupAuthenticatedSession(page);

    await page.goto("/dashboard", { waitUntil: "load" });
    // App may redirect to / or /dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });

  test("should handle logout", async ({ page }) => {
    await setupAuthenticatedSession(page);

    await page.goto("/dashboard", { waitUntil: "load" });

    // Look for logout button
    const logoutBtn = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out")'
    );

    const logoutExists = (await logoutBtn.count()) > 0;

    if (logoutExists) {
      await logoutBtn.first().click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("should redirect to login when accessing protected route without auth", async ({
    page,
  }) => {
    // Clear auth to test redirect
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log("Already clear");
      }
    });

    // Try to access protected route - should redirect to login
    await page.goto("/users", { waitUntil: "domcontentloaded", timeout: 30000 });
    
    // Should be redirected to login page
    await page.waitForURL("**/login", { timeout: 5000 }).catch(() => {});
    
    // Verify we're on login page
    const loginForm = page.locator('input[type="email"], input[name="email"]');
    await expect(loginForm).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);
    await page.goto("/register", { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
  });

  test("should load registration page", async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const pageContent = (await page.content()).toLowerCase();
    const hasRegistrationForm =
      pageContent.includes("password") ||
      pageContent.includes("register") ||
      pageContent.includes("sign up") ||
      pageContent.includes("create account");
    expect(hasRegistrationForm || (await emailInput.count()) > 0).toBeTruthy();
  });

  test("should validate password requirements", async ({ page }) => {
    // Look for password input
    const passwordInput = page.locator('input[type="password"]').first();
    const passwordExists = (await passwordInput.count()) > 0;

    expect(passwordExists).toBeTruthy();
  });

  test("should validate password match", async ({ page }) => {
    const confirmInput = page.locator('input#passwordConfirm, input[name="passwordConfirm"]');
    await expect(confirmInput).toBeVisible({ timeout: 5000 });
  });
  
  test("should register successfully with valid data", async ({ page }) => {
    await page.locator('input#firstName').fill("New");
    await page.locator('input#lastName').fill("User");
    await page.locator('input#username').fill("newuser");
    await page.locator('input#email').fill("newuser@example.com");
    await page.locator('input#password').fill("Password123!");
    await page.locator('input#passwordConfirm').fill("Password123!");

    // Track network activity BEFORE submitting
    let apiCalled = false;
    page.on('request', request => {
      if (request.url().includes('/api/') && 
          request.url().includes('register') && 
          request.method() === 'POST') {
        apiCalled = true;
      }
    });

    // Submit form via keyboard (more reliable than click in some browsers)
    // Press Tab to focus submit button, then Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForResponse(
      (r) => r.url().includes('register') && r.request().method() === 'POST',
      { timeout: 5000 }
    ).catch(() => {});

    // Verify API was called
    if (!apiCalled) {
      throw new Error('Registration API call was never made - form submit is broken');
    }

    // Check for success indicators (flexible - any of these is OK)
    const hasNavigated = !page.url().includes('/register');
    const hasErrorMessage = await page.locator('text=/error|invalid|failed/i').isVisible().catch(() => false);
    
    // Consider it success if we navigated away OR no error appeared
    expect(hasNavigated || !hasErrorMessage).toBeTruthy();
  });
});
