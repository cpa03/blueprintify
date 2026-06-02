# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 46

### Task: RepoKeeper Cycle 46 (2026-06-02) — Stale Branches, CI Workflow Fixes & Docs Cleanup

- **Priority**: High
- **Status**: Active
- **Objective**: Delete stale merged branches, apply remaining CI workflow fixes, remove stale docs, update tracking docs
- **Actions**:
  - [x] Delete 9 stale merged remote branches
  - [x] Fix `main.yml` stale doc references: `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`, `docs/task.md` → `docs/active-tasks.md`
  - [x] Update `node-version: "20"` → `"22"` in `iterate.yml`, `parallel.yml`, `pr-gatekeeper.yml`
  - [x] Remove stale `docs/fixes/ci-workflow-fixes-2026-05-31.md` reference doc (fixes now applied)
  - [x] Update `docs/active-tasks.md` — add Cycle 46 entry
  - [x] Update `docs/findings.md` — add Cycle 46 findings
  - [x] Run full verification: typecheck ✅ lint ✅ build ✅ format ✅ test:all ✅
  - [x] Create PR with all changes

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
