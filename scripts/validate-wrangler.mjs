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
 *     Adds an authenticated check that the API_KEY Worker secret is provisioned
 *     in BOTH environments the rotation runbook provisions: the top-level
 *     (production) Worker and staging. Opt-in because it needs Cloudflare
 *     credentials, so CI (which must stay offline) does not run it. Run it
 *     before deploying the Worker: removing API_KEY from [vars] takes an
 *     environment dark until its secret exists.
 *
 * Called by: apps/api's "deploy" script, whose first command is
 * `node ../../scripts/validate-wrangler.mjs && wrangler deploy`. The root
 * "predeploy:api" script is a no-op hook — npm only auto-runs `pre<script>`
 * for a sibling `<script>`, and the root has no "deploy:api" — so the inline
 * guard in apps/api is the only thing that makes this check unavoidable, and it
 * is what the docs point at.
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

/**
 * Matches every committed wrangler config in `apps/api` — `wrangler.toml` and
 * `wrangler.test.toml`. The test config is committed plaintext in exactly the
 * same way and is the config `@cloudflare/vitest-pool-workers` loads, so a key
 * declared in it is just as published as one in the deploy config.
 */
const WRANGLER_CONFIG_PATTERN = /^wrangler.*\.toml$/;

/**
 * An assignment to the `API_KEY` key itself.
 *
 * The key has to sit at a key position — the start of a line, or immediately
 * after `{` / `,` so the inline-table form `vars = { API_KEY = "..." }` still
 * matches, since that is the staging shape this gate exists for. Anchoring is
 * what keeps `OPENAI_API_KEY`, `VITE_API_KEY` and `ADMIN_API_KEY` out: an
 * unanchored match reports "API_KEY is declared" for a different variable, and on
 * a gate that runs in front of every deploy a misleading verdict is as damaging
 * as a missed one.
 */
