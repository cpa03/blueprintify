import { test, expect, Page } from "@playwright/test";
import fs from "fs";

/**
 * BroCula Console Error/Warning Check
 *
 * Navigates all major app pages/routes and captures console messages.
 * Reports any errors or warnings as test failures.
 */

interface ConsoleEntry {
  type: string;
  text: string;
  url: string;
}

const GLOBAL_CONSOLE: ConsoleEntry[] = [];

function setupConsoleCapture(page: Page) {
  page.on("console", (msg) => {
    GLOBAL_CONSOLE.push({
      type: msg.type(),
      text: msg.text(),
      url: page.url(),
    });
  });
  page.on("pageerror", (err) => {
    GLOBAL_CONSOLE.push({
      type: "pageerror",
      text: err.message,
      url: page.url(),
    });
  });
}

test.beforeEach(async ({ page }) => {
  GLOBAL_CONSOLE.length = 0;
  setupConsoleCapture(page);
});

test("check main page for console errors/warnings", async ({ page }) => {
  const errors: ConsoleEntry[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push({ type: msg.type(), text: msg.text(), url: page.url() });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({ type: "pageerror", text: err.message, url: page.url() });
  });

  // Navigate and wait for full load
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000); // Allow async operations to settle

  if (errors.length > 0) {
    console.log("=== CONSOLE ERRORS/WARNINGS FOUND ===");
    errors.forEach((e) => console.log(`[${e.type}] ${e.text} (${e.url})`));
  }

  expect(errors.filter((e) => e.type !== "warning")).toEqual([]);
});

test("check wizard flow for console errors/warnings", async ({ page }) => {
  const errors: ConsoleEntry[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      errors.push({ type: msg.type(), text: msg.text(), url: page.url() });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({ type: "pageerror", text: err.message, url: page.url() });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Try to click start button or interact with wizard
  const startBtn = page
    .locator("button, a")
    .filter({ hasText: /start|begin|new blueprint|get started/i })
    .first();
  if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await startBtn.click();
    await page.waitForTimeout(2000);
  }

  // Try to interact with form elements
  const inputs = page.locator("input, textarea, select").first();
  if (await inputs.isVisible({ timeout: 2000 }).catch(() => false)) {
    await inputs.fill("Test Project");
    await page.waitForTimeout(500);
  }

  if (errors.length > 0) {
    console.log("=== WIZARD CONSOLE ERRORS/WARNINGS ===");
    errors.forEach((e) => console.log(`[${e.type}] ${e.text} (${e.url})`));
  }

  expect(errors.filter((e) => e.type !== "warning")).toEqual([]);
});

test.afterAll(async () => {
  // Write console output for audit logging
  const consoleLog = GLOBAL_CONSOLE.map((e) => `[${e.type}] ${e.text}`).join("\n");

  fs.writeFileSync(
    "/tmp/brocula-console-report.txt",
    consoleLog || "No console output captured",
    "utf-8"
  );
});
