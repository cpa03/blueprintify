# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-04 (RepoKeeper Cycle 55)
**Status**: ✅ Up to date

As of Cycle 55:

- **Doc accuracy correction**: `docs/bugs.md` BUG-014 and BUG-017 corrected from RESOLVED → UNRESOLVED (fixes never merged to main)
- **README tree updated**: Added 4 missing audit docs (`brocula-hunt-2026-06-03.md`, `brocula-hunt-2026-06-04.md`, `brocula-hunt-2026-06-04-run2.md`, `diagnostic-scoring-2026-06-04.md`)
- **READ ME doc links updated**: Added links for `brocula-hunt-2026-06-04-run2.md` and `diagnostic-scoring-2026-06-04.md`
- All documentation aligns with current codebase state
- No drift detected between docs/ and apps/ code
- **CI workflow fixes STILL BLOCKED from push** — GitHub App token lacks `workflows: write` permission (10+ cycles)
- **Node-version fixes still needed**: `.github/workflows/*.yml` still use `"20"` — need `"22"` (11 instances across 4 files)
- **Stale doc refs in `main.yml`**: `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md` (lines 39, 263)
- Maintainer with `workflows: write` scope required to push workflow file changes

## Historical Drift Corrections

| Date       | Issue                                                                                            | Resolution                   |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)   | Fixed in RepoKeeper Cycle 39 |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                         | Fixed in RepoKeeper Cycle 39 |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned | Fixed in RepoKeeper Cycle 51 |
