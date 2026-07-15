/**
 * BroCula Console Audit — checks for browser console errors/warnings
 * across all wizard steps of the Blueprintify app.
 */
import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import { DEV_DEFAULTS } from "@blueprint/shared";

const BASE_URL = process.env.PLAYWRIGHT_TEST_URL || `http://localhost:${DEV_DEFAULTS.WEB_PORT}`;

interface ConsoleEntry {
  type: string;
  text: string;
  url: string;
}

function getErrors(entries: readonly ConsoleEntry[]): ConsoleEntry[] {
  return entries.filter((e) => e.type === "error" || e.type === "pageerror");
}

function getWarnings(entries: readonly ConsoleEntry[]): ConsoleEntry[] {
  return entries.filter((e) => e.type === "warning");
}

function captureConsole(page: Page): ConsoleEntry[] {
  const entries: ConsoleEntry[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    entries.push({ type: msg.type(), text: msg.text(), url: msg.location().url });
  });
  page.on("pageerror", (err) => {
    entries.push({ type: "pageerror", text: err.message, url: page.url() });
  });
  return entries;
}

test.describe("BroCula Console Audit", () => {
  test.describe.configure({ mode: "serial" });

  test("Step 1 - Wizard Home / Project Info", async ({ page }) => {
    const entries = captureConsole(page);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const errors = getErrors(entries);
    const warnings = getWarnings(entries);
    expect(errors, `Step 1 errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Step 1 warnings: ${JSON.stringify(warnings)}`).toEqual([]);
  });

  test("Step 2 - Tech Stack", async ({ page }) => {
    const entries = captureConsole(page);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    const nextBtn = page
      .locator("button:has-text('Next'), button:has-text('Continue'), a:has-text('Next')")
      .first();
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    const errors = getErrors(entries);
    const warnings = getWarnings(entries);
    expect(errors, `Step 2 errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Step 2 warnings: ${JSON.stringify(warnings)}`).toEqual([]);
  });

  test("Step 3 - Features", async ({ page }) => {
    const entries = captureConsole(page);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    for (let i = 0; i < 2; i++) {
      const nextBtn = page.locator("button:has-text('Next'), button:has-text('Continue')").first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    await page.waitForTimeout(1500);

    const errors = getErrors(entries);
    const warnings = getWarnings(entries);
    expect(errors, `Step 3 errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Step 3 warnings: ${JSON.stringify(warnings)}`).toEqual([]);
  });

  test("Step 4 - Review", async ({ page }) => {
    const entries = captureConsole(page);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    for (let i = 0; i < 3; i++) {
      const nextBtn = page.locator("button:has-text('Next'), button:has-text('Continue')").first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    await page.waitForTimeout(1500);

    const errors = getErrors(entries);
    const warnings = getWarnings(entries);
    expect(errors, `Step 4 errors: ${JSON.stringify(errors)}`).toEqual([]);
    expect(warnings, `Step 4 warnings: ${JSON.stringify(warnings)}`).toEqual([]);
  });
});
