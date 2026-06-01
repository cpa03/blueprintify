# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 43

### Task: RepoKeeper Cycle 43 (2026-06-01) — CI Workflow Cleanup & Node Version Alignment

- **Priority**: High
- **Status**: Active
- **Objective**: Fix stale doc references in CI workflows, align Node.js version with `.nvmrc` (22)
- **Actions**:
  - [x] Fix `docs/bug.md` → `docs/bugs.md` and `docs/feature.md` → `docs/features.md` in `main.yml`
  - [x] Update `node-version: "20"` → `"22"` across 4 workflow files (11 instances)
  - [x] Update `docs/findings.md` — add Cycle 43 findings
  - [x] Run full verification: typecheck ✅ lint ✅ build ✅ format ✅ test:all ✅
  - [ ] **BLOCKED**: Push workflow file changes (needs `workflows: write` permission on GITHUB_TOKEN)

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

**Last Updated**: 2026-06-01 (Cycle 42: RepoKeeper — Stale Tracked Artifacts Cleanup)  
**Maintainer**: RepoKeeper
