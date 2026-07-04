#!/usr/bin/env node

/**
 * CI Workflow Fix Script
 *
 * Fixes issues in GitHub Actions workflow files:
 *
 * BUG-014 — Stale doc references:
 *   Replaces legacy `docs/bug.md` and `docs/feature.md` with `docs/bugs.md` and `docs/features.md`.
 *
 * BUG-017 — Hardcoded Node.js version:
 *   Replaces hardcoded node-version:"20" with node-version-file: ".node-version"
 *   Uses .node-version as single source of truth for Node.js version.
 *
 * BUG-FIXER — Wrong agent name in iterate.yml BugFixer job:
 *   Changes `--agent RepoKeeper` to `--agent BugFixer` and fixes success echo message.
 *
 * Usage: node scripts/fix-ci-node-version.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const workflowsDir = join(root, ".github/workflows");

const workflowFiles = readdirSync(workflowsDir).filter((f) => f.endsWith(".yml"));

let changed = 0;
let totalReplacements = 0;

for (const file of workflowFiles) {
  const filePath = join(root, ".github/workflows", file);
  let content = readFileSync(filePath, "utf-8");
  const original = content;

  // BUG-014: Fix stale doc references
  content = content.replace(/docs\/bug\.md/g, "docs/bugs.md");
  content = content.replace(/docs\/feature\.md/g, "docs/features.md");

  // BUG-017: Replace hardcoded node-version with node-version-file
  content = content.replace(/node-version:\s*"20"/g, 'node-version-file: ".node-version"');
  content = content.replace(/node-version:\s*20\b(?!")/g, 'node-version-file: ".node-version"');

  // BUG-FIXER: Fix BugFixer job agent name in iterate.yml
  // The BugFixer job was using `--agent RepoKeeper` instead of `--agent BugFixer`
  if (file === "iterate.yml") {
    content = content.replace(
      /(--agent )RepoKeeper(\s*\\\s*\n\s+--model)/g,
      "$1BugFixer$2",
    );
    content = content.replace(
      /"✅ Architect work completed successfully"/g,
      '"✅ BugFixer work completed successfully"',
    );
  }

  if (content !== original) {
    writeFileSync(filePath, content, "utf-8");
    const count =
      (original.match(/node-version:\s*"20"/g) || []).length +
      (original.match(/node-version:\s*20\b(?!")/g) || []).length +
      (original.match(/docs\/bug\.md/g) || []).length +
      (original.match(/docs\/feature\.md/g) || []).length +
      (original.match(/--agent RepoKeeper/g) || []).length;
    changed++;
    totalReplacements += count;
    console.log(`✓ ${file}: updated ${count} occurrence(s)`);
  }
}

console.log(`\nDone! ${changed} file(s) updated, ${totalReplacements} total replacement(s).`);

if (changed === 0) {
  console.log("No workflow files needed updating.");
}


