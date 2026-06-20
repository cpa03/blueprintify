#!/usr/bin/env node

/**
 * Secrets Scanner — Detects accidentally committed secrets in the codebase.
 *
 * Scans tracked files for patterns matching common API keys, tokens,
 * private keys, and other credentials. Designed for CI integration.
 *
 * Usage:  node scripts/scan-secrets.mjs
 * Called: npm run scan:secrets  (or integrated into `npm run check`)
 *
 * @see https://github.com/cpa03/blueprintify/issues/1088
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Exclusion rules
// ---------------------------------------------------------------------------

/** Directories that are NEVER scanned. */
const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  ".opencode",
  "dist",
  "build",
  "coverage",
  ".wrangler",
  ".next",
  ".nuxt",
  ".cache",
  ".husky",
  "audit-reports",
]);

/** File extensions to include in the scan. */
const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".env.example",
  ".sh",
  ".bash",
  ".zsh",
  "Dockerfile",
  "dockerfile",
]);

/** Known-safe file paths that may contain secret-like test data. */
const ALLOWED_PATHS = [
  // Test files with mock/placeholder data
  "prompt-security.test.ts",
  "config/env.test.ts",
  ".dev.vars.example",
  "wrangler.toml",
  // Generated lock files
  "package-lock.json",
  // This script (contains example patterns but not real secrets)
  "scripts/scan-secrets.mjs",
  // Test files that intentionally contain mock/placeholder credentials
  "share.test.ts",
  "secureLog.test.ts",
];

// ---------------------------------------------------------------------------
// Secret patterns (keys, tokens, credentials)
// ---------------------------------------------------------------------------

/**
 * Each entry has a regex and a label for the report.
 * Patterns are ordered most-specific-first to reduce false positives.
 */
const SECRET_PATTERNS = [
  // === AI / API Provider Keys ===
  { pattern: /sk-[a-zA-Z0-9_-]{20,}/g, label: "OpenAI API Key" },
  { pattern: /pk-[a-zA-Z0-9_-]{20,}/g, label: "Stripe Publishable Key" },
  { pattern: /sk_live_[a-zA-Z0-9_-]{20,}/g, label: "Stripe Secret Key (Live)" },
  { pattern: /sk_test_[a-zA-Z0-9_-]{20,}/g, label: "Stripe Secret Key (Test)" },

  // === Cloud Provider Keys ===
  { pattern: /AKIA[0-9A-Z]{16}/g, label: "AWS Access Key ID" },
  {
    pattern: /(?:(?:aws|amazon|s3|ec2|iam)_?)?secret(?:_access|)_?key['"]?\s*[:=]\s*['"][a-zA-Z0-9\/+]{40}['"]/gi,
    label: "AWS Secret Access Key",
  },
  { pattern: /AIza[0-9A-Za-z_-]{35}/g, label: "Google API Key" },

  // === GitHub / Git Tokens ===
  {
    pattern: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,}/g,
    label: "GitHub Token (personal/oauth/refresh)",
  },
  {
    pattern: /github_pat_[a-zA-Z0-9]{4,}_{1,2}[a-zA-Z0-9]{20,}/g,
    label: "GitHub Fine-Grained PAT",
  },

  // === Generic Token Patterns ===
  { pattern: /(?:api[-_]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{16,}['"]/gi, label: "Generic API Key" },
  { pattern: /(?:token|secret)\s*[:=]\s*['"][a-zA-Z0-9_\-\.\/+]{20,}['"]/gi, label: "Generic Token/Secret" },

  // === Private Keys ===
  {
    pattern: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    label: "Private Key (embedded)",
  },
  {
    pattern: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/g,
    label: "SSH Private Key (OpenSSH)",
  },

  // === Connection Strings / URLs with Embedded Credentials ===
  {
    pattern: /(?:mysql|postgres|postgresql|mongodb|redis):\/\/(?:[a-zA-Z0-9_%-]+:[a-zA-Z0-9_%-]+@)/g,
    label: "Database Connection String (embedded password)",
  },

  // === JWT / Bearer Tokens (in code) ===
  {
    pattern: /Bearer\s+[a-zA-Z0-9_\-\.]{40,}/g,
    label: "Bearer Token / JWT (hardcoded)",
  },

  // === Slack / Discord / Webhook URLs ===
  {
    pattern: /https?:\/\/hooks\.slack\.com\/services\/[a-zA-Z0-9/]{40,}/g,
    label: "Slack Webhook URL",
  },
  {
    pattern: /https?:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/g,
    label: "Discord Webhook URL",
  },

  // === .env / credentials ===
  {
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]+['"]/gi,
    label: "Hardcoded Password",
  },
];

// ---------------------------------------------------------------------------
// Scanner
// ---------------------------------------------------------------------------

/** Check if a file path is in the allowed (known-safe) list. */
function isAllowedPath(filePath) {
  return ALLOWED_PATHS.some((allowed) => filePath.includes(allowed));
}

/** Check the file extension against our scan list. */
function hasScanExtension(filePath) {
  const ext = path.extname(filePath);
  if (SCAN_EXTENSIONS.has(ext)) return true;
  const basename = path.basename(filePath);
  if (SCAN_EXTENSIONS.has(basename)) return true;
  return false;
}

/** Recursively walk a directory, returning qualifying file paths. */
function walkDir(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        results.push(...walkDir(fullPath));
      }
    } else if (entry.isFile() && hasScanExtension(fullPath) && !isAllowedPath(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Scan a single file for all secret patterns. Returns findings array. */
function scanFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, "utf-8");
  } catch {
    return [];
  }

  const findings = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    for (const { pattern, label } of SECRET_PATTERNS) {
      pattern.lastIndex = 0; // reset for global regex
      const match = pattern.exec(line);
      if (match) {
        const column = match.index + 1;
        // Truncate matched value for safe display
        const preview = match[0].length > 40 ? match[0].slice(0, 20) + "..." + match[0].slice(-10) : match[0];
        findings.push({ file: filePath, line: lineNum, column, label, preview });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const start = Date.now();
  const allFiles = walkDir(PROJECT_ROOT);
  const findings = [];

  for (const filePath of allFiles) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const fileFindings = scanFile(filePath);
    for (const f of fileFindings) {
      findings.push({ ...f, file: relativePath });
    }
  }

  const elapsed = Date.now() - start;

  if (findings.length === 0) {
    console.log(`✅ Secrets scan passed — no secrets detected (${allFiles.length} files in ${elapsed}ms).`);
    process.exit(0);
  }

  console.error(`❌ Secrets scan detected ${findings.length} potential secret(s):\n`);
  for (const { file, line, column, label, preview } of findings) {
    console.error(`   ${file}:${line}:${column}  [${label}]  (${preview})`);
  }
  console.error(
    `\n⚠️  Review each finding above. If it is a real secret, remove it from the repository history.\n` +
      `   If it is a false positive, add the file path to ALLOWED_PATHS in scripts/scan-secrets.mjs.\n` +
      `   Scanned ${allFiles.length} files in ${elapsed}ms.`
  );
  process.exit(1);
}

main();
