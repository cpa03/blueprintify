#!/usr/bin/env node

/**
 * Issue Label Normalizer for the ULW Loop Issue Manager.
 *
 * Normalizes GitHub issue labels to the canonical contract used by the
 * repository's issue management workflow:
 *   - Category (exactly one): bug | enhancement | feature | docs | refactor | chore | test | ci | security
 *   - Priority (exactly one): P0 | P1 | P2 | P3
 *
 * The mapping is fully deterministic: it derives the canonical category and
 * priority from existing labels, legacy labels (priority:low/medium/high/
 * critical, type:feature/refactor/docs, documentation), and title prefixes
 * ([SECURITY], [TESTING] HIGH:, etc.). Multi-label conflicts are resolved by
 * specificity (bug > security > test > ci > refactor > docs > chore > feature
 * > enhancement) and severity (P0 > P1 > P2 > P3). A small override table
 * captures engineering-judgment calls that keyword mapping cannot decide.
 *
 * The script is idempotent and safe to re-run. Default is a dry run; pass
 * --apply to mutate labels. Requires the `gh` CLI authenticated with
 * `issues: write` permission — the loop's current GITHUB_TOKEN lacks it
 * (see docs/findings.md Cycle 22-24), so this script is staged for a
 * permission-capable cycle.
 *
 * Usage:
 *   node scripts/normalize-issue-labels.mjs            # dry run (default)
 *   node scripts/normalize-issue-labels.mjs --apply    # apply label changes
 *
 * @see https://github.com/cpa03/blueprintify/issues (Issue Manager Mode)
 */

import { execFileSync } from "node:child_process";

/** Canonical category labels (exactly one per issue). */
const CATEGORIES = [
  "bug",
  "enhancement",
  "feature",
  "docs",
  "refactor",
  "chore",
  "test",
  "ci",
  "security",
];

/** Category specificity for conflict resolution (lower index = more specific). */
const SPECIFICITY = [
  "bug",
  "security",
  "test",
  "ci",
  "refactor",
  "docs",
  "chore",
  "feature",
  "enhancement",
];

/** Canonical priority labels (exactly one per issue). */
const PRIORITIES = ["P0", "P1", "P2", "P3"];

/** Legacy priority labels mapped to canonical priorities. */
const PRIORITY_MAP = {
  "priority:critical": "P0",
  "priority:high": "P1",
  "priority:medium": "P2",
  "priority:low": "P3",
};

/**
 * Manual engineering-judgment overrides: { issueNumber: [category, priority] }.
 * These are cases where keyword heuristics are ambiguous or misleading
 * (e.g. an auth bypass must be P1/security even though its title lacks
 * a severity marker, and a "critical user workflows" phrase must not be
 * read as a critical-priority marker).
 */
const OVERRIDES = {
  846: ["security", "P2"], // share routes rate limiting/validation - security hardening
  847: ["security", "P1"], // auth bypass when API_KEY unset - critical security flaw
  848: ["security", "P2"], // permissive CORS wildcard - security
  849: ["ci", "P2"], // broken CI workflow (tests not running in gatekeeper)
  877: ["enhancement", "P3"],
  880: ["refactor", "P2"], // unsafe type assertions cleanup - code quality refactor
  890: ["security", "P2"], // canonical CORS issue (aligns with #930 MEDIUM)
  892: ["security", "P2"], // ownership verification for share deletion - authz gap
  911: ["test", "P2"], // OpenAI service missing tests (dup of #860)
  951: ["test", "P2"], // E2E tests for critical flows
  1015: ["test", "P2"], // missing playwright.config.ts - test infra
  1019: ["test", "P2"], // E2E test coverage gap
};

/** Title priority markers (e.g. "[TESTING] HIGH: ...") mapped to canonical priorities. */
const TITLE_PRIORITY = /\b(HIGH|MEDIUM|LOW|CRITICAL|P[0-3])([:])/i;
const TITLE_PRIORITY_MAP = {
  HIGH: "P1",
  MEDIUM: "P2",
  LOW: "P3",
  CRITICAL: "P0",
  P0: "P0",
  P1: "P1",
  P2: "P2",
  P3: "P3",
};

/** Runs `gh` and returns stdout (throws on non-zero exit). */
function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

