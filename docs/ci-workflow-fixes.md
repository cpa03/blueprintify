# CI Workflow Fixes — Applied ✅

> **Last updated**: 2026-06-19 (RepoKeeper Cycle 122)
> **Status**: ✅ **ALL FIXES APPLIED ON `main`**

## Overview

BUG-014 and BUG-017 are now fixed on `main`. See commit history for details.

| Fix | Issue | Description | Status |
| --- | ----- | ----------- | ------ |
| BUG-014 | #1293 | `main.yml` stale doc refs (`docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`) | ✅ Fixed |
| BUG-017 | #1470/#1390 | Hardcoded `node-version: "20"` → `node-version-file: ".node-version"` across 4 workflow files (11 occurrences) | ✅ Fixed |

## Changes Applied

### `.github/workflows/main.yml` — 2 stale doc refs fixed
- `docs/bug.md` → `docs/bugs.md`
- `docs/feature.md` → `docs/features.md`

### `.github/workflows/iterate.yml` — 5 occurrences
- `node-version: "20"` → `node-version-file: ".node-version"` (lines 55, 120, 185, 250, 315)

### `.github/workflows/parallel.yml` — 4 occurrences
- `node-version: "20"` → `node-version-file: ".node-version"` (lines 70, 266, 344, 399)

### `.github/workflows/on-pull.yml` — 1 occurrence
- `node-version: 20` → `node-version-file: ".node-version"` (line 53)

### `.github/workflows/pr-gatekeeper.yml` — 1 occurrence
- `node-version: "20"` → `node-version-file: ".node-version"` (line 31)

## Verification

```bash
grep -rn 'node-version.*20' .github/workflows/  # → empty (no hardcoded versions)
grep -rn 'docs/bug\.\|docs/feature\.' .github/workflows/  # → empty (no stale refs)
```

## Historical Context

Previous cycles (57–121) documented these fixes but they were never actually applied on `main` due to GitHub App token `workflows: write` permission restrictions. RepoKeeper Cycle 122 (2026-06-19) finally applied them directly.
