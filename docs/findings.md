# Findings

> **Incoming signals and observations** — cleared after each orchestration cycle. Historical cycles are preserved in git history.

## Cycle 193 (2026-07-05 — RepoKeeper: findings.md trim (436KB→2KB), stale archive retention cleanup (4 files), merged branch cleanup, CONSOLIDATED-README.md update, quality verification)

### Audit Scope

Full repository cleanup and maintenance: trimmed bloated `docs/findings.md` from 436KB/6,816 lines to 2KB/56 lines by archiving cycles older than Cycle 192 into git history; removed 4 archived BroCula audit files past 30-day retention (Jun 1-4); deleted stale merged remote branch `fix/ci-nodejs-22`; updated `docs/audits/archive/CONSOLIDATED-README.md` to reflect latest cleanup; documentation drift check (README.md vs actual structure — clean, no drift). Quality verification: typecheck ✅ lint ✅ build ✅ tests 1,745/1,745 ✅ format ✅, 0 `@ts-expect-error`/`@ts-ignore`, 0 `as any`, 0 empty catch blocks, 0 TODO/FIXME/HACK in source.

### Status Summary

| Check | Result |
|-------|--------|
| Typecheck | ✅ Clean (0 errors) |
| Lint | ✅ Clean (0 warnings/errors) |
| Build (web) | ✅ Successful |
| Tests | ✅ **1,745/1,745 passing** (723 web + 443 API + 579 shared) |
| @ts-ignore/as any | ✅ None in source code |
| TODO/FIXME/HACK | ✅ None in source code |
| Empty catch blocks | ✅ None |
| Format | ✅ All files Prettier-formatted |
| Tracked .patch files | ✅ None found on main |
| Stale merged branches | ✅ Clean (fix/ci-nodejs-22 deleted) |
| BUG-014/BUG-017 | 🔴 Still present on main — `workflows: write` blocker |
| npm audit | ⚠️ 17 moderate (BUG-013 — upstream tooling) |
| **Overall** | **✅ All quality checks passing** |

### Actions Taken This Cycle

1. **findings.md trim**: Reduced from 436KB/6,816 lines to 2KB/56 lines — archived cycles older than Cycle 192 into git history. Added note directing readers to `git log -- docs/findings.md`.
2. **Stale archive cleanup**: Removed 4 BroCula audit files past 30-day retention (brocula-hunt-2026-06-03.md, brocula-hunt-2026-06-04.md, brocula-hunt-2026-06-04-run2.md, diagnostic-scoring-2026-06-04.md).
3. **Merged branch cleanup**: Deleted stale merged remote branch `origin/fix/ci-nodejs-22`.
4. **CONSOLIDATED-README.md updated**: Reflected latest retention cleanup date and updated content description.
5. **Documentation drift check**: Verified README.md structure matches actual docs directory — no drift detected.
6. **Quality verification**: typecheck ✅ lint ✅ build ✅ tests 1,745/1,745 ✅ format ✅.

### Verification

- [x] Typecheck — 0 errors ✅
- [x] Lint — 0 errors/warnings ✅
- [x] Build — successful ✅
- [x] Tests — 1,745/1,745 passing ✅
- [x] Format — all Prettier-formatted ✅
- [x] No redundant/temp/unused source files — clean ✅
- [x] No tracked .patch files on main ✅
- [x] Stale merged branches — cleaned (1 deleted) ✅
- [x] findings.md — trimmed 99.5% ✅
- [x] npm audit — 17 moderate (BUG-013, same documented blocker) ✅
- [x] BUG-014/BUG-017 — verified status (still blocked) ✅

## Cycle 192 (2026-07-05 — RepoKeeper: Full audit, BroCula ref drift fix (Jul 4 Run 2 → Jul 5 Run 2), CHANGELOG gap fix, doc refresh, quality verification)

### Audit Scope