const API_KEY_ASSIGNMENT = /(?:^|[{,])\s*["']?(?:[A-Za-z0-9_-]+\.)*API_KEY["']?\s*=/;

/**
 * Environments `--check-secrets` must inspect, in report order.
 *
 * The rotation runbook requires the secret in every deployed environment, so a
 * check that only read the top-level Worker would hand an operator about to run
 * `wrangler deploy --env staging` a green result read from production while
 * staging is still dark. `envArgs` is empty for the top-level env, which takes
 * no `--env` flag; `putCmd` is the command that actually fixes that environment,
 * so the suggestion can never name the wrong one.
 *
 * @type {Array<{ label: string; envArgs: string[]; putCmd: string }>}
 */
const SECRET_ENVIRONMENTS = [
  { label: "production (top-level)", envArgs: [], putCmd: "wrangler secret put API_KEY" },
  { label: "staging", envArgs: ["--env", "staging"], putCmd: "wrangler secret put API_KEY --env staging" },
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
 * Strip a trailing TOML comment from a line.
 *
 * A `#` only opens a comment when it is outside a quoted string, because values
 * legitimately contain one (`CORS_ORIGIN = "https://x/#frag"`). Whole-line
 * comments collapse to an empty string here, so the explanatory comments that
 * name the `wrangler secret put` command cannot trip the API_KEY gate.
 *
 * This is not cosmetic: this script runs in front of every production deploy, so
 * a false positive blocks a deploy of a config that is perfectly safe until
 * someone edits the TOML — and an uncommented
 * `ENVIRONMENT = "production"   # API_KEY moved to a secret` is exactly the line
 * an operator writes after following the runbook.
 *
 * @param {string} line
 * @returns {string}
 */
function stripTomlComment(line) {
  /** @type {string} */
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (quote !== "") {
      // Only a matching quote closes the string. A backslash escapes the next
      // character in a basic ("...") string but is a literal character in a
      // 'literal' one, so the skip is conditioned on the quote type.
      if (char === quote) quote = "";
      else if (quote === '"' && char === "\\") i++;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#") {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Every committed wrangler config in `apps/api`, sorted so the report order is
 * deterministic regardless of filesystem enumeration order.
 *
 * @returns {string[]} absolute paths, possibly empty
 */
function listWranglerConfigs() {
  if (!fs.existsSync(API_DIR)) return [];
  return fs
    .readdirSync(API_DIR)
    .filter((name) => WRANGLER_CONFIG_PATTERN.test(name))
    .sort()
    .map((name) => path.join(API_DIR, name));
}

/**
 * BUG-058: `API_KEY` must never be declared as a `[vars]` entry in a committed
 * wrangler config. `[vars]` is committed plaintext, so a key declared there is a
 * published credential, and it is also baked into `wrangler dev`/deploy output.
 * Matches a real TOML assignment in either shape — a `[vars]` table line
 * (`API_KEY = "..."`) or an inline table (`vars = { API_KEY = "..." }`) — after
 * trailing comments are stripped, so a line that only *mentions* the key in a
 * comment is not mistaken for declaring it.
 *
 * This is the half of the contract that can be enforced offline, and it is the
 * first command in apps/api's `deploy` script: re-adding the key now fails the
 * gate instead of passing silently. Every `apps/api/wrangler*.toml` is read,
 * because a key declared in `wrangler.test.toml` is published exactly as much
 * as one in `wrangler.toml`, and each finding names the file it is in.
 *
 * @returns {CheckResult[]}
 */
function checkApiKeyNotDeclaredInVars() {
  const configPaths = listWranglerConfigs();
  if (configPaths.length === 0) {
    return [checkResult("skip", "Secret handling", "No wrangler*.toml found in apps/api — skipping")];
  }

  /** @type {Array<{ file: string; lineNum: number }>} */
  const declared = [];

  for (const configPath of configPaths) {
    const file = path.basename(configPath);
    const lines = fs.readFileSync(configPath, "utf-8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (API_KEY_ASSIGNMENT.test(stripTomlComment(lines[i]))) {
        declared.push({ file, lineNum: i + 1 });
      }
    }
  }

  if (declared.length === 0) {
    return [
      checkResult(
        "pass",
        "Secret handling",
        `API_KEY is not declared in [vars] in any of the ${configPaths.length} wrangler config(s) scanned — must be set with \`wrangler secret put API_KEY\``
      ),
    ];
  }

  /** @type {CheckResult[]} */
  const results = [
    checkResult(
      "fail",
      "Secret handling",
      `API_KEY is declared in a committed wrangler config — [vars] is plaintext, so this is a published credential`
    ),
  ];
  for (const { file, lineNum } of declared) {
    results.push(checkResult("fail", "Secret handling", `  ${file}: line ${lineNum}: remove the API_KEY assignment`));
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
 * How `wrangler secret list` output was understood.
 *
 * The three cases are kept apart on purpose. "Parsed, but not a list of secrets"
 * and "not JSON at all" both mean the answer is UNKNOWN, and unknown must never
 * be reported as "not provisioned": this gate promises that a green result means
 * the secret was actually seen, so for it the worst failure direction is a
 * confident wrong answer rather than an honest "I could not tell".
 *
 * @typedef {"names" | "not-a-list" | "unparseable"} SecretListParse
 */

/**
 * Read the secret name out of one `wrangler secret list` entry. Entries are
 * treated as unknown because their shape comes from a CLI's stdout, not from
 * anything this project types.
 *
 * @param {unknown} entry
 * @returns {string}
 */
function secretEntryName(entry) {
  if (typeof entry !== "object" || entry === null) return "";
  const name = /** @type {{ name?: unknown }} */ (entry).name;
  return typeof name === "string" ? name : "";
}

/**
 * Classify `wrangler secret list` stdout. ANSI codes must already be stripped:
 * wrangler colourises when it believes it is on a TTY, and a stray escape
 * sequence turns an otherwise perfect JSON array into `unparseable`.
 *
 * @param {string} stdout
 * @returns {{ parse: SecretListParse, names: string[] }}
 */
function parseSecretList(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    if (!Array.isArray(parsed)) {
      // e.g. a `{ "result": [...] }` wrapper or a rendered table: it is JSON, but
      // there are no names in it to check, so nothing may be concluded from it.
      return { parse: "not-a-list", names: [] };
    }
    return { parse: "names", names: parsed.map(secretEntryName) };
  } catch {
    return { parse: "unparseable", names: [] };
  }
}

/**
 * Last-resort name extraction for output that is not JSON at all (a table, a
 * log line, a colourised string). Only ever reached for `unparseable`.
 *
 * A salvaged line is kept only when what it yields could be a name. The
 * unfiltered version kept every line verbatim, which meant this fallback always
 * produced *something* — so an unreadable response was reported as a definitive
 * "not provisioned" precisely when nothing had actually been read. When nothing
 * identifier-shaped survives, the answer is "could not determine" instead.
 *
 * @param {string} stdout
 * @returns {string[]}
 */
function secretNamesFromLines(stdout) {
  return stdout
    .split("\n")
    .map((line) => line.replace(/^\s*["']name["']\s*:\s*["']/, "").replace(/["',].*$/, "").trim())
    .filter((name) => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(name));
}

/**
 * Verify the API_KEY Worker secret for one environment. Every message names the
 * environment it is about, so a green result can never be read as covering an
 * environment this check did not inspect, and the suggested fix is always the
 * command for the environment that actually failed.
 *
 * Fails loudly both when the secret is missing and when the check itself cannot
 * run (unauthenticated, unrecognised response), so it can never report a pass it
 * did not verify.
 *
 * @param {string} wranglerBin
 * @param {{ label: string; envArgs: string[]; putCmd: string }} env
 * @returns {CheckResult[]}
 */
function checkSecretInEnvironment(wranglerBin, env) {
  let stdout;
  try {
    stdout = execFileSync(wranglerBin, ["secret", "list", ...env.envArgs], {
      cwd: API_DIR,
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    });
  } catch (error) {
    const stderr = plain(error.stderr ?? error.message ?? "");
    const reason = stderr.split("\n").find((l) => l.trim().length > 0) ?? "unknown error";
    return [
      checkResult("fail", "Secret provisioning", `[${env.label}] Could not read Worker secrets: ${reason.trim()}`),
      checkResult(
        "warn",
        "Secret provisioning",
        "  → Authenticate (wrangler login or CLOUDFLARE_API_TOKEN) and re-run — this check does not skip silently"
      ),
    ];
  }

  const text = plain(stdout);
  let { parse, names } = parseSecretList(text);
  if (parse === "unparseable") {
    const salvaged = secretNamesFromLines(text);
    if (salvaged.length > 0) {
      names = salvaged;
      parse = "names";
    }
  }

  if (parse === "names" && names.includes("API_KEY")) {
    return [checkResult("pass", "Secret provisioning", `[${env.label}] Worker secret API_KEY is provisioned`)];
  }

  if (parse !== "names") {
    const shape =
      parse === "not-a-list"
        ? "`wrangler secret list` returned JSON that is not a list of secrets"
        : "`wrangler secret list` output was not JSON and matched no secret names";
    return [
      checkResult(
        "fail",
        "Secret provisioning",
        `[${env.label}] Could not determine whether Worker secret API_KEY is provisioned — ${shape}`
      ),
      checkResult(
        "warn",
        "Secret provisioning",
        `  → ${env.label} was NOT verified — do not read this as provisioned`
      ),
    ];
  }

  return [
    checkResult(
      "fail",
      "Secret provisioning",
      `[${env.label}] Worker secret API_KEY is NOT provisioned — every protected route will answer 503 CONFIGURATION_ERROR`
    ),
    checkResult("warn", "Secret provisioning", `  → Run: ${env.putCmd}`),
  ];
}

/**
 * Opt-in (`--check-secrets`): proves the API_KEY Worker secret is provisioned.
 *
 * This exists because removing API_KEY from [vars] is only safe once the secret
 * exists — until then every protected route answers 503 CONFIGURATION_ERROR.
 * It needs Cloudflare credentials, so it is never part of the default offline
 * gate; run it as a blocking pre-deploy step.
 *
 * Both deployed environments are inspected, not just the top-level one, because
 * the rotation runbook requires the secret in each of them. It fails loudly both
 * when the secret is missing and when the check itself cannot run
 * (unauthenticated, or a response this script cannot read), so it can never
 * report a pass it did not verify.
 *
 * @returns {CheckResult[]}
 */
function checkApiKeySecretProvisioned() {
  const wranglerBin = resolveWranglerBin();
  if (!wranglerBin) {
    return [
      checkResult(
        "fail",
        "Secret provisioning",
        "wrangler binary not found — API_KEY provisioning was inspected in NEITHER production (top-level) NOR staging"
      ),
      checkResult("warn", "Secret provisioning", "  → Run: npm install"),
    ];
  }

  return SECRET_ENVIRONMENTS.flatMap((env) => checkSecretInEnvironment(wranglerBin, env));
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
