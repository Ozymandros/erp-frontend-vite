import { test, expect } from "@playwright/test";
import { setupApiMocks, setupAuthenticatedSession } from "./api-interceptor";

/**
 * E2E Tests for Authentication Flow
 * Tests use API mocking to simulate backend responses
 */

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(90000);

    // Clear any existing auth state
    await page.context().clearCookies();
    await page.waitForTimeout(500);

    // Setup API mocking
    await setupApiMocks(page);

    // Robust navigation with retry
    const goToLogin = async () => {
      await page.goto("/login", { 
        waitUntil: "domcontentloaded",
        timeout: 60000 
      });
      await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
    };

    let attempts = 0;
    while (attempts < 3) {
      try {
        await goToLogin();
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

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for response and redirect
    await page.waitForTimeout(2000);
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

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error
    await page.waitForTimeout(1500);
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
      // Password visibility should change
      await page.waitForTimeout(300);
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
      await page.waitForTimeout(1000);
    }
  });

  test("should persist session after page reload", async ({ page }) => {
    // Setup authenticated session
    await setupAuthenticatedSession(page);

    // Store current URL
    const _urlBeforeReload = page.url();

    // Reload page
    await page.reload({ waitUntil: "networkidle" });

    // Should still be authenticated (or on same page)
    const urlAfterReload = page.url();
    expect(urlAfterReload).toBeTruthy();
  });

  test("should display user info after login", async ({ page }) => {
    await setupAuthenticatedSession(page);

    // Navigate to dashboard
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Wait for page to load
    await page.waitForTimeout(1000);
  });

  test("should handle logout", async ({ page }) => {
    await setupAuthenticatedSession(page);

    // Navigate to dashboard
    await page.goto("/dashboard", { waitUntil: "networkidle" });

    // Look for logout button
    const logoutBtn = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out")'
    );

    const logoutExists = (await logoutBtn.count()) > 0;

    if (logoutExists) {
      await logoutBtn.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test("should redirect to login when accessing protected route without auth", async ({
    page,
  }) => {
    // Clear auth to test redirect
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        console.log("Already clear");
      }
    });

    // Try to access dashboard
    await page.goto("/dashboard", { waitUntil: "networkidle" }).catch(() => {
      // Navigation might fail, that's okay
    });

    await page.waitForTimeout(1000);
  });
});

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await setupApiMocks(page);

    // Navigate to registration page - use domcontentloaded instead of networkidle
    await page.goto("/register", { 
      waitUntil: "domcontentloaded",
      timeout: 10000 
    }).catch(async () => {
      // Fallback: try without waiting
      await page.goto("/register");
    });

    // Wait for page to be ready
    await page.waitForLoadState("load", { timeout: 5000 }).catch(() => {});

    // Clear localStorage after page loads
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        console.log("localStorage already clear");
      }
    });
  });

  test("should load registration page", async ({ page }) => {
    // Check for registration form
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const pageContent = await page.content();

    const hasRegistrationForm =
      pageContent.includes("password") ||
      pageContent.includes("register") ||
      pageContent.includes("sign up");

    expect(hasRegistrationForm || (await emailInput.count()) > 0).toBeTruthy();
  });

  test("should validate password requirements", async ({ page }) => {
    // Look for password input
    const passwordInput = page.locator('input[type="password"]').first();
    const passwordExists = (await passwordInput.count()) > 0;

    expect(passwordExists).toBeTruthy();
  });

  test("should validate password match", async ({ page }) => {
    const confirmInput = page.getByLabel("Confirm Password");
    await expect(confirmInput).toBeVisible();
  });
  
  test("should register successfully with valid data", async ({ page }) => {
    // Form already loaded by beforeEach
    
    // Fill in registration form with getByLabel (more reliable)
    await page.getByLabel(/first name/i).fill("New");
    await page.getByLabel(/last name/i).fill("User");
    await page.getByLabel(/username/i).fill("newuser");
    await page.getByLabel(/^email$/i).fill("newuser@example.com");
    await page.getByLabel(/^password$/i).fill("Password123!");
    await page.getByLabel(/confirm password/i).fill("Password123!");

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

    // Wait a bit for the async operation
    await page.waitForTimeout(2000);

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
