# CI Workflow Fixes — May 31, 2026

## Overview

This document provides the exact changes needed to fix two CI issues. A maintainer with `workflows: write` GitHub token permissions must apply these changes.

## Issue #1293 — main.yml references non-existent doc files

**Problem**: `.github/workflows/main.yml` references `docs/bug.md` and `docs/feature.md` which don't exist. The correct files are `docs/bugs.md` and `docs/features.md`.

**Fix**: Apply the following changes to `.github/workflows/main.yml`:

**Line 39:**

```diff
- Baca docs/blueprint.md, docs/roadmap.md, docs/bug.md, docs/feature.md.
+ Baca docs/blueprint.md, docs/roadmap.md, docs/bugs.md, docs/features.md.
```

**Line 263:**

```diff
- Catat bug baru ke docs/bug.md.
+ Catat bug baru ke docs/bugs.md.
```

## Issues #1390 / #1470 — CI Node.js version mismatch

**Problem**: Project requires Node.js 22 (defined in `.nvmrc` and `.node-version`), but all CI workflows hardcode `node-version: "20"`. Wrangler (Cloudflare Workers CLI) requires Node.js 22+.

**Fix**: Change all occurrences of `node-version: 20` or `node-version: "20"` to `node-version: "22"` in the following files:

### `.github/workflows/on-pull.yml` — line 53

```diff
- node-version: 20
+ node-version: "22"
```

### `.github/workflows/pr-gatekeeper.yml` — line 31

```diff
- node-version: "20"
+ node-version: "22"
```

### `.github/workflows/parallel.yml` — lines 70, 266, 344, 399

```diff
- node-version: "20"
+ node-version: "22"
```

(Apply to all 4 occurrences)

### `.github/workflows/iterate.yml` — lines 55, 120, 185, 250, 315

```diff
- node-version: "20"
+ node-version: "22"
```

(Apply to all 5 occurrences)

## Patch file

A patch file is also available at `docs/fixes/ci-workflow-fixes.patch` and can be applied with:

```bash
git apply docs/fixes/ci-workflow-fixes.patch
```

## Verification

After applying changes, verify with:

```bash
npm run typecheck    # TypeScript check
npm run lint         # ESLint (0 warnings)
npm run format:check # Prettier (workflow files only)
npm run test:all     # All tests should pass
```

## Affected CI workflow files

| File                                  | Changes                 |
| ------------------------------------- | ----------------------- |
| `.github/workflows/main.yml`          | 2 doc reference fixes   |
| `.github/workflows/on-pull.yml`       | node-version 20→22      |
| `.github/workflows/pr-gatekeeper.yml` | node-version 20→22      |
| `.github/workflows/parallel.yml`      | node-version 20→22 (4x) |
| `.github/workflows/iterate.yml`       | node-version 20→22 (5x) |
