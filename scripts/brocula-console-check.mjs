/**
 * BroCula Console Error/Warning Checker
 * Uses Playwright to load the app and capture console messages.
 */
import { chromium } from "playwright";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  const consoleEntries = [];

  // Listen to console messages
  context.on("page", (page) => {
    page.on("console", (msg) => {
      const type = msg.type();
      if (type === "error" || type === "warning") {
        consoleEntries.push({
          type,
          text: msg.text(),
          url: page.url(),
        });
      }
    });

    page.on("pageerror", (err) => {
      consoleEntries.push({
        type: "pageerror",
        text: err.message,
        stack: err.stack,
        url: page.url(),
      });
    });
  });

  const page = await context.newPage();

  console.log(`[BroCula] Loading ${TARGET_URL}...`);
  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
    // Give React a moment to fully hydrate
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error(`[BroCula] Failed to load page: ${e.message}`);
    await browser.close();
    process.exit(1);
  }

  // Interact with page to trigger lazy-loaded components
  try {
    // Try clicking a template button to trigger the wizard
    const templateButtons = await page.$$('[data-testid="template-card"]');
    if (templateButtons.length > 0) {
      await templateButtons[0].click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    // Ignore interaction errors
  }

  // Scroll down to trigger lazy components
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  await browser.close();

  console.log("\n[BroCula] Console Check Complete");
  console.log(`[BroCula] Found ${consoleEntries.length} issues:`);
  for (const entry of consoleEntries) {
    console.log(`  [${entry.type.toUpperCase()}] ${entry.text}`);
    if (entry.stack) {
      const lines = entry.stack.split("\n").slice(0, 3).join("\n    ");
      console.log(`    Stack: ${lines}`);
    }
  }

  // Return exit code based on findings
  if (consoleEntries.length > 0) {
    const errors = consoleEntries.filter((e) => e.type === "error" || e.type === "pageerror");
    const warnings = consoleEntries.filter((e) => e.type === "warning");
    console.log(
      `\n[BroCula] Summary: ${errors.length} errors, ${warnings.length} warnings`
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[BroCula] Fatal:", err);
  process.exit(1);
});
