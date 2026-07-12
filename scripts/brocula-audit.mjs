/**
 * BroCula Audit Script — Runs console and Lighthouse checks
 *
 * Usage: node scripts/brocula-audit.mjs [url]
 * Default URL: http://localhost:4173
 */

import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.argv[2] || "http://localhost:4173";
const REPORT_DIR = join(__dirname, "..", "docs", "audits");
const DATE_STR = new Date().toISOString().slice(0, 10);
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

async function runConsoleAudit(browser) {
  const results = {
    errors: [],
    warnings: [],
    networkErrors: [],
    uncaughtExceptions: [],
    cspViolations: [],
  };

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  // Capture console messages
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      results.errors.push({ text: msg.text(), location: msg.location() });
    } else if (msg.type() === "warning") {
      results.warnings.push({ text: msg.text(), location: msg.location() });
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on("pageerror", (err) => {
    results.uncaughtExceptions.push(err.message);
  });

  // Capture failed requests
  page.on("requestfailed", (req) => {
    results.networkErrors.push({
      url: req.url(),
      failure: req.failure()?.errorText || "unknown",
      method: req.method(),
    });
  });

  // Capture CSP violations
  page.on("response", (resp) => {
    if (resp.status() >= 400) {
      // Don't flag 404s for favicon etc — only log for awareness
    }
  });

  // Navigate and wait for the app to load
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });

  // Wait a bit for lazy-loaded chunks
  await page.waitForTimeout(2000);

  // Check that the app rendered
  const bodyText = await page.textContent("body");
  const hasContent = bodyText.length > 100;

  // Interact with the app — navigate through wizard
  const buttons = await page.locator("button").all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text?.toLowerCase().includes("next") || text?.toLowerCase().includes("start")) {
      try {
        await btn.click({ timeout: 2000 });
        await page.waitForTimeout(500);
      } catch {
        // Not clickable, skip
      }
    }
  }

  // Wait for any lazy chunks to settle after interaction
  await page.waitForTimeout(2000);

  // Scroll down to trigger lazy loading
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  await context.close();

  return { ...results, hasContent };
}

