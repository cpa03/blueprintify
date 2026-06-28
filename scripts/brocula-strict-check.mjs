/**
 * BroCula Strict Mode Warning Check
 * Loads page in dev mode and captures React StrictMode warnings.
 */
import { chromium } from "playwright";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const warnings = [];
  context.on("page", (page) => {
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("deprecated") ||
        text.includes("Warning:") ||
        text.includes("strict") ||
        text.includes("StrictMode") ||
        text.includes("UNSAFE_") ||
        text.includes("findDOMNode") ||
        text.includes("legacy") ||
        text.includes("componentWill") ||
        text.includes("not defined") ||
        msg.type() === "error" ||
        msg.type() === "warning"
      ) {
        warnings.push({ type: msg.type(), text, url: page.url() });
      }
    });
  });

  const page = await context.newPage();
  console.log(`[BroCula] Loading ${TARGET_URL} for strict check...`);
  
  await page.goto(TARGET_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Trigger lazy components
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Try clicking template card to load wizard (and framer-motion)
  const cards = await page.$$('[class*="glass-card"]');
  for (const card of cards.slice(0, 2)) {
    try { await card.click(); await page.waitForTimeout(1500); } catch {}
  }

  await browser.close();

  if (warnings.length === 0) {
    console.log("[BroCula] ✅ No React strict mode warnings or deprecations found!");
  } else {
    console.log(`[BroCula] Found ${warnings.length} warnings:`);
    for (const w of warnings) {
      console.log(`  [${w.type}] ${w.text.substring(0, 200)}`);
    }
  }

  process.exit(0);
}

main().catch(console.error);
