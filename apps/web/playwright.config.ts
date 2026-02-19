import { defineConfig, devices } from "@playwright/test";

const TEST_SERVER_URL =
  process.env.PLAYWRIGHT_TEST_URL || "http://localhost:3000";

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
    timeout: 120000,
  },

  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
    toMatchSnapshot: {
      threshold: 0.2,
    },
  },
});
