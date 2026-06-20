#!/usr/bin/env node

/**
 * Validates wrangler.toml for placeholder resource IDs before deployment.
 *
 * Prevents failed deployments due to placeholder KV namespace IDs,
 * D1 database IDs, or other Cloudflare resource identifiers.
 *
 * Usage: node scripts/validate-wrangler.mjs
 *
 * Called by: npm run validate:wrangler
 *
 * @see https://github.com/cpa03/blueprintify/issues/1045
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const WRANGLER_PATH = path.join(PROJECT_ROOT, "apps", "api", "wrangler.toml");

/** Placeholder patterns that MUST be replaced before deployment. */
const PLACEHOLDER_PATTERNS = [
  { pattern: /cache_kv_namespace_id/, label: "KV namespace ID (dev)" },
  { pattern: /production_cache_kv_id/, label: "KV namespace ID (production)" },
  { pattern: /staging_cache_kv_id/, label: "KV namespace ID (staging)" },
  { pattern: /local_database_id/, label: "D1 database ID (dev)" },
  { pattern: /production_database_id/, label: "D1 database ID (production)" },
  { pattern: /staging_database_id/, label: "D1 database ID (staging)" },
];

function main() {
  if (!fs.existsSync(WRANGLER_PATH)) {
    console.error(`❌ wrangler.toml not found at: ${WRANGLER_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(WRANGLER_PATH, "utf-8");
  const lines = content.split("\n");
  const found = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    for (const { pattern, label } of PLACEHOLDER_PATTERNS) {
      if (pattern.test(lines[i])) {
        found.push({ line: lineNum, label });
      }
    }
  }

  if (found.length === 0) {
    console.log("✅ wrangler.toml: no placeholder IDs detected.");
    process.exit(0);
  }

  console.error("❌ wrangler.toml contains placeholder resource IDs:\n");
  for (const { line, label } of found) {
    console.error(`   Line ${line}: ${label}`);
  }

  console.error(`
⚠️  Deployment will FAIL with these placeholder values.

Before deploying to Cloudflare Workers:
1. Create real Cloudflare resources for each environment:
   - KV Namespaces: wrangler kv:namespace create "blueprint-cache"
   - D1 Databases:   wrangler d1 create "blueprint-db"
2. Update the IDs in apps/api/wrangler.toml with the real values.
3. Repeat for each environment (dev, staging, production).

See apps/api/README.md for detailed instructions.`);
  process.exit(1);
}

main();