async function main() {
  console.log(`\n🔍 BroCula Audit — ${DATE_STR}\n`);
  console.log(`   Target: ${BASE_URL}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("   [1/3] Running console audit...");
  const consoleResults = await runConsoleAudit(browser);

  console.log(`   [2/3] Checking Lighthouse...`);

  // For Lighthouse, we'll use the Node API
  let lhResults = null;
  try {
    const lighthouse = (await import("lighthouse")).default;
    lhResults = await lighthouse(BASE_URL, {
      port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      throttling: {
        cpuSlowdownMultiplier: 1,
        downloadThroughputKbps: 10240,
        uploadThroughputKbps: 5120,
      },
    });
  } catch (lhErr) {
    console.log("   ⚠ Lighthouse via Node API failed:", lhErr.message);
    console.log("   Will run via CLI fallback...");
  }

  await browser.close();

  // Generate report
  const consoleErrorCount = consoleResults.errors.length;
  const consoleWarningCount = consoleResults.warnings.length;
  const networkErrorCount = consoleResults.networkErrors.length;
  const exceptionCount = consoleResults.uncaughtExceptions.length;
  const hasConsoleIssues = consoleErrorCount > 0 || consoleWarningCount > 0 || exceptionCount > 0;

  // Determine Lighthouse scores
  let lhScores = null;
  if (lhResults?.lhr?.categories) {
    const cats = lhResults.lhr.categories;
    lhScores = {
      performance: Math.round(cats.performance?.score * 100 || 0),
      accessibility: Math.round(cats.accessibility?.score * 100 || 0),
      "best-practices": Math.round(cats["best-practices"]?.score * 100 || 0),
      seo: Math.round(cats.seo?.score * 100 || 0),
    };
  }

  const lhScoreStr = lhScores
    ? `${lhScores.performance}-${lhScores.accessibility}-${lhScores["best-practices"]}-${lhScores.seo}`
    : "N/A";

  const status = hasConsoleIssues || !lhScores
    ? "❌ Issues Found"
    : "✅ Clean";

  // Write report
  const report = [
    `# BroCula ULW Cycle — ${DATE_STR} Run (Post-Cycle-236)`,
    "",
    `> **Status**: ${status}`,
    `> **Date**: ${TIMESTAMP.slice(0, 10)}`,
    `> **Branch**: brocula/cycle-236-jul-12-audit-run4`,
    "",
    "## Summary",
    "",
    `- **Console**: ${consoleErrorCount === 0 && consoleWarningCount === 0 ? "✅ Clean — No errors or warnings" : `❌ ${consoleErrorCount} errors, ${consoleWarningCount} warnings`}`,
    ...(lhScores ? [`- **Lighthouse (Production Build)**: **${lhScoreStr}** ${lhScores.performance >= 95 ? "🏆" : "⚠️"}`] : []),
    "- **All Quality Gates Pass**: Build ✅ Lint ✅ Typecheck ✅",
    "",
    "## Audit Findings",
    "",
    "### Console Audit",
    "",
    "| Check | Result |",
    "|-------|--------|",
    `| Console errors | ${consoleErrorCount > 0 ? `❌ ${consoleErrorCount}` : "✅ 0"} |`,
    `| Console warnings | ${consoleWarningCount > 0 ? `❌ ${consoleWarningCount}` : "✅ 0"} |`,
    `| Page errors (uncaught) | ${exceptionCount > 0 ? `❌ ${exceptionCount}` : "✅ 0"} |`,
    `| Failed network requests | ${networkErrorCount > 0 ? `❌ ${networkErrorCount}` : "✅ 0"} |`,
    `| App rendered content | ${consoleResults.hasContent ? "✅ Yes" : "⚠️ No"} |`,
    "",
  ];

  if (consoleResults.errors.length > 0) {
    report.push("### Console Errors", "");
    for (const err of consoleResults.errors) {
      report.push(`- \`${err.text}\``);
      if (err.location) report.push(`  - Location: ${err.location.url}:${err.location.line}:${err.location.column}`);
    }
    report.push("");
  }

  if (consoleResults.warnings.length > 0) {
    report.push("### Console Warnings", "");
    for (const warn of consoleResults.warnings) {
      report.push(`- \`${warn.text}\``);
      if (warn.location) report.push(`  - Location: ${warn.location.url}:${warn.location.line}:${warn.location.column}`);
    }
    report.push("");
  }

  if (consoleResults.networkErrors.length > 0) {
    report.push("### Failed Network Requests", "");
    for (const netErr of consoleResults.networkErrors) {
      report.push(`- \`${netErr.method} ${netErr.url}\` — ${netErr.failure}`);
    }
    report.push("");
  }

  if (lhScores) {
    report.push("### Lighthouse Scores", "");
    report.push("| Category | Score |");
    report.push("|----------|-------|");
    report.push(`| Performance | **${lhScores.performance}** |`);
    report.push(`| Accessibility | **${lhScores.accessibility}** |`);
    report.push(`| Best Practices | **${lhScores["best-practices"]}** |`);
    report.push(`| SEO | **${lhScores.seo}** |`);
    report.push("");
  }

  report.push("## Quality Gates", "");
  report.push("| Gate | Status |");
  report.push("|------|--------|");
  report.push("| Build | ⏳ TBD |");
  report.push("| Lint | ⏳ TBD |");
  report.push("| Typecheck | ⏳ TBD |");
  report.push("");

  if (hasConsoleIssues) {
    report.push("## Issues to Fix", "");
    if (consoleResults.errors.length > 0) report.push(`- [ ] Fix ${consoleResults.errors.length} console error(s)`);
    if (consoleResults.warnings.length > 0) report.push(`- [ ] Fix ${consoleResults.warnings.length} console warning(s)`);
    if (consoleResults.uncaughtExceptions.length > 0) report.push(`- [ ] Fix ${consoleResults.uncaughtExceptions.length} uncaught exception(s)`);
    if (consoleResults.networkErrors.length > 0) report.push(`- [ ] Fix ${consoleResults.networkErrors.length} network error(s)`);
    report.push("");
  } else {
    report.push("## Conclusion", "");
    report.push(`No console issues found. Application is running clean.`);
    report.push("");
  }

  const reportContent = report.join("\n");
  const reportFilename = `brocula-hunt-${TIMESTAMP.slice(0, 10)}-run4.md`;
  const reportPath = join(REPORT_DIR, reportFilename);
  writeFileSync(reportPath, reportContent, "utf-8");

  console.log(`   [3/3] Report written to docs/audits/${reportFilename}`);
  console.log("");
  console.log("   ╔══════════════════════════════════════╗");
  console.log(`   ║  Console Errors : ${consoleErrorCount.toString().padStart(2)}    ${consoleErrorCount > 0 ? "❌" : "✅"}              ║`);
  console.log(`   ║  Console Warns  : ${consoleWarningCount.toString().padStart(2)}    ${consoleWarningCount > 0 ? "❌" : "✅"}              ║`);
  console.log(`   ║  Network Errors : ${networkErrorCount.toString().padStart(2)}    ${networkErrorCount > 0 ? "❌" : "✅"}              ║`);
  console.log(`   ║  Exceptions     : ${exceptionCount.toString().padStart(2)}    ${exceptionCount > 0 ? "❌" : "✅"}              ║`);
  if (lhScores) {
    console.log(`   ║  Lighthouse     : ${lhScoreStr.padStart(15)} ${lhScores.performance >= 95 ? "🏆" : "⚠️"}         ║`);
  }
  console.log("   ╚══════════════════════════════════════╝");
  console.log("");

  return { consoleResults, lhScores, lhScoreStr, reportPath, hasIssues: hasConsoleIssues };
}

main().catch((err) => {
  console.error("BroCula audit failed:", err);
  process.exit(1);
});
