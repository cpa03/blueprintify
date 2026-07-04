/**
 * BroCula Lighthouse Optimization Auditor
 * Runs Lighthouse on the app and reports optimization opportunities.
 */
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

async function runLighthouse() {
  console.log(`[BroCula Lighthouse] Auditing ${TARGET_URL}...`);

  const chrome = await chromeLauncher.launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const options = {
    logLevel: "error",
    output: "json",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: chrome.port,
  };

  try {
    const result = await lighthouse(TARGET_URL, options);
    const report = JSON.parse(result.report);

    console.log("\n============================================");
    console.log("  BROcula LIGHTHOUSE AUDIT RESULTS");
    console.log("============================================\n");

    const categories = report.categories;
    for (const [key, cat] of Object.entries(categories)) {
      const score = Math.round(cat.score * 100);
      const icon = score >= 90 ? "PASS" : score >= 50 ? "WARN" : "FAIL";
      console.log(`  ${icon} ${cat.title}: ${score}`);
    }

    console.log("\n--- Optimization Opportunities ---\n");
    const audits = report.audits;

    // Check for opportunities
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 &&
          (audit.group === "load-opportunities" || audit.group === "diagnostics" ||
           audit.details?.type === "opportunity")) {
        console.log(`  * ${audit.title}: ${Math.round(audit.numericValue || 0)}${audit.numericUnit || ''}`);
        if (audit.description) {
          console.log(`     ${audit.description.replace(/<[^>]*>/g, '').substring(0, 150)}`);
        }
      }
    }

    // Diagnostics
    console.log("\n--- Diagnostics ---\n");
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 && audit.group === "diagnostics") {
        console.log(`  * ${audit.title}: ${audit.displayValue || audit.score}`);
      }
    }

    // Best practices issues
    console.log("\n--- Best Practices ---\n");
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 &&
          (audit.group === "best-practices" || audit.group === "best-practices-a11y")) {
        console.log(`  * ${audit.title}: ${audit.displayValue || 'failed'}`);
      }
    }

    // Accessibility issues
    console.log("\n--- Accessibility ---\n");
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 && audit.group?.startsWith("a11y")) {
        console.log(`  * ${audit.title}: ${audit.displayValue || 'failed'}`);
      }
    }

    // SEO issues
    console.log("\n--- SEO ---\n");
    for (const [id, audit] of Object.entries(audits)) {
      if (audit.score !== null && audit.score < 1 && audit.group?.startsWith("seo")) {
        console.log(`  * ${audit.title}: ${audit.displayValue || 'failed'}`);
      }
    }

    console.log("\n============================================\n");

    // Return summary
    const summary = {};
    for (const [key, cat] of Object.entries(categories)) {
      summary[key] = { score: Math.round(cat.score * 100), title: cat.title };
    }
    return summary;
  } finally {
    await chrome.kill();
  }
}

runLighthouse()
  .then((summary) => {
    console.log("[BroCula Lighthouse] Audit complete!");
    if (summary) {
      for (const [key, cat] of Object.entries(summary)) {
        console.log(`  ${cat.title}: ${cat.score}`);
      }
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("[BroCula Lighthouse] Error:", err);
    process.exit(1);
  });
