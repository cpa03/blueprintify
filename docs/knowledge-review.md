# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-20 (RepoKeeper Cycle 126)
**Status**: ✅ Up to date — fully synced

As of cycle refresh:

- All documentation aligns with current codebase state
- No drift detected between docs/ and apps/ code
- **README BroCula description verified**: `(Jun 17–Jun 20)` — matches latest audit `brocula-hunt-2026-06-20-run2.md`
- **Typecheck/Lint/Format**: All clean (0 errors, 0 warnings) — format fix: apps/web/src/index.css
- **Cycle 126**: Full repository audit, prettier formatting fix (apps/web/src/index.css), CHANGELOG gap fix (4 missing commits #1961-#1964 added), 22 remote branches assessed (all active), documentation refreshed
- **README tree verified**: All entries match filesystem
- **CI workflow stale refs fixed**: BUG-014 and BUG-017 resolved — zero stale doc refs, zero hardcoded node-version 20 remain
- **No redundant/temp/unused files found**
- **No type suppressions, TODO/FIXME/HACK, or `as any`** found in source code
- **`docs/findings.md` updated**: Cycle 126 entry added
- **`docs/active-tasks.md` updated**: Cycle 126 completed
- **`docs/knowledge-review.md` refreshed**: Cycle 126 — review date, cycle reference

## Historical Drift Corrections

| Date       | Issue                                                                                                         | Resolution                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-05-31 | `main.yml` referenced `docs/bug.md` and `docs/feature.md` (renamed to `bugs.md`/`features.md`)                | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-05-31 | CI workflows used `node-version: "20"` instead of `"22"`                                                      | Fixed in RepoKeeper Cycle 39 (branch only — blocked from push)                       |
| 2026-06-04 | Same drift regressed — CI workflows reverted to `node-version: "20"` and stale doc refs returned              | Fixed in RepoKeeper Cycle 51 (branch only — blocked from push)                       |
| 2026-06-05 | CI workflow fixes still NOT on `main` — re-applied on `chore/repokeeper-cycle-59` branch                      | Prepared in RepoKeeper Cycle 59; still blocked by `workflows: write` permission      |
| 2026-06-06 | `ci-configuration.md` falsely claimed workflow fixes were applied on `main`                                   | Corrected in RepoKeeper Cycle 61 — now accurately documents `main` state and blocker |
| 2026-06-06 | 6 empty CI fix commits attempted — Node.js 22 update + doc refs fix blocked by `workflows: write`             | Noted in RepoKeeper Cycle 63 — workflow files on `main` remain unchanged             |
| 2026-06-06 | `brocula-hunt-2026-06-06-run2.md` and `brocula-hunt-2026-06-06-run3.md` missing from README                   | Fixed in RepoKeeper Cycle 64 — added both to directory tree and docs links section   |
| 2026-06-07 | `docs/blueprint.md` claimed React 18 and "React hooks" state management                                       | Fixed in RepoKeeper Cycle 65 — updated to React 19 and Zustand                       |
| 2026-06-07 | `brocula-hunt-2026-06-06-run4.md` missing from README                                                         | Fixed in RepoKeeper Cycle 65 — added to directory tree and docs links section        |
| 2026-06-07 | `brocula-hunt-2026-06-07.md` missing from README; CHANGELOG stale (#1649-#1668 missing)                       | Fixed in RepoKeeper Cycle 66 — added BroCula Jun 7 ref, updated CHANGELOG            |
| 2026-06-07 | CHANGELOG stale (#1669-#1673 missing) — BugFixer, RepoKeeper 66, slide-out animation, ENV_VAR_KEYS, BroCula   | Fixed in RepoKeeper Cycle 67 — added all 5 missing PR entries to CHANGELOG           |
| 2026-06-07 | `brocula-hunt-2026-06-07-run2.md` missing from README; CHANGELOG stale (#1674-#1678 missing)                  | Fixed in RepoKeeper Cycle 68 — added BroCula Jun 7 Run 2 ref, updated CHANGELOG      |
| 2026-06-07 | `brocula-hunt-2026-06-07-run3.md` and `issue-audit-report-2026-06-07.md` missing from README; CHANGELOG stale | Fixed in RepoKeeper Cycle 69 — added both README refs, updated CHANGELOG             |
