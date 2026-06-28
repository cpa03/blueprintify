/**
 * BroCula Lighthouse Details Extractor
 */
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";
const CHROME_PATH = process.env.CHROME_PATH;

async function runLighthouse() {
  console.log(`[BroCula] Detailed audit of ${TARGET_URL}...`);

  const chrome = await chromeLauncher.launch({
    chromePath: CHROME_PATH,
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const options = {
    logLevel: "silent",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
  };

  try {
    const result = await lighthouse(TARGET_URL, options);
    const report = JSON.parse(result.report);

    // Print all audits that have numericValue > 0 or score < 1
    const opportunityAudits = [];
    const diagnosticAudits = [];
    const passedAudits = [];

    for (const [id, audit] of Object.entries(report.audits)) {
      if (audit.score === null) continue;
      
      if (audit.group === "load-opportunities" || 
          audit.details?.type === "opportunity" ||
          audit.group === "diagnostics") {
        const entry = {
          id,
          title: audit.title,
          score: audit.score,
          numericValue: audit.numericValue || 0,
          numericUnit: audit.numericUnit || "",
          displayValue: audit.displayValue || "",
          group: audit.group || "",
        };

        if (audit.score < 1) {
          opportunityAudits.push(entry);
        } else {
          passedAudits.push(entry);
        }
      }
    }

    console.log("\n=== PASSED AUDITS ===\n");
    for (const a of passedAudits.sort((a, b) => a.title.localeCompare(b.title))) {
      console.log(`  ✅ ${a.title}: ${a.displayValue || 'pass'}`);
    }

    console.log("\n=== OPTIMIZATION OPPORTUNITIES ===\n");
    for (const a of opportunityAudits.sort((a, b) => b.numericValue - a.numericValue)) {
      const icon = a.score >= 0.9 ? "🟢" : a.score >= 0.5 ? "🟡" : "🔴";
      console.log(`  ${icon} [Score: ${Math.round(a.score * 100)}] ${a.title}: ${a.numericValue}${a.numericUnit} ${a.displayValue}`);
    }

    // Print full audit JSON for key performance metrics
    console.log("\n=== KEY METRICS ===\n");
    const metrics = [
      "first-contentful-paint",
      "largest-contentful-paint",
      "total-blocking-time",
      "cumulative-layout-shift",
      "speed-index",
      "interactive",
    ];
    for (const m of metrics) {
      const audit = report.audits[m];
      if (audit) {
        console.log(`  ${audit.title}: ${audit.displayValue || audit.numericValue}`);
      }
    }

    // Detailed unused bytes info
    console.log("\n=== UNUSED BYTES DETAIL ===\n");
    const unusedAudits = ["unused-javascript", "unused-css-rules", "unminified-css", "unminified-javascript"];
    for (const u of unusedAudits) {
      const audit = report.audits[u];
      if (audit && audit.details?.items) {
        console.log(`  ${audit.title}:`);
        for (const item of audit.details.items) {
          console.log(`    - ${item.url || item.source || 'n/a'}: ${(item.wastedBytes / 1024).toFixed(1)}KB wasted (${(item.wastedPercent || 0).toFixed(0)}%)`);
        }
      }
    }

  } finally {
    await chrome.kill();
  }
}

runLighthouse()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
