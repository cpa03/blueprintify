import { defineConfig, devices } from "@playwright/test";

const TEST_SERVER_URL =
  process.env.PLAYWRIGHT_TEST_URL || "http://localhost:3000";

const PLAYWRIGHT_CONFIG = {
  WEB_SERVER_TIMEOUT_MS: 120000,
  EXPECT_TIMEOUT_MS: 10000,
  SCREENSHOT_MAX_DIFF_PIXELS: 100,
  SNAPSHOT_THRESHOLD: 0.2,
} as const;

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/snapshots",
  outputDir: "./e2e/test-results",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [["html", { outputFolder: "./e2e/report" }], ["list"]],

  use: {
    baseURL: TEST_SERVER_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",

    viewport: { width: 1280, height: 720 },

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
    command: "npm run dev",
    url: TEST_SERVER_URL,
    reuseExistingServer: !process.env.CI,
    timeout: PLAYWRIGHT_CONFIG.WEB_SERVER_TIMEOUT_MS,
  },

  expect: {
    timeout: PLAYWRIGHT_CONFIG.EXPECT_TIMEOUT_MS,
    toHaveScreenshot: {
      maxDiffPixels: PLAYWRIGHT_CONFIG.SCREENSHOT_MAX_DIFF_PIXELS,
      threshold: PLAYWRIGHT_CONFIG.SNAPSHOT_THRESHOLD,
    },
    toMatchSnapshot: {
      threshold: PLAYWRIGHT_CONFIG.SNAPSHOT_THRESHOLD,
    },
  },
});
