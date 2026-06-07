# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-07 (RepoKeeper Cycle 66)
**Status**: ✅ Up to date — with noted exceptions

As of Cycle 66:

- All documentation aligns with current codebase state — with corrections noted below
- No drift detected between docs/ and apps/ code
- **CHANGELOG updated**: Added missing entries for PRs #1649 through #1668 including UI features, Flexy improvements, BroCula audits, and CI fixes
- **BroCula hunt file added to README**: `brocula-hunt-2026-06-07.md` was missing from README — now added to directory tree and docs links section as fourteenth performance optimization cycle
- **CI workflow fixes PREPARED on branch `chore/repokeeper-cycle-59`** — stale doc refs fixed in `main.yml` (2 occurrences), node-version fixed (11 instances across 4 files)
- **⚠️ NOTE**: These workflow changes are PREPARED on a branch but CANNOT be pushed to `main` without `workflows: write` permission. On `main` branch, the stale refs and Node 20 version persist. A maintainer with `workflows: write` scope must push these changes.
- **Cycle 63 (2026-06-06)**: 6 empty CI fix commits attempted by `github-actions[bot]` — all blocked by `workflows: write` permission. No changes applied to `main` branch workflow files.

## Historical Drift Corrections

| Date       | Issue                                                                                             | Resolution                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)    | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                          | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned  | Fixed in RepoKeeper Cycle 51 (branch only — blocked from push)                       |
| 2026-06-05 | CI workflow fixes still NOT on `main` — re-applied on `chore/repokeeper-cycle-59` branch          | Prepared in RepoKeeper Cycle 59; still blocked by `workflows: write` permission      |
| 2026-06-06 | `ci-configuration.md` falsely claimed workflow fixes were applied on `main`                       | Corrected in RepoKeeper Cycle 61 — now accurately documents `main` state and blocker |
| 2026-06-06 | 6 empty CI fix commits attempted — Node.js 22 update + doc refs fix blocked by `workflows: write` | Noted in RepoKeeper Cycle 63 — workflow files on `main` remain unchanged             |
| 2026-06-06 | `brocula-hunt-2026-06-06-run2.md` and `brocula-hunt-2026-06-06-run3.md` missing from README       | Fixed in RepoKeeper Cycle 64 — added both to directory tree and docs links section   |
| 2026-06-07 | `docs/blueprint.md` claimed React 18 and "React hooks" state management                           | Fixed in RepoKeeper Cycle 65 — updated to React 19 and Zustand                       |
| 2026-06-07 | `brocula-hunt-2026-06-06-run4.md` missing from README                                             | Fixed in RepoKeeper Cycle 65 — added to directory tree and docs links section        |
| 2026-06-07 | `brocula-hunt-2026-06-07.md` missing from README; CHANGELOG stale (#1649-#1668 missing)           | Fixed in RepoKeeper Cycle 66 — added BroCula Jun 7 ref, updated CHANGELOG            |
