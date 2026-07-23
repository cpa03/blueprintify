import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Blueprintify E2E tests.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./apps/web/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: process.env.CI ? "on-first-retry" : "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "npm run dev --workspace=apps/web",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      }
    : undefined,
});
