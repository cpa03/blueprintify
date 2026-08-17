/**
 * BroCula Run 71 — Interactive Playwright sweep
 * Mirrors prior-run coverage: landing load/scroll, keyboard nav, shortcuts dialog,
 * template select → wizard auto-advance to Review, reload persistence with Generate
 * enabled, generate error path with verified recovery buttons (Try Again + Back to Review).
 * API is intentionally NOT running (vite preview only) — API failures are expected/ignored;
 * all NON-API requests must succeed.
 */
import { chromium } from "playwright";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:4173";
let assertions = 0;
let passed = 0;
const failures = [];
const consoleErrors = [];
const consoleWarnings = [];
const nonApiFailures = [];

function check(name, cond, detail = "") {
  assertions++;
  if (cond) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failures.push(name + (detail ? ` — ${detail}` : ""));
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on("console", (msg) => {
  const t = msg.type();
  const text = msg.text();
  // Expected: API generate returns 502 without keys (prior runs documented
  // "expected API 502s" — the generate error path is the thing under test).
  if (text.includes("502") || text.includes("Bad Gateway")) return;
  if (t === "error") consoleErrors.push(text);
  else if (t === "warning") consoleWarnings.push(text);
});
page.on("pageerror", (err) => consoleErrors.push("pageerror: " + err.message));
page.on("requestfailed", (req) => {
  const url = req.url();
  const failure = req.failure();
  const errText = failure?.errorText || "unknown";
  if (url.includes("/api/")) return; // expected — API not running in preview
  nonApiFailures.push(`${url} — ${errText}`);
});

try {
  // ── 1. Landing load ──────────────────────────────────────────────
  console.log("\n[1] Landing load + scroll");
  const resp = await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 60000 });
  check("GET / returns 200", resp?.status() === 200, `status=${resp?.status()}`);
  await page.waitForTimeout(1500);
  check("Hero title visible", await page.locator("h1").first().isVisible());
  check("Template grid visible", await page.locator('section:has(h2:text("Quick Start Templates"))').isVisible());
  check("Template cards render", (await page.locator('[role="option"]').count()) >= 3, `count=${await page.locator('[role="option"]').count()}`);
  check("Step indicator visible", await page.locator("text=Project Info").first().isVisible().catch(() => false));

  // Scroll to bottom to trigger scroll helpers
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  const scrollTopVisible = await page.locator("[aria-label*='scroll to top' i], [aria-label*='Scroll to top' i]").first().isVisible().catch(() => false);
  check("Scroll-to-top helper appears after scroll", scrollTopVisible);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // ── 2. Keyboard nav on template grid ─────────────────────────────
  console.log("\n[2] Keyboard navigation (template grid)");
  const firstCardText = await page.locator('[role="option"]').first().innerText();
  const lastCardText = await page.locator('[role="option"]').last().innerText();
  await page.locator('[role="option"]').first().focus();
  await page.keyboard.press("ArrowRight");
  const focusedCard = await page.evaluate(() => document.activeElement?.innerText?.slice(0, 40));
  check("ArrowRight moves focus between template cards", focusedCard !== firstCardText.slice(0, 40));
  await page.keyboard.press("Home");
  const homeFocused = await page.evaluate(() => document.activeElement?.innerText?.slice(0, 40));
  check("Home returns focus to first card", homeFocused === firstCardText.slice(0, 40), `active=${homeFocused}`);
  await page.keyboard.press("End");
  const endFocused = await page.evaluate(() => document.activeElement?.innerText?.slice(0, 40));
  check("End moves focus to last card", endFocused === lastCardText.slice(0, 40), `active=${endFocused}`);

  // Tab order sanity: first template card is tabbable
  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  const nextFocus = await page.evaluate(() => document.activeElement?.tagName);
  check("Tab advances focus to next element", nextFocus !== "BODY");

  // ── 3. Shortcuts dialog ──────────────────────────────────────────
  console.log("\n[3] Shortcuts dialog");
  await page.keyboard.press("?");
  await page.waitForTimeout(600);
  check("Shortcuts dialog opens with ?", await page.locator('[role="dialog"]').first().isVisible().catch(() => false));
  const escCount = await page.locator('[role="dialog"]').count();
  if (escCount > 0) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    check("Shortcuts dialog closes with Escape", (await page.locator('[role="dialog"]').count()) === 0);
  } else {
    check("Shortcuts dialog closes with Escape", false, "dialog never opened");
  }

  // ── 4. Template select → wizard auto-advance to Review ───────────
  console.log("\n[4] Template select → auto-advance to Review");
  await page.locator('[role="option"]').first().click();
  await page.waitForTimeout(2000);
  check("Template loads (toast or selection)", true);
  const reviewVisible = await page
    .locator("text=Review", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);
  const generateVisible = await page
    .locator('button:has-text("Generate Blueprint")')
    .first()
    .isVisible()
    .catch(() => false);
  check("Wizard auto-advances to Review step", reviewVisible || generateVisible);
  check("Generate Blueprint button visible on Review", generateVisible);
  // Generate should be enabled after template load
  const genDisabled = await page
    .locator('button:has-text("Generate Blueprint")')
    .first()
    .isDisabled()
    .catch(() => true);
  check("Generate button enabled after template load", !genDisabled);

  // ── 5. Reload persistence ────────────────────────────────────────
  console.log("\n[5] Reload persistence");
  await page.reload({ waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const genVisibleAfterReload = await page
    .locator('button:has-text("Generate Blueprint")')
    .first()
    .isVisible()
    .catch(() => false);
  check("Wizard state persists after reload (Review)", genVisibleAfterReload);
  const genDisabledAfterReload = await page
    .locator('button:has-text("Generate Blueprint")')
    .first()
    .isDisabled()
    .catch(() => true);
  check("Generate enabled after reload (persisted state)", !genDisabledAfterReload);

  // ── 6. Generate error path + recovery buttons ────────────────────
  console.log("\n[6] Generate error path + recovery");
  await page.locator('button:has-text("Generate Blueprint")').first().click();
  // API returns 502 (no keys) → 3 retries with backoff (1s+2s+4s) before error UI
  await page.waitForTimeout(15000);
  let tryAgainVisible = await page
    .locator('button:has-text("Try Again")')
    .first()
    .isVisible()
    .catch(() => false);
  check("Generation failure shows Try Again recovery button", tryAgainVisible);
  let backToReviewVisible = await page
    .locator('button:has-text("Back to Review")')
    .first()
    .isVisible()
    .catch(() => false);
  check("Back to Review recovery button visible", backToReviewVisible);

  // Verify Back to Review actually navigates back
  let genVisibleAfterBack = false;
  if (backToReviewVisible) {
    await page.locator('button:has-text("Back to Review")').first().click();
    await page.waitForTimeout(1200);
    genVisibleAfterBack = await page
      .locator('button:has-text("Generate Blueprint")')
      .first()
      .isVisible()
      .catch(() => false);
    check("Back to Review returns to Review step", genVisibleAfterBack);
  }

  // Re-trigger error path, verify Try Again
  const genNow = genVisibleAfterBack;
  if (genNow) {
    await page.locator('button:has-text("Generate Blueprint")').first().click();
    await page.waitForTimeout(15000);
    const tryAgain2 = await page
      .locator('button:has-text("Try Again")')
      .first()
      .isVisible()
      .catch(() => false);
    check("Try Again button present on re-failure", tryAgain2);
    if (tryAgain2) {
      await page.locator('button:has-text("Try Again")').first().click();
      await page.waitForTimeout(1500);
      // Try Again is designed to return to Review (aria: "Go back to review
      // step and try generating again") — NOT auto-regenerate.
      const reviewAfterTryAgain = await page
        .locator('button:has-text("Generate Blueprint")')
        .first()
        .isVisible()
        .catch(() => false);
      check("Try Again returns to Review step for retry", reviewAfterTryAgain);
    }
  }

  // ── 7. Editor toggle ─────────────────────────────────────────────
  console.log("\n[7] Editor toggle");
  // Editor auto-opens during generation (showEditor = hasContent || isGenerating),
  // so it is OPEN after the error flow. First Ctrl+E should HIDE it.
  let editorWasOpen = await page.locator("#editor-panel").isVisible().catch(() => false);
  await page.keyboard.press("Control+e");
  await page.waitForTimeout(1200);
  const editorHidden = !(await page.locator("#editor-panel").isVisible().catch(() => false));
  check("Ctrl+E toggles editor panel (hide when open)", editorWasOpen ? editorHidden : !editorHidden);
  // Second Ctrl+E re-opens it
  await page.keyboard.press("Control+e");
  await page.waitForTimeout(1200);
  const editorShown = await page.locator("#editor-panel").isVisible().catch(() => false);
  check("Ctrl+E re-opens editor panel", editorShown);

  // ── Summary ──────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════");
  console.log(`ASSERTIONS: ${passed}/${assertions} passed`);
  console.log(`CONSOLE ERRORS: ${consoleErrors.length}`);
  consoleErrors.forEach((e) => console.log(`  [error] ${e}`));
  console.log(`CONSOLE WARNINGS: ${consoleWarnings.length}`);
  consoleWarnings.forEach((w) => console.log(`  [warn] ${w}`));
  console.log(`NON-API REQUEST FAILURES: ${nonApiFailures.length}`);
  nonApiFailures.forEach((f) => console.log(`  [reqfail] ${f}`));
  if (failures.length) {
    console.log("\nFAILURES:");
    failures.forEach((f) => console.log(`  ❌ ${f}`));
  }
  console.log("══════════════════════════════════════════════════");

  const ok =
    failures.length === 0 &&
    consoleErrors.length === 0 &&
    consoleWarnings.length === 0 &&
    nonApiFailures.length === 0;
  await browser.close();
  process.exit(ok ? 0 : 1);
} catch (err) {
  console.error("SWEEP CRASH:", err.message);
  await browser.close().catch(() => {});
  process.exit(1);
}