# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 39

### Task: RepoKeeper Cycle 39 (2026-05-31) — CI Fixes & Doc Sync

- **Priority**: High
- **Status**: Active
- **Objective**: Fix CI workflow node-version, stale doc references in main.yml, remove temp files, update docs
- **Actions**:
  - [x] Fix `main.yml` stale doc references: `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`
  - [x] Fix `node-version: "20"` → `"22"` in all CI workflow files (10 instances across 3 files)
  - [x] Remove stale `.omo/ralph-loop.local.md` (leftover loop tracker)
  - [x] Create missing `docs/knowledge-review.md`
  - [x] Update `docs/bugs.md` — verify BUG-014 fix actually applied
  - [x] Update `docs/findings.md` — add Cycle 39 findings
  - [ ] Run full verification: typecheck ✅ lint ✅ build ✅
  - [ ] Create PR `chore/repokeeper-cycle-39`

---

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

---

## Testing Coverage

- **Frontend**: Co-located Vitest tests with component and store tests — 558 passing
- **API**: Comprehensive route, middleware, service, and utility tests — 299 passing
- **Shared**: Zod schema, type, and config tests — 120 passing
- **Total**: 977 tests (all passing) [558 web + 299 api + 120 shared]
- **TypeScript**: Strict mode, no unchecked `any` types

---

**Last Updated**: 2026-05-31 (Cycle 37: RepoKeeper Type Fixes & Doc Cleanup)  
**Maintainer**: RepoKeeper
