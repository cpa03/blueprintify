# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 44

### Task: RepoKeeper Cycle 44 (2026-06-02) — CI Workflow Cleanup & Stale File Removal

- **Priority**: High
- **Status**: Active
- **Objective**: Fix stale CI workflow references, remove redundant docs, clean repo
- **Actions**:
  - [x] Fix `docs/bug.md` → `docs/bugs.md` and `docs/feature.md` → `docs/features.md` in `main.yml`
  - [x] Fix `docs/task.md` → `docs/active-tasks.md` in `main.yml` orchestrator prompt
  - [x] Update `node-version: "20"` → `"22"` across 4 workflow files (11 instances)
  - [x] Remove `docs/task.md` (stub file, all tasks completed)
  - [x] Remove `docs/plans/2026-06-01-flexy-iteration-10.md` (plan already executed)
  - [x] Remove `.omo/ralph-loop.local.md` (gitignored leftover)
  - [x] Condense `docs/findings.md` — keep only current cycle
  - [x] Update `docs/active-tasks.md` — add Cycle 44 entry
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
