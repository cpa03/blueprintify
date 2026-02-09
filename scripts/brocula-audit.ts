#!/usr/bin/env node
import { chromium } from "playwright";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "fs";
import path from "path";

const APP_URL = "http://localhost:3001";
const REPORT_DIR = "./audit-reports";

interface ConsoleMessage {
  type: string;
  text: string;
  location?: Record<string, unknown>;
  url?: string;
  stack?: string;
}

interface AuditResult {
  timestamp: string;
  url: string;
  errors: ConsoleMessage[];
  warnings: ConsoleMessage[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
  };
}

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

async function captureConsoleErrors(): Promise<{
  errors: ConsoleMessage[];
  warnings: ConsoleMessage[];
}> {
  console.log("🔍 BroCula is hunting console errors...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors: ConsoleMessage[] = [];
  const warnings: ConsoleMessage[] = [];

  page.on("console", (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    if (type === "error") {
      errors.push({ type, text, location });
      console.log(`❌ ERROR: ${text}`);
    } else if (type === "warning") {
      warnings.push({ type, text, location });
      console.log(`⚠️ WARNING: ${text}`);
    }
  });

  page.on("pageerror", (error) => {
    errors.push({ type: "pageerror", text: error.message, stack: error.stack });
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    errors.push({
      type: "requestfailed",
      text: `Failed to load ${request.url()}: ${failure?.errorText || "Unknown error"}`,
      url: request.url(),
    });
    console.log(`❌ REQUEST FAILED: ${request.url()} - ${failure?.errorText}`);
  });

  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  console.log("🖱️ Interacting with the app to find hidden errors...");

  const buttons = await page.locator("button").all();
  for (const button of buttons.slice(0, 5)) {
    try {
      await button.click({ timeout: 1000 });
      await page.waitForTimeout(500);
    } catch {
      void 0;
    }
  }

  await browser.close();

  const report: AuditResult = {
    timestamp: new Date().toISOString(),
    url: APP_URL,
    errors,
    warnings,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
    },
  };

  fs.writeFileSync(
    path.join(REPORT_DIR, "console-audit.json"),
    JSON.stringify(report, null, 2),
  );

  console.log(`\n📊 Console Audit Complete:`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Warnings: ${warnings.length}`);

  return { errors, warnings };
}

async function runLighthouseAudit() {
  console.log("\n🚀 BroCula is running Lighthouse audit...");

  const chromePath =
    process.env.CHROME_PATH ||
    "/home/runner/.cache/ms-playwright/chromium-1208/chrome-linux/chrome";
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox", "--disable-setuid-sandbox"],
    chromePath,
  });

  const options = {
    logLevel: "info" as const,
    output: "html" as const,
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(APP_URL, options);

  if (!runnerResult) {
    throw new Error("Lighthouse audit failed");
  }

  const reportHtml = runnerResult.report;
  if (typeof reportHtml === "string") {
    fs.writeFileSync(
      path.join(REPORT_DIR, "lighthouse-report.html"),
      reportHtml,
    );
  }

  const summary = {
    timestamp: new Date().toISOString(),
    url: APP_URL,
    scores: {
      performance: (runnerResult.lhr.categories.performance?.score || 0) * 100,
      accessibility:
        (runnerResult.lhr.categories.accessibility?.score || 0) * 100,
      bestPractices:
        (runnerResult.lhr.categories["best-practices"]?.score || 0) * 100,
      seo: (runnerResult.lhr.categories.seo?.score || 0) * 100,
    },
    audits: Object.entries(runnerResult.lhr.audits)
      .filter(
        ([_, audit]) =>
          audit.score !== null && audit.score !== undefined && audit.score < 1,
      )
      .map(([id, audit]) => ({
        id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        scoreDisplayMode: audit.scoreDisplayMode,
        details: audit.details,
      })),
  };

  fs.writeFileSync(
    path.join(REPORT_DIR, "lighthouse-summary.json"),
    JSON.stringify(summary, null, 2),
  );

  await chrome.kill();

  console.log("\n📊 Lighthouse Scores:");
  console.log(`   Performance: ${summary.scores.performance}`);
  console.log(`   Accessibility: ${summary.scores.accessibility}`);
  console.log(`   Best Practices: ${summary.scores.bestPractices}`);
  console.log(`   SEO: ${summary.scores.seo}`);

  return summary;
}

async function main() {
  console.log("🧛 BroCula Activated! Hunting browser issues...\n");

  try {
    const response = await fetch(APP_URL).catch(() => null);
    if (!response) {
      console.error(`❌ App is not running at ${APP_URL}`);
      console.log("   Please start the dev server first: npm run dev");
      process.exit(1);
    }

    const consoleResults = await captureConsoleErrors();
    const lighthouseResults = await runLighthouseAudit();

    console.log("\n✅ BroCula Audit Complete!");
    console.log(`📁 Reports saved to: ${REPORT_DIR}/`);

    if (consoleResults.errors.length > 0) {
      console.log("\n⚠️  Console errors found! Fix them immediately.");
      process.exit(1);
    }

    if (lighthouseResults.scores.performance < 90) {
      console.log("\n⚠️  Performance score below 90! Optimization needed.");
    }
  } catch (error) {
    console.error("❌ BroCula encountered an error:", error);
    process.exit(1);
  }
}

main();
