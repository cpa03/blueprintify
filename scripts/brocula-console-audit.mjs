/**
 * BroCula Console Audit Script
 * Checks browser console for errors/warnings using Playwright
 */

import { chromium } from "@playwright/test";

const URL = process.env.TEST_URL || "http://127.0.0.1:4173";

async function run() {
  const browser = await chromium.launch({
    executablePath: "/home/runner/.cache/ms-playwright/chromium-1223/chrome-linux/chrome",
    headless: true,
  });

  const consoleMessages = [];
  const pageErrors = [];
  const failedRequests = [];

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Track console messages
  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (type === "error" || type === "warning") {
      consoleMessages.push({ type, text, location: msg.location() });
    }
  });

  // Track page errors
  page.on("pageerror", (err) => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });

  // Track failed requests
  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText || "unknown",
      method: req.method(),
    });
  });

  // Navigate and interact
  console.log("🔍 Navigating to:", URL);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });

  // Wait for initial render
  await page.waitForTimeout(2000);

  // Full page scroll
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Try clicking template cards if they exist
  const templateCards = page.locator('[data-testid="template-card"], .template-card, [class*="template"]').first();
  if (await templateCards.isVisible({ timeout: 3000 }).catch(() => false)) {
    await templateCards.click();
    await page.waitForTimeout(1000);
  }

  // Try keyboard shortcut '?' for shortcuts modal
  await page.keyboard.press("?");
  await page.waitForTimeout(1000);
  // Dismiss with Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // Check for accessibility issues
  const violations = await page.evaluate(() => {
    // Check for common a11y issues via DOM
    const issues = [];
    document.querySelectorAll("img:not([alt])").forEach((el) => {
      issues.push({ type: "missing-alt", element: el.outerHTML.slice(0, 100) });
    });
    document.querySelectorAll("button:not([aria-label]):not([title])").forEach((el) => {
      if (el.textContent?.trim() === "") {
        issues.push({ type: "empty-button", element: el.outerHTML.slice(0, 100) });
      }
    });
    return issues;
  });

  // Print results
  console.log("\n========================================");
  console.log("📋 BROCULA CONSOLE AUDIT RESULTS");
  console.log("========================================\n");

  console.log(`=== Console Errors: ${consoleMessages.filter(m => m.type === "error").length} ===`);
  for (const msg of consoleMessages.filter(m => m.type === "error")) {
    console.log(`  ❌ ${msg.text}`);
    if (msg.location) console.log(`     at ${msg.location.url}:${msg.location.lineNumber}:${msg.location.columnNumber}`);
  }

  console.log(`\n=== Console Warnings: ${consoleMessages.filter(m => m.type === "warning").length} ===`);
  for (const msg of consoleMessages.filter(m => m.type === "warning")) {
    console.log(`  ⚠️  ${msg.text}`);
  }

  console.log(`\n=== Page Errors (uncaught): ${pageErrors.length} ===`);
  for (const err of pageErrors) {
    console.log(`  ❌ ${err.message}`);
    console.log(`     ${err.stack?.split("\n").slice(0, 3).join("\n     ") || "no stack"}`);
  }

  console.log(`\n=== Failed Network Requests: ${failedRequests.length} ===`);
  for (const req of failedRequests) {
    console.log(`  ❌ ${req.method} ${req.url} - ${req.failure}`);
  }

  console.log(`\n=== Accessibility Issues: ${violations.length} ===`);
  for (const v of violations) {
    console.log(`  ⚠️  ${v.type}: ${v.element}`);
  }

  await browser.close();

  // Return structured output
  const result = {
    console_errors: consoleMessages.filter(m => m.type === "error"),
    console_warnings: consoleMessages.filter(m => m.type === "warning"),
    page_errors: pageErrors,
    failed_requests: failedRequests,
    a11y_issues: violations,
    passed: consoleMessages.filter(m => m.type === "error").length === 0 &&
            pageErrors.length === 0 &&
            failedRequests.length === 0,
  };

  console.log("\n========================================");
  console.log(`🏁 VERDICT: ${result.passed ? "✅ PASS - Clean console" : "❌ FAIL - Issues found"}`);
  console.log("========================================");

  // Write structured results for parsing
  const fs = await import("fs");
  fs.writeFileSync("/tmp/brocula-console-results.json", JSON.stringify(result, null, 2));

  process.exit(result.passed ? 0 : 1);
}

run().catch((err) => {
  console.error("BroCula audit failed:", err);
  process.exit(1);
});
