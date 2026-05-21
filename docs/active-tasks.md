# Active Tasks

> Current active work items and priorities. See [completed-tasks-2026-Q1.md](./completed-tasks-2026-Q1.md) for archived completed work.

## Current Focus: Repository Maintenance

### Task: RepoKeeper Cleanup Cycle (2026-05-21)

- **Priority**: High
- **Status**: In Progress
- **Objective**: Remove redundant files, update documentation, fix dependency vulnerabilities, clean stale branches
- **Actions**:
  - [ ] Remove duplicate CONTRIBUTING.md from docs/
  - [ ] Clean accumulated agent findings from docs/findings.md
  - [ ] Consolidate docs/bugs.md - keep only active bugs
  - [ ] Fix dependency vulnerabilities (undici, ws)
  - [ ] Ensure docs match codebase reality

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
- **BUG-010**: GitHub Actions Invalid Versions @v5 → @v4 (Open)

---

## Testing Coverage

- **Frontend**: Co-located Vitest tests with component and store tests
- **API**: Comprehensive route, middleware, service, and utility tests
- **Shared**: Zod schema, type, and config tests
- **Total**: 420+ tests, all passing
- **TypeScript**: Strict mode, no unchecked `any` types

---

**Last Updated**: 2026-05-21  
**Maintainer**: RepoKeeper