/** Derives a canonical category from labels and title when none is present. */
function deriveCategory(labels, title) {
  const low = title.toLowerCase().trim();
  if (
    labels.some((l) => l === "security" || l === "area:security-engineer" || l === "security-engineer") ||
    low.startsWith("[security")
  ) {
    return "security";
  }
  if (labels.includes("bug") || low.startsWith("[bug") || low.startsWith("bug:")) {
    return "bug";
  }
  if (
    labels.some((l) => l === "test" || l === "testing") ||
    low.startsWith("[test") ||
    low.startsWith("test:") ||
    low.startsWith("[testing") ||
    low.startsWith("testing:")
  ) {
    return "test";
  }
  if (
    labels.some((l) => l === "ci" || l === "ci/cd") ||
    low.startsWith("ci") ||
    low.startsWith("[ci") ||
    low.startsWith("[ci/cd") ||
    low.includes("workflow") ||
    low.includes("pipeline") ||
    low.includes("actions/checkout") ||
    low.includes("dependabot") ||
    low.includes("npm audit") ||
    low.includes("codeql")
  ) {
    return "ci";
  }
  if (
    labels.includes("refactor") ||
    labels.includes("type:refactor") ||
    low.startsWith("[refactor") ||
    low.startsWith("refactor:") ||
    low.startsWith("[code quality") ||
    low.startsWith("[code-quality") ||
    low.includes("duplication") ||
    low.includes("split large") ||
    low.includes("unsafe type") ||
    low.includes("di container")
  ) {
    return "refactor";
  }
  if (
    labels.some((l) => l === "documentation" || l === "docs" || l === "type:docs") ||
    low.startsWith("[documentation") ||
    low.startsWith("[docs") ||
    low.startsWith("docs:") ||
    low.startsWith("documentation:")
  ) {
    return "docs";
  }
  if (
    labels.includes("chore") ||
    low.startsWith("[chore") ||
    low.startsWith("chore:") ||
    low.includes("cleanup") ||
    low.includes("remove console")
  ) {
    return "chore";
  }
  return "enhancement";
}

/** Derives a canonical priority from legacy labels and title markers. */
function derivePriority(labels, title) {
  for (const [legacy, p] of Object.entries(PRIORITY_MAP)) {
    if (labels.includes(legacy)) {
      return p;
    }
  }
  const match = TITLE_PRIORITY.exec(title);
  if (match) {
    return TITLE_PRIORITY_MAP[match[1].toUpperCase()];
  }
  return "P3";
}

/** Returns the most specific category among the given canonical ones. */
function mostSpecific(categories) {
  return [...categories].sort(
    (a, b) => SPECIFICITY.indexOf(a) - SPECIFICITY.indexOf(b)
  )[0];
}

/** Returns the most severe priority among the given canonical ones. */
function mostSevere(priorities) {
  return [...priorities].sort((a, b) => PRIORITIES.indexOf(a) - PRIORITIES.indexOf(b))[0];
}

/** Computes the label changes required for one issue. */
function computeChanges(number, title, labels) {
  const cats = labels.filter((l) => CATEGORIES.includes(l));
  const pris = labels.filter((l) => PRIORITIES.includes(l));
  const add = [];
  const remove = [];
  const override = OVERRIDES[number];

  // Category
  if (override) {
    const [wantCat] = override;
    if (!cats.includes(wantCat)) add.push(wantCat);
    for (const c of cats) if (c !== wantCat) remove.push(c);
  } else if (cats.length === 0) {
    add.push(deriveCategory(labels, title));
  } else if (cats.length > 1) {
    const keep = mostSpecific(cats);
    for (const c of cats) if (c !== keep) remove.push(c);
  }

  // Priority
  if (override) {
    const [, wantPrio] = override;
    if (!pris.includes(wantPrio)) add.push(wantPrio);
    for (const p of pris) if (p !== wantPrio) remove.push(p);
  } else if (pris.length === 0) {
    add.push(derivePriority(labels, title));
  } else if (pris.length > 1) {
    const keep = mostSevere(pris);
    for (const p of pris) if (p !== keep) remove.push(p);
  }

  return { add, remove };
}

/** Main entry point. */
function main() {
  const apply = process.argv.includes("--apply");
  let issues;
  try {
    issues = JSON.parse(
      gh([
        "issue",
        "list",
        "--state",
        "open",
        "--limit",
        "200",
        "--json",
        "number,title,labels",
      ])
    );
  } catch (err) {
    console.error(`Failed to list issues: ${err.message}`);
    console.error("Is `gh` authenticated? Required for this script.");
    process.exit(1);
  }

  const changes = [];
  for (const issue of issues) {
    const labels = (issue.labels ?? []).map((l) => l.name);
    const { add, remove } = computeChanges(issue.number, issue.title, labels);
    if (add.length || remove.length) {
      changes.push({ number: issue.number, title: issue.title.slice(0, 60), add, remove });
    }
  }

  changes.sort((a, b) => a.number - b.number);
  console.log(`Total issues needing changes: ${changes.length}`);
  for (const { number, title, add, remove } of changes) {
    console.log(`  #${number} ${title}: +${add.join(",")} -${remove.join(",")}`);
  }

  if (!apply) {
    console.log("\nDry run — no changes applied. Re-run with --apply to mutate labels.");
    return;
  }

  for (const { number, add, remove } of changes) {
    const args = ["issue", "edit", String(number)];
    if (add.length) args.push("--add-label", add.join(","));
    if (remove.length) args.push("--remove-label", remove.join(","));
    try {
      gh(args);
      console.log(`APPLIED #${number}: +${add.join(",")} -${remove.join(",")}`);
    } catch (err) {
      console.error(`FAILED #${number}: ${err.message}`);
    }
  }
}

main();
