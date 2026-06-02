# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 46

### Task: RepoKeeper Cycle 46 (2026-06-02) — Doc Sync, Version References & CI Workflow Fixes

- **Priority**: High
- **Status**: Active
- **Objective**: Fix stale version references in README, update doc tree listing, sync tracking docs
- **Actions**:
  - [x] Fix `apps/web/README.md` — stale "Vite 7" → "Vite 8" (matches package.json `^8.0.16`)
  - [x] Fix `README.md` doc tree — add 4 missing entries (`audits/brocula-hunt-*` x3, `fixes/ci-workflow-fixes-*`)
  - [x] Update `docs/active-tasks.md` — Cycle 45 → Cycle 46
  - [x] Update `docs/findings.md` — add Cycle 46 entry
  - [ ] Run full verification: typecheck ✅ lint ✅ build ✅ test:all ✅
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

**Last Updated**: 2026-06-02 (Cycle 46: RepoKeeper)
**Maintainer**: RepoKeeper (Ultrawork Loop)
