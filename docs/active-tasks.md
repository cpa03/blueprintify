# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## ✅ RepoKeeper Cycle 201 — **Missing dependency fix, active-tasks.md trim, doc refresh, quality verification** ✅

### Task: Full repository audit, add missing `playwright`/`playwright-core` devDependencies to root `package.json` (used by `scripts/brocula-console-check.mjs` and `scripts/brocula-console-hunt.mjs` but only available as transitive deps via `@playwright/test`), trim bloated `docs/active-tasks.md` (2,353→33 lines — archived cycles older than Cycle 200 to git history, consistent with findings.md Cycle 193 precedent), doc refresh (findings, active-tasks, knowledge-review, CHANGELOG), quality verification (typecheck ✅ lint ✅ tests **1,766/1,766** ✅ — 744 web + 443 API + 579 shared), BUG-014/BUG-017 status verified (still present on main — `workflows: write` blocker), npm audit (17 moderate — BUG-013 upstream tooling)

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Cycle 201 full repository audit — add missing explicit playwright deps, trim active-tasks.md, sync docs (findings, active-tasks, knowledge-review, CHANGELOG), verify quality, create PR
- **Actions**:
  - [x] Full repository scan — no redundant/temp/unused source files found
  - [x] Verified no `@ts-ignore`, `@ts-expect-error`, or `as any` in source code
  - [x] Verified no TODO/FIXME/HACK in non-test source code
  - [x] **Missing playwright deps added**: `playwright@1.61.1` and `playwright-core@1.61.1` added to root `devDependencies` (used by brocula scripts, only transitive before)
  - [x] **active-tasks.md trimmed**: Reduced from 2,353 lines to ~33 lines — archived cycles older than Cycle 200 to git history
  - [x] **Format**: All files Prettier-formatted ✅
  - [x] **knowledge-review.md updated**: Last Review → Cycle 201, BroCula ref → Jul 6 Run 2
  - [x] **findings.md updated**: Cycle 201 entry added
  - [x] **active-tasks.md updated**: Cycle 201 entry added at top
  - [x] **CHANGELOG.md updated**: Cycle 201 entry added
  - [x] **BUG-014/BUG-017 status verified**: Still present on main. Same documented `workflows: write` blocker.
  - [x] **npm audit**: 17 moderate (BUG-013 — upstream tooling, same documented blocker)
  - [x] All quality checks verified: typecheck ✅ lint ✅ tests 1,766/1,766 ✅

> Older cycles (Cycle 1 through Cycle 200) are preserved in git history. Run `git log -- docs/active-tasks.md` to browse historical entries.

## Milestone Status

### M1 Foundation & Core Loop ✅ COMPLETE

- All critical path tasks complete
- End-to-end user flow working
- All tests passing
- Documentation updated

### M2 Feature Release ✅ COMPLETE

- LocalStorage persistence
- Split-pane editor workflow
- Export/import system
- Refinement engine
- Migration strategy

### M3 Distribution & Collaboration ⏸️ DEFERRED

ZIP download, share functionality, and template library features are deferred until future planning determines priority.

---

## Active Bug Tracking

See [bugs.md](./bugs.md) for detailed bug information.

- **BUG-001**: Frontend Bundle Size Performance Issue (In Progress)
- **BUG-008**: ajv Package Security Vulnerabilities (Open)
- **BUG-013**: Upstream npm Vulns (undici/ws via wrangler) (Blocked - Node 22+)
- **BUG-014**: Stale Doc References in main.yml (Reopened — still present on main, push blocked)

---

## Testing Coverage

- **Frontend**: Co-located Vitest tests with component and store tests
- **API**: Comprehensive route, middleware, service, and utility tests
- **Shared**: Zod schema, type, and config tests
- **TypeScript**: Strict mode, no unchecked `any` types

---

**Last Updated**: 2026-07-06 (RepoKeeper Cycle 201)  
**Maintainer**: RepoKeeper (Ultrawork Loop)
