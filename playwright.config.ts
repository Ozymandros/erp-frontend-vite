import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing with API mocking
 *
 * This configuration:
 * - Runs tests against the local Vite dev server
 * - Mocks all backend API calls for isolated frontend testing
 * - Tests meaningful user interactions and workflows
 * - Ensures compliance with documented functionality
 */
export default defineConfig({
  testDir: "./src/test/e2e",

  /* Only match files ending in .spec.ts in the e2e directory */
  testMatch: "**/src/test/e2e/**/*.spec.ts",

  /* Increase overall test timeout to reduce flakiness on slower Firefox startups */
  timeout: 90_000,

  /* Default expectation timeout */
  expect: {
    timeout: 10_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI. */
  workers: 1,

  /* Max failures before stopping */
  maxFailures: process.env.CI ? 10 : undefined,

  /* Reporter to use */
  reporter: process.env.CI
    ? [
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "playwright-report/results.json" }],
        ["list"],
      ]
    : [
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "playwright-report/results.json" }],
        ["list"],
      ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Navigation timeout */
    navigationTimeout: 60_000,

    /* Action timeout */
    actionTimeout: 15_000,

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",

    /* Emulate timezone */
    timezoneId: "America/New_York",

    /* Emulate locale */
    locale: "en-US",

    /* Longer timeout for context creation */
    contextOptions: {
      strictSelectors: false,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--disable-dev-shm-usage"],
        },
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "dom.storage.enabled": true,
          },
        },
      },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 300 * 1000,
  },
});
