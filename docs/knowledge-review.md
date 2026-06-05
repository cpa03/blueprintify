# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-05 (RepoKeeper Cycle 57)
**Status**: ✅ Up to date

As of Cycle 57:

- All documentation aligns with current codebase state
- No drift detected between docs/ and apps/ code
- **CI workflow fixes APPLIED** — stale doc refs fixed in `main.yml` (3 occurrences)
- **Node-version fixed**: all 4 workflow files (11 instances) now use `node-version-file: ".node-version"` instead of hardcoded `"20"`
- Changes pushed on PR branch for review

## Historical Drift Corrections

| Date       | Issue                                                                                            | Resolution                   |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)   | Fixed in RepoKeeper Cycle 39 |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                         | Fixed in RepoKeeper Cycle 39 |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned | Fixed in RepoKeeper Cycle 51 |
