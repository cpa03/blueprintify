import { defineConfig, devices } from "@playwright/test";
import { DEV_DEFAULTS, PLAYWRIGHT_DEFAULTS, PLAYWRIGHT_CONFIG } from "@blueprint/shared";

const TEST_SERVER_URL = process.env.PLAYWRIGHT_TEST_URL || DEV_DEFAULTS.PLAYWRIGHT_TEST_URL;

/**
 * Playwright configuration for Blueprintify E2E tests.
 *
 * Consolidated from apps/web/playwright.config.ts (the richer, older config)
 * into the repo-root config (referenced by issue #1015 as the E2E setup entry
 * point). Targets the e2e specs in apps/web/e2e.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./apps/web/e2e",
  snapshotDir: "./apps/web/e2e/snapshots",
  outputDir: "./apps/web/e2e/test-results",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? PLAYWRIGHT_CONFIG.CI_RETRIES : 0,
  workers: process.env.CI ? PLAYWRIGHT_CONFIG.CI_WORKERS : undefined,

  reporter: [["html", { outputFolder: "./apps/web/e2e/report" }], ["list"]],

  use: {
    baseURL: TEST_SERVER_URL,
    trace: process.env.CI ? "on-first-retry" : "on",
    screenshot: "only-on-failure",
    video: "on-first-retry",

    viewport: PLAYWRIGHT_CONFIG.VIEWPORT,

    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  webServer: {
    command: "npm run dev --workspace=apps/web",
    url: TEST_SERVER_URL,
    reuseExistingServer: !process.env.CI,
    timeout: PLAYWRIGHT_DEFAULTS.WEB_SERVER_TIMEOUT_MS,
  },

  expect: {
    timeout: PLAYWRIGHT_DEFAULTS.EXPECT_TIMEOUT_MS,
    toHaveScreenshot: {
      maxDiffPixels: PLAYWRIGHT_DEFAULTS.SCREENSHOT_MAX_DIFF_PIXELS,
      threshold: PLAYWRIGHT_DEFAULTS.SNAPSHOT_THRESHOLD,
    },
    toMatchSnapshot: {
      threshold: PLAYWRIGHT_DEFAULTS.SNAPSHOT_THRESHOLD,
    },
  },
});
