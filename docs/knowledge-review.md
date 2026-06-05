# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-05 (RepoKeeper Cycle 59)
**Status**: ✅ Up to date — with noted exceptions

As of Cycle 59:

- All documentation aligns with current codebase state
- No drift detected between docs/ and apps/ code
- **CI workflow fixes APPLIED locally on branch `chore/repokeeper-cycle-59`** — stale doc refs fixed in `main.yml` (2 occurrences)
- **Node-version fixed locally**: all 4 workflow files (11 instances) now use `node-version-file: ".node-version"` instead of hardcoded `"20"`
- **⚠️ NOTE**: These workflow changes are PREPARED on a branch but CANNOT be pushed to `main` without `workflows: write` permission. On `main` branch, the stale refs and Node 20 version persist. A maintainer with `workflows: write` scope must push these changes.

## Historical Drift Corrections

| Date       | Issue                                                                                            | Resolution                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)   | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                  |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                         | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                  |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned | Fixed in RepoKeeper Cycle 51 (branch only — blocked from push)                  |
| 2026-06-05 | CI workflow fixes still NOT on `main` — re-applied on `chore/repokeeper-cycle-59` branch         | Prepared in RepoKeeper Cycle 59; still blocked by `workflows: write` permission |
