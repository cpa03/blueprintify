# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:

- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State

**Last Review**: 2026-06-23 (RepoKeeper Cycle 136)
**Status**: ✅ Up to date — fully synced

As of cycle refresh:

- All documentation aligns with current codebase state
- No drift detected between docs/ and apps/ code
- **README BroCula description verified**: `(Jun 17–Jun 23)` — matches latest audit `brocula-hunt-2026-06-23-run1.md`
- **Typecheck/Lint/Tests**: All clean (0 errors, 0 warnings, **1,627/1,627 tests passing** — 714 web + 438 api + 475 shared)
- **Cycle 136**: Full repository audit, test count drift correction (1,615→1,627: +12 from useScrollLock hook test suite), CHANGELOG gap fix (added missing `test(web): useScrollLock hook (#2039)`), stale merged remote branch check (0 to delete), archive age assessment (71 files at 504K — within 30-day retention), docs refresh (findings, active-tasks, knowledge-review, CHANGELOG), quality verification (typecheck ✅ lint ✅ tests 1,627/1,627 ✅ format ✅), PR created
- **Cycle 134**: Full repository audit, CHANGELOG gap fix (added 3 missing commits after Cycle 133 — feat(ux) breathing animation, feat(flexy) storage constants, fix(build) shared rebuild), docs/audits/README.md duplicate entry cleanup (removed 6 duplicate BroCula archive entries), archive age assessment (71 files at 504K — within 30-day retention), docs refresh (findings, active-tasks, knowledge-review, CHANGELOG, audits/README), quality verification (typecheck ✅ lint ✅ tests 1,615/1,615 ✅ format ✅), PR created
- **Cycle 133**: Full repository audit, archive old audit reports (Jun 20 Runs 2-5 + Jun 22 issue audit → archive/), CHANGELOG gap fix (added missing feat(editor) commit), audit README refresh (Current Reports trimmed from 8 to 4 latest entries), docs refresh (findings, active-tasks, knowledge-review, audits/README, CHANGELOG), quality verification (typecheck ✅ lint ✅ tests 1,570/1,570 ✅ format ✅), PR created
- **Cycle 132**: Fixed `packages/shared` missing `vitest` devDependency (caused TS2307 during postinstall `tsc --build`), README BroCula description drift fix `(Jun 17–Jun 21)`→`(Jun 17–Jun 22)`, full repo audit (clean), quality verification (typecheck ✅ lint ✅ format ✅ tests 1,570/1,570 ✅), docs refresh (findings, active-tasks, knowledge-review, CHANGELOG, README), PR created
- **Cycle 131**: Full repository audit, archive old audit reports (Jun 17-19, issue audit Jun 19, ULW loop audit moved to archive), CHANGELOG gap fix (added missing commits: accessibility toast alert, BugFixer cycle, component tests, security strengthening, micro-ux reduced motion, flexy iteration 60, font preload), quality verification (typecheck ✅ lint ✅ tests 1,570/1,570 ✅), docs refresh (findings, active-tasks, knowledge-review, audits/README, CHANGELOG), PR created
- **README tree verified**: All entries match filesystem
- **CI workflow stale refs fixed**: BUG-014 and BUG-017 fully resolved — zero stale doc refs (`docs/bug.md`, `docs/feature.md`) and zero hardcoded `node-version: "20"` / `node-version: 20` remain in any workflow file
- **No redundant/temp/unused files found**
- **No type suppressions, TODO/FIXME/HACK, or `as any`** found in source code
- **`docs/findings.md` updated**: Cycle 133 entry added
- **`docs/active-tasks.md` updated**: Cycle 133 completed
- **`docs/knowledge-review.md` refreshed**: Cycle 133 — review date, cycle reference
- **`docs/audits/README.md` updated**: Current Reports trimmed from 8 to 4, archived entries added
- **`CHANGELOG.md` updated**: Cycle 133 + missing feat(editor) commit added

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
