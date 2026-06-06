# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-06 (RepoKeeper Cycle 64)
**Status**: ✅ Up to date — with noted exceptions

As of Cycle 64:

- All documentation aligns with current codebase state — with one correction noted below
- No drift detected between docs/ and apps/ code
- **Docs correction applied**: `ci-configuration.md` was corrected — it falsely claimed all workflow files use `node-version-file: ".node-version"` on `main`. They still use `node-version: "20"`. The doc now accurately reflects `main` state and documents the blocker.
- **CI workflow fixes PREPARED on branches** — stale doc refs fixed in `main.yml` (2 occurrences), node-version fixed (11 instances across 4 files)
- **⚠️ NOTE**: These workflow changes are PREPARED on branches but CANNOT be pushed to `main` without `workflows: write` permission. On `main` branch, the stale refs and Node 20 version persist. A maintainer with `workflows: write` scope must push these changes.
- **Cycle 64 (2026-06-06)**: Added missing `brocula-hunt-2026-06-06-run2.md` reference in README directory tree and docs section. Updated CHANGELOG with latest commit. All quality checks passing.

## Historical Drift Corrections

| Date       | Issue                                                                                             | Resolution                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)    | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                          | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned  | Fixed in RepoKeeper Cycle 51 (branch only — blocked from push)                       |
| 2026-06-05 | CI workflow fixes still NOT on `main` — re-applied on `chore/repokeeper-cycle-59` branch          | Prepared in RepoKeeper Cycle 59; still blocked by `workflows: write` permission      |
| 2026-06-06 | `ci-configuration.md` falsely claimed workflow fixes were applied on `main`                       | Corrected in RepoKeeper Cycle 61 — now accurately documents `main` state and blocker |
| 2026-06-06 | 6 empty CI fix commits attempted — Node.js 22 update + doc refs fix blocked by `workflows: write` | Noted in RepoKeeper Cycle 63 — workflow files on `main` remain unchanged             |
