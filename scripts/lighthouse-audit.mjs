import { chromium } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import * as chromeLauncher from "chrome-launcher";

async function runLighthouseAudit() {
  console.log("🔦 Running Lighthouse Performance Audit...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ['--remote-debugging-port=9222']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const auditConfig = {
      port: 9222,
      thresholds: {
        performance: 50,
        accessibility: 50,
        'best-practices': 50,
        seo: 50,
      },
      reports: {
        formats: { html: true, json: true },
        name: `lighthouse-report-${Date.now()}`,
        directory: './lighthouse-reports',
      },
    };

    await playAudit({
      page: page,
      ...auditConfig,
    });

    console.log("\n✅ Lighthouse audit complete!");
  } catch (error) {
    console.error("❌ Lighthouse audit failed:", error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runLighthouseAudit();
