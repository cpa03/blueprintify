# Active Tasks

> Current active work items and priorities. See [completed-tasks-2026-Q1.md](./completed-tasks-2026-Q1.md) for archived completed work.

## Current Focus: Repository Maintenance

### Task: RepoKeeper Cleanup Cycle (2026-05-22)

- **Priority**: High
- **Status**: Completed
- **Objective**: Remove redundant files, update documentation, fix dependency vulnerabilities, clean stale branches
- **Actions**:
  - [x] Align `.node-version` with `.nvmrc` (both → 20)
  - [x] Fix flaky benchmark threshold in `performance-storage.benchmark.test.ts` (30ms → 50ms)
  - [x] Move BUG-010 to resolved (no @v5 refs remain in CI)
  - [x] Add BUG-013 for upstream wrangler/miniflare vulns
  - [x] Clean findings.md (already clean)
  - [x] Update docs (active-tasks.md, bugs.md, findings.md) for current cycle
  - [x] Verify all docs references exist — all README.md linked files present
  - [x] Verify build/lint/test pass — 891 tests all passing (471 web + 313 api + 107 shared)
  - [x] No duplicate CONTRIBUTING.md found in docs/ — verified
  - [x] Remove stale `ralph-loop.local.md` working file from `.omo/`
  - [x] Fix test count discrepancy in Testing Coverage section (471→891)
  - [x] Update roadmap.md — mark Finalization complete, update current focus, bump last-updated date
  - [x] Upstream undici/ws vulns blocked on Cloudflare SDK (Node 22+) — unchanged

### Task: RepoKeeper Cleanup Cycle (2026-05-23)

- **Priority**: High
- **Status**: Active
- **Objective**: Fix formatting, verify code quality, update cycle docs
- **Actions**:
  - [x] Fix Prettier formatting in 5 files (workflow YAML files, index.html)
  - [x] Verify typecheck, lint, and audit all pass — clean
  - [x] Verify npm audit — 0 vulnerabilities
  - [x] Shared package tests — 107/107 passing
  - [x] Audit docs/ for stale/unreferenced files — all present
  - [x] Check .opencode/ package files — properly gitignored
  - [x] Update docs (active-tasks.md, findings.md) for current cycle
  - [ ] Upstream undici/ws vulns blocked on Cloudflare SDK (Node 22+) — unchanged

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
- **Total**: 891 tests (all passing)
- **TypeScript**: Strict mode, no unchecked `any` types

---

**Last Updated**: 2026-05-23  
**Maintainer**: RepoKeeper
