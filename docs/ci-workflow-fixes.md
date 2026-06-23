# CI Workflow Fixes — Partial (Workflow Files Pending)

> **Last updated**: 2026-06-23 (ULW Cycle)
> **Status**: ⚠️ **DOC FIX APPLIED — WORKFLOW FILES PENDING**

## Overview

BUG-014 and BUG-017 have documentation status updated on `main` (via PR #2045). The actual `.github/workflows/*.yml` changes could not be pushed because the GitHub App token lacks `workflows: write` permission.

| Fix | Issue | Description | Status |
| --- | ----- | ----------- | ------ |
| BUG-014 | #2030 | `main.yml` stale doc refs (`docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`) | ⚠️ Not applied to main.yml |
| BUG-017 | #2030 | Hardcoded `node-version: "20"` → `node-version-file: ".node-version"` across 4 workflow files (11 occurrences) | ⚠️ Not applied |

## Required Changes (awaiting user with `workflows: write` permission)

### `.github/workflows/main.yml` — 2 stale doc refs
- Line 39: `docs/bug.md` → `docs/bugs.md`
- Line 39: `docs/feature.md` → `docs/features.md`
- Line 263: `docs/bug.md` → `docs/bugs.md`

### `.github/workflows/iterate.yml` — 5 occurrences
- Lines 55, 120, 185, 250, 315: `node-version: "20"` → `node-version-file: ".node-version"`

### `.github/workflows/parallel.yml` — 4 occurrences
- Lines 70, 266, 344, 399: `node-version: "20"` → `node-version-file: ".node-version"`

### `.github/workflows/on-pull.yml` — 1 occurrence
- Line 53: `node-version: 20` → `node-version-file: ".node-version"`

### `.github/workflows/pr-gatekeeper.yml` — 1 occurrence
- Line 31: `node-version: "20"` → `node-version-file: ".node-version"`

## How to Apply (One-liner)

```bash
# Run from repo root. Uses sed to apply all changes across 5 workflow files.
sed -i 's/node-version: "20"/node-version-file: ".node-version"/g' \
  .github/workflows/iterate.yml \
  .github/workflows/parallel.yml \
  .github/workflows/pr-gatekeeper.yml
sed -i 's/node-version: 20/node-version-file: ".node-version"/' \
  .github/workflows/on-pull.yml
sed -i 's|docs/bug\.md|docs/bugs.md|g; s|docs/feature\.md|docs/features.md|g' \
  .github/workflows/main.yml
git add .github/workflows/
git commit -m "fix(ci): replace hardcoded node-version with node-version-file (#2030)"
git push
```

## Verification

```bash
grep -rn 'node-version:' .github/workflows/  # should be empty after fix
grep -rn 'docs/bug\.\|docs/feature\.' .github/workflows/  # should be empty after fix
```

## Historical Context

BUG-014/017 have been identified and re-identified multiple times. The fixes are committed locally on branch `fix/ci-node-version-22-2030` but cannot be pushed from CI due to GitHub App token `workflows: write` permission restriction. Apply the one-liner above with a Personal Access Token or via the GitHub UI to resolve permanently.
