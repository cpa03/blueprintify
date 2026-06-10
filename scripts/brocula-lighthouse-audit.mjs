/**
 * BroCula Lighthouse Audit Script
 * Runs Lighthouse on production build and reports scores/opportunities
 */

import lighthouse from "lighthouse";
import * as puppeteer from "puppeteer";
import { writeFileSync } from "fs";

const URL = process.env.TEST_URL || "http://127.0.0.1:4173";
const CHROME_PATH = "/home/runner/.cache/ms-playwright/chromium-1223/chrome-linux/chrome";

async function run() {
  console.log("🔦 Running Lighthouse audit on:", URL);

  // Launch Chrome via Puppeteer
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const endpoint = browser.wsEndpoint();

  // Lighthouse options - desktop viewport
  const options = {
    logLevel: "error",
    output: ["json"],
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    port: new URL(endpoint).port,
  };

  const config = {
    extends: "lighthouse:default",
    settings: {
      formFactor: "desktop",
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10736.609375, // 10 Mbps
        cpuSlowdownMultiplier: 1,
      },
    },
  };

  try {
    const result = await lighthouse(URL, options, config);
    const report = result.lhr;

    console.log("\n========================================");
    console.log("📋 BROCULA LIGHTHOUSE AUDIT RESULTS");
    console.log("========================================\n");

    // Categories
    const categories = report.categories;
    console.log("=== Lighthouse Scores ===");
    for (const [key, cat] of Object.entries(categories)) {
      const emoji = cat.score >= 0.9 ? "🟢" : cat.score >= 0.5 ? "🟡" : "🔴";
      console.log(`  ${emoji} ${cat.title}: ${Math.round(cat.score * 100)}/100`);
    }

    // Key metrics
    console.log("\n=== Key Metrics ===");
    const metrics = {
      "First Contentful Paint": "first-contentful-paint",
      "Largest Contentful Paint": "largest-contentful-paint",
      "Total Blocking Time": "total-blocking-time",
      "Cumulative Layout Shift": "cumulative-layout-shift",
      "Speed Index": "speed-index",
      "Time to Interactive": "interactive",
    };

    for (const [label, id] of Object.entries(metrics)) {
      const audit = report.audits[id];
      if (audit) {
        const displayValue = audit.displayValue || audit.numericValue?.toFixed(2) || "N/A";
        const score = audit.score !== null ? Math.round(audit.score * 100) : "N/A";
        console.log(`  ${label}: ${displayValue} (score: ${score}/100)`);
      }
    }

    // Optimization opportunities (diagnostics)
    console.log("\n=== Optimization Opportunities ===");
    const diagAudits = [
      "render-blocking-resources",
      "unused-javascript",
      "unused-css-rules",
      "uses-responsive-images",
      "offscreen-images",
      "uses-optimized-images",
      "uses-text-compression",
      "uses-rel-preconnect",
      "server-response-time",
      "redirects",
      "uses-rel-preload",
      "efficient-animated-content",
      "total-byte-weight",
      "modern-image-formats",
      "no-document-write",
      "dom-size",
      "critical-request-chains",
      "network-payload",
      "mainthread-work-breakdown",
      "bootup-time",
      "max-potential-fid",
      "legacy-javascript",
      "duplicated-javascript",
    ];

    let hasOpportunities = false;
    for (const id of diagAudits) {
      const audit = report.audits[id];
      if (audit && audit.score !== null && audit.score < 1) {
        hasOpportunities = true;
        const score = Math.round(audit.score * 100);
        const details = audit.details?.items;
        let detailStr = audit.displayValue || "";
        if (details && Array.isArray(details) && details.length > 0) {
          const firstItems = details.slice(0, 3);
          detailStr += firstItems.map((item) => {
            if (item.url) return `\n    - ${item.url}`;
            if (item.label) return `\n    - ${item.label}`;
            return "";
          }).join("");
        }
        const emoji = score >= 90 ? "🟢" : score >= 50 ? "🟡" : "🔴";
        console.log(`  ${emoji} ${audit.title}: ${score}/100 ${detailStr}`);
      }
    }

    if (!hasOpportunities) {
      console.log("  ✅ No optimization opportunities found!");
    }

    // Diagnostics
    console.log("\n=== Diagnostics ===");
    const diagnosticAudits = [
      "mainthread-work-breakdown",
      "bootup-time",
      "network-rtt",
      "network-server-latency",
      "total-byte-weight",
      "dom-size",
    ];
    for (const id of diagnosticAudits) {
      const audit = report.audits[id];
      if (audit) {
        const displayValue = audit.displayValue || audit.numericValue?.toFixed(2) || "N/A";
        console.log(`  ${audit.title}: ${displayValue}`);
      }
    }

    // Summary
    const perfScore = Math.round(categories.performance.score * 100);
    const a11yScore = Math.round(categories.accessibility.score * 100);
    const bpScore = Math.round(categories["best-practices"].score * 100);
    const seoScore = Math.round(categories.seo.score * 100);

    const allPassed = perfScore >= 90 && a11yScore >= 90 && bpScore >= 90 && seoScore >= 90;

    console.log("\n========================================");
    console.log(`🏁 VERDICT: ${allPassed ? "✅ PASS" : "❌ NEEDS IMPROVEMENT"}`);
    console.log(`  Performance: ${perfScore}/100`);
    console.log(`  Accessibility: ${a11yScore}/100`);
    console.log(`  Best Practices: ${bpScore}/100`);
    console.log(`  SEO: ${seoScore}/100`);
    console.log("========================================");

    // Write structured results
    const output = {
      categories: {
        performance: perfScore,
        accessibility: a11yScore,
        "best-practices": bpScore,
        seo: seoScore,
      },
      metrics: Object.fromEntries(
        Object.entries(metrics).map(([label, id]) => {
          const audit = report.audits[id];
          return [label, { value: audit?.displayValue || audit?.numericValue, score: audit?.score !== null ? Math.round(audit.score * 100) : null }];
        })
      ),
      opportunities: diagAudits
        .map((id) => {
          const audit = report.audits[id];
          if (audit && audit.score !== null && audit.score < 1) {
            return { title: audit.title, score: Math.round(audit.score * 100), detail: audit.displayValue };
          }
          return null;
        })
        .filter(Boolean),
      passed: allPassed,
    };

    writeFileSync("/tmp/brocula-lighthouse-results.json", JSON.stringify(output, null, 2));
    console.log("\nResults saved to /tmp/brocula-lighthouse-results.json");

    process.exit(allPassed ? 0 : perfScore < 90 ? 2 : 0);
  } catch (err) {
    console.error("❌ Lighthouse audit failed:", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
