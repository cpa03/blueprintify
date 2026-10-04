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
 *   node scripts/validate-wrangler.mjs             # full validation (exit 1 on issues)
 *   node scripts/validate-wrangler.mjs --summary   # summary mode (no exit code)
 *   node scripts/validate-wrangler.mjs --check-secrets
 *     Adds an authenticated check that the API_KEY Worker secret is provisioned.
 *     Opt-in because it needs Cloudflare credentials, so CI (which must stay
 *     offline) does not run it. Run it before deploying the Worker: removing
 *     API_KEY from [vars] takes production dark until the secret exists.
 *
 * Called by: npm run validate:wrangler (via predeploy:api)
 *
 * @see https://github.com/cpa03/blueprintify/issues/1045
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const API_DIR = path.join(PROJECT_ROOT, "apps", "api");
const WRANGLER_PATH = path.join(API_DIR, "wrangler.toml");
const DEV_VARS_EXAMPLE_PATH = path.join(API_DIR, ".dev.vars.example");
const DEV_VARS_PATH = path.join(API_DIR, ".dev.vars");
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

/**
 * BUG-058: `API_KEY` must never be declared as a `[vars]` entry. `[vars]` is
 * committed plaintext, so a key declared there is a published credential, and it
 * is also baked into `wrangler dev`/deploy output. Matches a real TOML
 * assignment in either shape — a `[vars]` table line (`API_KEY = "..."`) or an
 * inline table (`vars = { API_KEY = "..." }`) — and skips commented lines, so the
 * explanatory comments that name the command cannot trip it.
 *
 * This is the half of the contract that can be enforced offline, and it is what
 * `predeploy:api` runs before every deploy: re-adding the key to wrangler.toml
 * now fails the gate instead of passing silently.
 *
 * @returns {CheckResult[]}
 */
function checkApiKeyNotDeclaredInVars() {
  if (!fs.existsSync(WRANGLER_PATH)) {
    return [checkResult("skip", "Secret handling", "wrangler.toml not found — skipping")];
  }

  const declared = [];
  const lines = fs.readFileSync(WRANGLER_PATH, "utf-8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const code = lines[i].trim();
    if (code.startsWith("#")) continue;
    if (/["']?API_KEY["']?\s*=/.test(code)) {
      declared.push({ lineNum: i + 1, line: code });
    }
  }

  if (declared.length === 0) {
    return [
      checkResult(
        "pass",
        "Secret handling",
        "API_KEY is not declared in [vars] — must be set with `wrangler secret put API_KEY`"
      ),
    ];
  }

  /** @type {CheckResult[]} */
  const results = [
    checkResult(
      "fail",
      "Secret handling",
      `API_KEY is declared in wrangler.toml — [vars] is committed plaintext, so this is a published credential`
    ),
  ];
  for (const { lineNum } of declared) {
    results.push(checkResult("fail", "Secret handling", `  Line ${lineNum}: remove the API_KEY assignment`));
  }
  results.push(
    checkResult("warn", "Secret handling", "  → Run: wrangler secret put API_KEY  (--env staging for staging)")
  );
  return results;
}

/** Resolve the workspace's wrangler binary, preferring the local install. */
function resolveWranglerBin() {
  for (const candidate of [
    path.join(API_DIR, "node_modules", ".bin", "wrangler"),
    path.join(PROJECT_ROOT, "node_modules", ".bin", "wrangler"),
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Strip terminal colour codes so wrangler's output is readable in the report. */
function plain(text) {
  // eslint-disable-next-line no-control-regex
  return String(text).replace(/\u001B\[[0-9;]*m/g, "");
}

/**
 * Opt-in (`--check-secrets`): proves the API_KEY Worker secret is provisioned.
 *
 * This exists because removing API_KEY from [vars] is only safe once the secret
 * exists — until then every protected route answers 503 CONFIGURATION_ERROR.
 * It needs Cloudflare credentials, so it is never part of the default offline
 * gate; run it as a blocking pre-deploy step.
 *
 * Fails loudly both when the secret is missing and when the check itself cannot
 * run (unauthenticated), so it can never report a pass it did not verify.
 *
 * @returns {CheckResult[]}
 */
function checkApiKeySecretProvisioned() {
  const wranglerBin = resolveWranglerBin();
  if (!wranglerBin) {
    return [
      checkResult("fail", "Secret provisioning", "wrangler binary not found — cannot verify API_KEY is provisioned"),
      checkResult("warn", "Secret provisioning", "  → Run: npm install"),
    ];
  }

  let stdout;
  try {
    stdout = execFileSync(wranglerBin, ["secret", "list"], {
      cwd: API_DIR,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    });
  } catch (error) {
    const stderr = plain(error.stderr ?? error.message ?? "");
    const reason = stderr.split("\n").find((l) => l.trim().length > 0) ?? "unknown error";
    return [
      checkResult("fail", "Secret provisioning", `Could not read Worker secrets: ${reason.trim()}`),
      checkResult(
        "warn",
        "Secret provisioning",
        "  → Authenticate (wrangler login or CLOUDFLARE_API_TOKEN) and re-run — this check does not skip silently"
      ),
    ];
  }

  /** @type {string[]} */
  let names = [];
  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) names = parsed.map((entry) => String(entry?.name ?? ""));
  } catch {
    names = stdout
      .split("\n")
      .map((line) => line.replace(/^\s*["']name["']\s*:\s*["']/, "").replace(/["',].*$/, "").trim())
      .filter(Boolean);
  }

  if (names.includes("API_KEY")) {
    return [checkResult("pass", "Secret provisioning", "Worker secret API_KEY is provisioned")];
  }

  return [
    checkResult(
      "fail",
      "Secret provisioning",
      "Worker secret API_KEY is NOT provisioned — every protected route will answer 503 CONFIGURATION_ERROR"
    ),
    checkResult("warn", "Secret provisioning", "  → Run: wrangler secret put API_KEY"),
    checkResult("warn", "Secret provisioning", "  → Then: wrangler secret put API_KEY --env staging"),
  ];
}

function main() {
  const isSummary = process.argv.includes("--summary");
  const checkSecrets = process.argv.includes("--check-secrets");

  /** @type {CheckResult[]} */
  const results = [
    checkWranglerExists(),
    ...checkPlaceholderIds(),
    checkNodeVersion(),
    ...checkDevVars(),
    ...checkApiKeyNotDeclaredInVars(),
  ];

  if (checkSecrets) {
    results.push(...checkApiKeySecretProvisioned());
  }

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
