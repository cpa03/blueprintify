/**
 * BroCula Deep Interaction Checker
 * Triggers lazy components and interactive flows to find hidden console issues.
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

  console.log(`[BroCula Deep] Loading ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check all interactive elements
  const interactions = [
    // Click template cards
    async () => {
      const cards = await page.$$('[data-testid="template-card"]');
      if (cards.length > 0) {
        console.log(`[BroCula] Clicking template card...`);
        await cards[0].click();
        await page.waitForTimeout(2000);
      } else {
        console.log(`[BroCula] No template cards found with data-testid, trying alternative selectors...`);
        // Try other selectors that might be template cards
        const altCards = await page.$$('[class*="template"], [class*="card"], .glass-card');
        console.log(`[BroCula] Found ${altCards.length} alternative card elements`);
      }
    },
    // Keyboard shortcut '?' for shortcuts modal
    async () => {
      console.log(`[BroCula] Opening shortcuts modal...`);
      await page.keyboard.press("?");
      await page.waitForTimeout(1000);
      // Close it
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    },
    // Try toggling editor
    async () => {
      console.log(`[BroCula] Toggling editor...`);
      await page.keyboard.press("Meta+e");
      await page.waitForTimeout(1500);
    },
    // Fill form fields if available
    async () => {
      const inputs = await page.$$("input, textarea, select");
      console.log(`[BroCula] Found ${inputs.length} form fields`);
      if (inputs.length > 0) {
        for (const inp of inputs.slice(0, 3)) {
          const name = await inp.getAttribute("name") || await inp.getAttribute("placeholder") || "unnamed";
          try {
            await inp.fill("test value");
            console.log(`  Filled: ${name}`);
          } catch (e) {
            console.log(`  Skip: ${name} - ${e.message?.substring(0, 60)}`);
          }
        }
      }
    },
    // Click buttons to find interactive elements
    async () => {
      const buttons = await page.$$("button");
      console.log(`[BroCula] Found ${buttons.length} buttons`);
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (text && text.trim().length > 0 && text.trim().length < 30) {
          console.log(`  Button: "${text.trim()}"`);
        }
      }
    },
    // Navigate wizard steps
    async () => {
      const nextBtn = await page.$('button:has-text("Next")');
      if (nextBtn) {
        console.log(`[BroCula] Clicking Next...`);
        await nextBtn.click();
        await page.waitForTimeout(1500);
      }
    },
    // Scroll to bottom
    async () => {
      console.log(`[BroCula] Scrolling to bottom...`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1500);
    },
  ];

  for (const interaction of interactions) {
    try {
      await interaction();
    } catch (e) {
      console.log(`[BroCula] Interaction error (non-fatal): ${e.message?.substring(0, 100)}`);
    }
  }

  await page.waitForTimeout(1000);

  await browser.close();

  console.log(`\n[BroCula Deep] Complete. Found ${consoleEntries.length} console issues.`);
  for (const entry of consoleEntries) {
    console.log(`  [${entry.type.toUpperCase()}] ${entry.text}`);
    if (entry.stack) {
      const lines = entry.stack.split("\n").slice(0, 3).join("\n    ");
      console.log(`    Stack: ${lines}`);
    }
  }

  if (consoleEntries.length > 0) {
    const errors = consoleEntries.filter((e) => e.type === "error" || e.type === "pageerror");
    const warnings = consoleEntries.filter((e) => e.type === "warning");
    console.log(`\n[BroCula] Summary: ${errors.length} errors, ${warnings.length} warnings`);
  } else {
    console.log(`\n[BroCula] Zero issues found! Clean run.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("[BroCula] Fatal:", err);
  process.exit(1);
});
