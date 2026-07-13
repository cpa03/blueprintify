#!/usr/bin/env node

/**
 * Validates wrangler.toml for placeholder resource IDs and setup completeness
 * before deployment.
 *
 * Prevents failed deployments due to placeholder KV namespace IDs,
 * D1 database IDs, missing environment configuration, or other
 * Cloudflare resource identifiers.
 *
 * Usage:
 *   node scripts/validate-wrangler.mjs           # full validation (exit 1 on issues)
 *   node scripts/validate-wrangler.mjs --summary # summary mode (no exit code)
 *
 * Called by: npm run validate:wrangler (via predeploy:api)
 *
 * @see https://github.com/cpa03/blueprintify/issues/1045
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WRANGLER_PATH = path.join(PROJECT_ROOT, "apps", "api", "wrangler.toml");
const DEV_VARS_EXAMPLE_PATH = path.join(PROJECT_ROOT, "apps", "api", ".dev.vars.example");
const DEV_VARS_PATH = path.join(PROJECT_ROOT, "apps", "api", ".dev.vars");
const ROOT_PKG_PATH = path.join(PROJECT_ROOT, "package.json");

// ---- Config ----

/** Minimum required Node.js major version. */
const MIN_NODE_MAJOR = 22;

/** Placeholder patterns that MUST be replaced before deployment. */
const PLACEHOLDER_PATTERNS = [
  { pattern: /cache_kv_namespace_id/, label: "KV namespace ID (dev)", createCmd: "wrangler kv:namespace create blueprint-cache" },
  { pattern: /production_cache_kv_id/, label: "KV namespace ID (production)", createCmd: "wrangler kv:namespace create blueprint-cache --env production" },
  { pattern: /staging_cache_kv_id/, label: "KV namespace ID (staging)", createCmd: "wrangler kv:namespace create blueprint-cache --env staging" },
  { pattern: /local_database_id/, label: "D1 database ID (dev)", createCmd: "wrangler d1 create blueprint-db" },
  { pattern: /production_database_id/, label: "D1 database ID (production)", createCmd: "wrangler d1 create blueprint-db-prod --env production" },
  { pattern: /staging_database_id/, label: "D1 database ID (staging)", createCmd: "wrangler d1 create blueprint-db-staging --env staging" },
];

// ---- Helpers ----

/**
 * @typedef {{ status: "pass" | "fail" | "warn" | "skip", message: string, category: string }} CheckResult
 */

/**
 * @param {"pass" | "fail" | "warn" | "skip"} status
 * @param {string} category
 * @param {string} message
 * @returns {CheckResult}
 */
function checkResult(status, category, message) {
  return { status, category, message };
}

/**
 * @param {CheckResult[]} results
 */
function formatResults(results) {
  const categories = [...new Set(results.map((r) => r.category))];
  let hasFailure = false;

  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    const allPassed = catResults.every((r) => r.status === "pass");

    console.log(`\n── ${cat} ─${allPassed ? "─ ✅" : ""}`);

    for (const r of catResults) {
      const icon =
        r.status === "pass" ? "  ✅" : r.status === "fail" ? "  ❌" : r.status === "warn" ? "  ⚠️" : "  ⏭️";
      console.log(`${icon}  ${r.message}`);
      if (r.status === "fail") hasFailure = true;
    }
  }

  console.log(""); // trailing newline
  if (hasFailure) {
    console.error("❌ Validation failed — fix the issues above before deploying.");
  } else {
    console.log("✅ All checks passed.");
  }
}

// ---- Checks ----

/**
 * @returns {CheckResult}
 */
function checkWranglerExists() {
  if (!fs.existsSync(WRANGLER_PATH)) {
    return checkResult("fail", "wrangler.toml", `File not found at ${WRANGLER_PATH}`);
  }
  return checkResult("pass", "wrangler.toml", `Found at ${WRANGLER_PATH}`);
}

/**
 * @returns {CheckResult[]}
 */
function checkPlaceholderIds() {
  if (!fs.existsSync(WRANGLER_PATH)) {
    return [checkResult("skip", "Placeholder IDs", "wrangler.toml not found — skipping")];
  }

  const content = fs.readFileSync(WRANGLER_PATH, "utf-8");
  const lines = content.split("\n");
  /** @type {Array<{ line: number; label: string; createCmd?: string }>} */
  const found = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    for (const { pattern, label, createCmd } of PLACEHOLDER_PATTERNS) {
      if (pattern.test(lines[i])) {
        found.push({ line: lineNum, label, createCmd });
      }
    }
  }

  if (found.length === 0) {
    return [
      checkResult("pass", "Placeholder IDs", "All resource IDs look real — no placeholder patterns detected"),
    ];
  }

  /** @type {CheckResult[]} */
  const results = [
    checkResult("fail", "Placeholder IDs", `${found.length} placeholder(s) found — deployment will fail`),
  ];
  const shownCommands = new Set();
  for (const { line, label, createCmd } of found) {
    results.push(checkResult("fail", "Placeholder IDs", `  Line ${line}: ${label}`));
    if (createCmd && !shownCommands.has(createCmd)) {
      shownCommands.add(createCmd);
      results.push(checkResult("warn", "Placeholder IDs", `    → Run: ${createCmd} then copy the returned id`));
    }
  }
  results.push(
    checkResult(
      "warn",
      "Placeholder IDs",
      "After creating resources, update the id fields in wrangler.toml with the returned values",
    ),
  );
  return results;
}

/**
 * @returns {CheckResult}
 */
function checkNodeVersion() {
  const parts = process.versions.node.split(".");
  const major = Number.parseInt(parts[0] ?? "0", 10);
  if (major < MIN_NODE_MAJOR) {
    return checkResult(
      "fail",
      "Node.js",
      `Current Node.js ${process.versions.node} — requires v${MIN_NODE_MAJOR}+`,
    );
  }
  return checkResult(
    "pass",
    "Node.js",
    `v${process.versions.node} (v${MIN_NODE_MAJOR}+ required)`,
  );
}

/**
 * @returns {CheckResult[]}
 */
function checkDevVars() {
  /** @type {CheckResult[]} */
  const results = [];

  if (!fs.existsSync(DEV_VARS_EXAMPLE_PATH)) {
    results.push(
      checkResult("fail", "Environment", ".dev.vars.example not found — cannot validate expected vars"),
    );
    return results;
  }

  results.push(checkResult("pass", "Environment", ".dev.vars.example exists"));

  if (!fs.existsSync(DEV_VARS_PATH)) {
    results.push(
      checkResult(
        "warn",
        "Environment",
        ".dev.vars not found — copy .dev.vars.example to .dev.vars and add your API keys",
      ),
    );
  } else {
    results.push(checkResult("pass", "Environment", ".dev.vars exists"));
  }

  return results;
}

// ---- Main ----

function main() {
  const isSummary = process.argv.includes("--summary");

  /** @type {CheckResult[]} */
  const results = [
    checkWranglerExists(),
    ...checkPlaceholderIds(),
    checkNodeVersion(),
    ...checkDevVars(),
  ];

  const hasFailure = results.some((r) => r.status === "fail");

  if (isSummary) {
    // Summary mode: human-readable without exit code
    console.log("\n📋 Predeploy Setup Summary");
    formatResults(results);
    return;
  }

  // Full mode: exit 1 on failure
  console.log("\n🔍 Predeploy Validation");
  formatResults(results);

  if (hasFailure) {
    process.exit(1);
  }
}

main();
