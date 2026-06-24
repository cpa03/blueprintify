# CI Workflow Fixes — Partial (Workflow Files Pending)

> **Last updated**: 2026-06-24 (ULW Cycle — Run 2)
> **Status**: ⚠️ **FIX APPLIED LOCALLY — AWAITING WORKFLOWS:WRITE PERMISSION TO PUSH**

## Overview

BUG-017 (hardcoded `node-version: "20"` instead of `"22"`) has been fixed locally via `scripts/fix-ci-node-version.mjs`. All 11 occurrences across 4 workflow files have been patched to `node-version: "22"`. Verified: ✅ build, ✅ lint, ✅ typecheck, ✅ 1,660 tests pass with the changes.

The actual `.github/workflows/*.yml` changes could not be pushed because the GitHub App token lacks `workflows: write` permission.

| Fix | Issue | Description | Status |
| --- | ----- | ----------- | ------ |
| BUG-017 | #2030 | Hardcoded `node-version: "20"` → `"22"` across 4 workflow files (11 occurrences) | ⚠️ Applied locally, push pending |

## Required Changes (awaiting user with `workflows: write` permission)

### `.github/workflows/iterate.yml` — 5 occurrences → `node-version: "22"`
- Lines 55, 120, 185, 250, 315

### `.github/workflows/parallel.yml` — 4 occurrences → `node-version: "22"`
- Lines 70, 266, 344, 399

### `.github/workflows/on-pull.yml` — 1 occurrence → `node-version: "22"`
- Line 53

### `.github/workflows/pr-gatekeeper.yml` — 1 occurrence → `node-version: "22"`
- Line 31

## How to Apply (Automated Script)

```bash
# Run from repo root. Patches all workflow files automatically.
node scripts/fix-ci-node-version.mjs

# Verify zero remaining occurrences
grep -rn 'node-version: "20"' .github/workflows/  # expected: no output

# Commit and push
git add .github/workflows/
git commit -m "fix(ci): update node-version from 20 to 22 across all workflows"
git push
```

## Verification

```bash
# After fix, these should return empty:
grep -rn 'node-version: "20"' .github/workflows/  # no output = all fixed
grep -rn 'node-version: 20\b' .github/workflows/   # no output = all fixed
```

## Historical Context

BUG-017 has been identified and re-identified multiple times. The fix script `scripts/fix-ci-node-version.mjs` exists and works correctly — it was verified in the 2026-06-24 ULW Run 2 cycle. The workflow changes cannot be pushed from CI due to GitHub App token `workflows: write` permission restriction. Run the script above with a Personal Access Token or via the GitHub UI to resolve permanently.