Full repository audit covering quality verification (typecheck ✅ lint ✅ build ✅ tests 1,745/1,745 ✅ format ✅, 0 `@ts-expect-error`/`@ts-ignore`, 0 `as any`, 0 empty catch blocks, 0 TODO/FIXME/HACK in source), BroCula ref drift fix (docs/audits/README.md and knowledge-review.md referenced Jul 4 Run 2 as latest — updated to Jul 5 Run 2: `brocula-hunt-2026-07-05-run2.md` / LH **98-100-100-100**, **1745 tests** ✅), CHANGELOG gap fix (6 post-Cycle-191 commits: BugFixer Cycle Jul 05, feat(ui) copy error details button, feat(ui) external link keyboard focus, BugFixer ULW Cycle Jul 05, refactor(flexy) hardcoded a11y strings Iteration 96, BroCula audit Jul 5 Run 2), README BroCula date drift fix (Jun 17–Jul 4 → Jun 17–Jul 5), doc refresh (findings, active-tasks, knowledge-review, CHANGELOG, README, audits/README), npm audit (17 moderate — BUG-013 upstream tooling).

### Status Summary

| Check | Result |
|-------|--------|
| Typecheck | ✅ Clean (0 errors) |
| Lint | ✅ Clean (0 warnings/errors) |
| Build (web) | ✅ Successful |
| Tests | ✅ **1,745/1,745 passing** (723 web + 443 API + 579 shared) |
| @ts-ignore/as any | ✅ None in source code |
| TODO/FIXME/HACK | ✅ None in source code |
| Empty catch blocks | ✅ None |
| Format | ✅ All files Prettier-formatted |
| Tracked .patch files | ✅ None found on main |
| Stale merged branches | ✅ None found (all remote branches have unique unmerged commits) |
| BroCula ref drift | ✅ Fixed — Jul 4 Run 2 → Jul 5 Run 2 |
| README BroCula date drift | ✅ Fixed (Jun 17–Jul 4 → Jun 17–Jul 5) |
| BUG-014 (stale doc refs) | 🔴 Still present on main (`docs/bug.md` in main.yml) — `workflows: write` blocker |
| BUG-017 (hardcoded node-version) | 🔴 Still present on main (11 occurrences across 4 workflows) — `workflows: write` blocker |
| npm audit | ⚠️ 17 moderate (BUG-013 — upstream lighthouse→@sentry/node→@opentelemetry/core, same blocker) |
| **Overall** | **✅ All quality checks passing** |

### Actions Taken This Cycle

1. **BroCula ref drift fix**: docs/audits/README.md and knowledge-review.md updated — Jul 4 Run 2 → Jul 5 Run 2 (`brocula-hunt-2026-07-05-run2.md` / LH **98-100-100-100**, **1745 tests** ✅). Added Jul 5 Run 2 as latest entry in Current Reports.
2. **CHANGELOG gap fix**: Added 6 post-Cycle-191 commits (BugFixer Cycle Jul 05, feat(ui) copy error details button, feat(ui) external link keyboard focus, BugFixer ULW Cycle Jul 05, refactor(flexy) hardcoded a11y strings Iteration 96, BroCula audit Jul 5 Run 2) + Cycle 192 entry.
3. **README BroCula date drift fix**: `(Jun 17–Jul 4)` → `(Jun 17–Jul 5)` — matches latest audit.
4. **Quality verification**: typecheck ✅ lint ✅ build ✅ tests 1,745/1,745 ✅ format ✅.
5. **BUG-014/BUG-017 status verified**: Still present on main. Same documented `workflows: write` blocker.
6. **Documentation synced**: Updated findings, active-tasks, knowledge-review, CHANGELOG, README, audits/README for Cycle 192.

### Verification

- [x] Typecheck — 0 errors ✅
- [x] Lint — 0 errors/warnings ✅
- [x] Build — successful ✅
- [x] Tests — 1,745/1,745 passing ✅
- [x] Format — all Prettier-formatted ✅
- [x] No redundant/temp/unused source files — clean ✅
- [x] No tracked .patch files on main ✅
- [x] No stale merged remote branches ✅
- [x] BroCula ref — Jul 5 Run 2 (latest) ✅
- [x] README BroCula date — (Jun 17–Jul 5) ✅
- [x] npm audit — 17 moderate (BUG-013, same documented blocker) ✅
- [x] BUG-014/BUG-017 — verified status (still blocked) ✅

> Older cycles (Cycle 1 through Cycle 191) are preserved in git history. Run `git log -- docs/findings.md` to browse historical entries.
