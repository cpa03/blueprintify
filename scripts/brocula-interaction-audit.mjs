/**
 * BroCula Deep Interaction Audit
 * Full user flow: page load -> template selection -> wizard -> keyboard shortcuts -> export
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

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (["error", "warning", "info", "debug"].includes(type)) {
      consoleMessages.push({ type, text, location: msg.location() });
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push({ message: err.message, stack: err.stack });
  });
  page.on("requestfailed", (req) => {
    failedRequests.push({
      url: req.url(),
      failure: req.failure()?.errorText || "unknown",
      method: req.method(),
    });
  });

  const log = (step) => console.log(`\n[${step}]`);
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  // Step 1: Load homepage
  log("1/8 Loading homepage");
  await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await wait(2000);
  console.log(`  Title: ${await page.title()}`);

  // Step 2: Scroll entire page
  log("2/8 Full page scroll");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(500);

  // Step 3: Try template card click
  log("3/8 Template card interaction");
  const templates = page.locator('[class*="template"]').first();
  if (await templates.isVisible({ timeout: 3000 }).catch(() => false)) {
    await templates.click();
    await wait(1000);
    console.log("  ✅ Clicked template card");
  } else {
    console.log("  ℹ️ No template cards found");
  }

  // Step 4: Try wizard interaction - fill form fields
  log("4/8 Wizard form interaction");

  // Try filling inputs
  const inputs = await page.locator('input, textarea, [contenteditable="true"]').all();
  console.log(`  Found ${inputs.length} input fields`);
  
  // Try to find and fill project name input
  const projectInput = page.locator('input[placeholder*="project" i], input[name*="project" i], input[id*="project" i], input[aria-label*="project" i]').first();
  if (await projectInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await projectInput.fill("BroCula Test Project");
    console.log("  ✅ Filled project name");
  }

  // Step 5: Navigate wizard steps
  log("5/8 Wizard navigation");
  // Try pressing Enter to advance
  await page.keyboard.press("Enter");
  await wait(1000);

  // Try clicking Next/Continue buttons
  const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Generate"), [aria-label*="next" i]').first();
  if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nextBtn.click();
    await wait(1000);
    console.log("  ✅ Clicked Next/Continue button");
  }

  // Step 6: Keyboard shortcuts
  log("6/8 Keyboard shortcuts");
  // '?' for shortcuts modal
  await page.keyboard.press("?");
  await wait(1500);
  // Escape to dismiss
  await page.keyboard.press("Escape");
  await wait(500);

  // Alt+ArrowRight / Alt+ArrowLeft
  await page.keyboard.press("Alt+ArrowRight");
  await wait(800);
  await page.keyboard.press("Alt+ArrowLeft");
  await wait(800);

  // Ctrl+E for editor
  await page.keyboard.press("Control+e");
  await wait(800);

  console.log("  ✅ Keyboard shortcuts tested");

  // Step 7: Full page scroll again after interactions
  log("7/8 Post-interaction scroll");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(500);

  // Step 8: Collect all results
  log("8/8 Collecting results");

  // Wait a moment for any async errors to surface
  await wait(2000);

  console.log("\n========================================");
  console.log("📋 BROCULA INTERACTION AUDIT RESULTS");
  console.log("========================================\n");

  const errors = consoleMessages.filter(m => m.type === "error");
  const warnings = consoleMessages.filter(m => m.type === "warning");
  const infos = consoleMessages.filter(m => m.type === "info");
  const debugs = consoleMessages.filter(m => m.type === "debug");

  console.log(`=== Console Errors: ${errors.length} ===`);
  errors.forEach(m => console.log(`  ❌ ${m.text}`));

  console.log(`\n=== Console Warnings: ${warnings.length} ===`);
  warnings.forEach(m => console.log(`  ⚠️  ${m.text}`));

  if (infos.length > 0) {
    console.log(`\n=== Console Info: ${infos.length} ===`);
    infos.forEach(m => console.log(`  ℹ️  ${m.text}`));
  }

  console.log(`\n=== Page Errors: ${pageErrors.length} ===`);
  pageErrors.forEach(e => console.log(`  ❌ ${e.message}`));

  console.log(`\n=== Failed Network Requests: ${failedRequests.length} ===`);
  failedRequests.forEach(r => console.log(`  ❌ ${r.method} ${r.url} - ${r.failure}`));

  const passed = errors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0;

  console.log(`\n========================================`);
  console.log(`🏁 VERDICT: ${passed ? "✅ PASS - Clean console" : "❌ FAIL - Issues found"}`);
  console.log(`  Total console messages: ${consoleMessages.length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Page errors: ${pageErrors.length}`);
  console.log(`  Failed requests: ${failedRequests.length}`);
  console.log(`========================================`);

  const fs = await import("fs");
  fs.writeFileSync("/tmp/brocula-interaction-results.json", JSON.stringify({
    console_errors: errors,
    console_warnings: warnings,
    page_errors: pageErrors,
    failed_requests: failedRequests,
    passed,
  }, null, 2));

  await browser.close();
  process.exit(passed ? 0 : 1);
}

run().catch(err => {
  console.error("BroCula interaction audit failed:", err);
  process.exit(1);
});
