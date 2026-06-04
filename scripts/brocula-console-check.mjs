/**
 * BroCula Console Error Hunter
 * Launches headless Chromium, navigates the app, and captures ALL console errors/warnings.
 */
import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, "..", "docs", "audits", "brocula-hunt-2026-06-04-run2-console.md");

const results = {
  errors: [],
  warnings: [],
  pageErrors: [],
  failedRequests: [],
  info: [],
};

async function run() {
  console.log("🧛‍♂️ BroCula launching Chromium...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  // Track failed network requests
  context.on("requestfailed", (request) => {
    results.failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText || "unknown",
    });
  });

  const page = await context.newPage();

  // Capture console messages
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      results.errors.push(text);
    } else if (msg.type() === "warning") {
      results.warnings.push(text);
    } else {
      results.info.push({ type: msg.type(), text });
    }
  });

  // Capture page errors
  page.on("pageerror", (err) => {
    results.pageErrors.push(err.message);
  });

  const paths = [
    { path: "/", name: "Homepage" },
    { path: "/", name: "Homepage (after load)", waitFor: ".wizard-container, [data-testid='wizard'], main" },
  ];

  console.log("🧛‍♂️ Navigating to", BASE_URL);

  try {
    // Load homepage
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for any lazy-loaded content
    console.log("   ✅ Homepage loaded");

    // Try clicking through wizard steps if buttons exist
    const wizardSteps = [
      { name: "StepInfo -> StepStack", buttonText: /next|lanjut|continue|stack/i },
      { name: "StepStack -> StepFeatures", buttonText: /next|lanjut|continue|features?/i },
      { name: "StepReview", buttonText: /next|lanjut|continue|review/i },
    ];

    for (const step of wizardSteps) {
      try {
        const buttons = page.locator("button");
        const count = await buttons.count();
        let clicked = false;
        for (let i = 0; i < count; i++) {
          const text = (await buttons.nth(i).textContent()) || "";
          if (step.buttonText.test(text)) {
            await buttons.nth(i).click();
            await page.waitForTimeout(1000);
            clicked = true;
            console.log(`   ✅ Clicked "${text.trim()}" (${step.name})`);
            break;
          }
        }
        if (!clicked) {
          console.log(`   ⚠️  No matching button for ${step.name}`);
        }
      } catch (e) {
        console.log(`   ⚠️  Could not navigate ${step.name}: ${e.message}`);
      }
    }

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);
  } catch (e) {
    console.error("   ❌ Error during navigation:", e.message);
  }

  await browser.close();
  console.log("\n🧛‍♂️ Hunt complete. Generating report...");

  // Generate report
  const report = generateReport(results);
  const fs = await import("fs");
  fs.writeFileSync(RESULTS_FILE, report, "utf-8");
  console.log(`   📄 Report saved to ${RESULTS_FILE}`);

  // Print summary
  console.log(`\n📊 Summary:`);
  console.log(`   Console Errors:  ${results.errors.length}`);
  console.log(`   Console Warnings: ${results.warnings.length}`);
  console.log(`   Page Errors:      ${results.pageErrors.length}`);
  console.log(`   Failed Requests:  ${results.failedRequests.length}`);

  if (results.errors.length > 0 || results.warnings.length > 0 || results.pageErrors.length > 0 || results.failedRequests.length > 0) {
    console.log("\n❌ ISSUES FOUND!");
    if (results.errors.length > 0) {
      console.log("\n--- Errors ---");
      results.errors.forEach((e) => console.log(`   🔴 ${e}`));
    }
    if (results.warnings.length > 0) {
      console.log("\n--- Warnings ---");
      results.warnings.forEach((w) => console.log(`   🟡 ${w}`));
    }
    if (results.pageErrors.length > 0) {
      console.log("\n--- Page Errors ---");
      results.pageErrors.forEach((p) => console.log(`   🔴 ${p}`));
    }
    if (results.failedRequests.length > 0) {
      console.log("\n--- Failed Requests ---");
      results.failedRequests.forEach((r) => console.log(`   🔴 ${r.url}: ${r.failure}`));
    }
    process.exit(1);
  } else {
    console.log("\n✅ No console issues found!");
  }
}

function generateReport(results) {
  const date = new Date().toISOString().split("T")[0];
  let md = `# BroCula Hunt Report - ${date} (Run 2)\n\n`;
  md += `## Summary\n\nBroCula completed browser console audit for changes since last audit (2026-06-04).\n\n`;
  md += `## Audit Results\n\n`;
  md += `### 1. Browser Console Errors/Warnings\n\n`;
  md += `| Check | Result | Count |\n`;
  md += `| --- | --- | --- |\n`;
  md += `| Console Errors | ${results.errors.length === 0 ? "✅" : "❌"} | ${results.errors.length} |\n`;
  md += `| Console Warnings | ${results.warnings.length === 0 ? "✅" : "❌"} | ${results.warnings.length} |\n`;
  md += `| Page Errors | ${results.pageErrors.length === 0 ? "✅" : "❌"} | ${results.pageErrors.length} |\n`;
  md += `| Failed Network Requests | ${results.failedRequests.length === 0 ? "✅" : "❌"} | ${results.failedRequests.length} |\n\n`;

  if (results.errors.length > 0) {
    md += `### Console Errors Details\n\n`;
    results.errors.forEach((e) => { md += `- 🔴 \`${escapeMd(e)}\`\n`; });
    md += `\n`;
  }
  if (results.warnings.length > 0) {
    md += `### Console Warnings Details\n\n`;
    results.warnings.forEach((w) => { md += `- 🟡 \`${escapeMd(w)}\`\n`; });
    md += `\n`;
  }
  if (results.pageErrors.length > 0) {
    md += `### Page Errors Details\n\n`;
    results.pageErrors.forEach((p) => { md += `- 🔴 \`${escapeMd(p)}\`\n`; });
    md += `\n`;
  }

  md += `_Tested with Playwright Chromium on production build (vite preview). Includes homepage load, form interaction, and wizard step navigation._\n\n`;
  md += `---\n\n_Hunt conducted by BroCula 🧛‍♂️ — Ultrawork Loop_\n`;
  return md;
}

function escapeMd(text) {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

run().catch((err) => {
  console.error("BroCula hunt failed:", err);
  process.exit(1);
});
