# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 45

### Task: RepoKeeper Cycle 45 (2026-06-02) — CI Workflow Fixes, Stale File Removal & Doc Sync

- **Priority**: High
- **Status**: Active
- **Objective**: Apply CI workflow fixes (node version, stale doc refs), remove stale root files, sync docs
- **Actions**:
  - [x] Fix `docs/bug.md` → `docs/bugs.md` and `docs/feature.md` → `docs/features.md` in `main.yml` (lines 39, 263)
  - [x] Fix `docs/task.md` → `docs/active-tasks.md` in `main.yml` (lines 41, 67, 115)
  - [x] Update `node-version: "20"` → `"22"` across 4 workflow files (11 instances)
  - [x] Remove `task_plan.md` and `notes.md` (stale security audit artifacts at root)
  - [x] Update README.md — fix docs tree and listing (add missing docs, remove deleted `task.md`)
  - [x] Update `docs/active-tasks.md` — add Cycle 45 entry
  - [x] Update `docs/findings.md` — add Cycle 45 findings
  - [ ] Run full verification: typecheck ✅ lint ✅ build ✅ format ✅ test:all ✅
  - [ ] Create PR with all changes

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

- **Frontend**: Co-located Vitest tests with component and store tests
- **API**: Comprehensive route, middleware, service, and utility tests
- **Shared**: Zod schema, type, and config tests
- **TypeScript**: Strict mode, no unchecked `any` types

---

**Last Updated**: 2026-06-02 (Cycle 44: RepoKeeper)
**Maintainer**: RepoKeeper (Ultrawork Loop)
