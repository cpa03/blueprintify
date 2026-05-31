# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 37

### Task: PR Handler Cycle 36 (2026-05-31) — Process 5 Open PRs ✅ COMPLETE

- **Priority**: High
- **Status**: Complete
- **Objective**: Process all 5 open PRs — rebase/verify/merge
- **Actions**:
  - [x] PR #1490: BroCula Hunt perf — Merged ✅
  - [x] PR #1489: animate-glow CTA buttons — Merged ✅
  - [x] PR #1488: fix QUOTA_BYTES return — Merged ✅
  - [x] PR #1487: duplicate of #1488 — Closed as duplicate ✅
  - [x] PR #1486: RBAC authorization — Merged ✅ (closes #1078)

### Task: RepoKeeper Cycle 35 (2026-05-31) — Type Fix & Audit

- **Priority**: High
- **Status**: Complete
- **Objective**: Fix empty QUOTA_BYTES getter causing type errors, audit repo for redundant/unused files, verify documentation
- **Actions**:
  - [x] Fix `apps/api/src/config/constants.ts` — empty `QUOTA_BYTES(): number {}` getter
  - [x] Run full verification: typecheck ✅ lint ✅ build ✅ test:all (977) ✅
  - [x] Audit repo — no redundant/temp/unused files found
  - [x] Create PR `chore/repokeeper-cycle-35` from main

### Task: RepoKeeper Cycle 37 (2026-05-31) — Type Fixes & Doc Cleanup

- **Priority**: High
- **Status**: Active
- **Objective**: Fix typecheck errors, fix stale doc references in main.yml, update docs
- **Actions**:
  - [x] Fix `apps/api/src/middleware/authorize.ts` — cast `c.get("user")` as `User | undefined`
  - [x] Fix `apps/api/src/routes/share.test.ts` — add `AppVariables` to Hono generics
  - [x] Fix `main.yml` — `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`
  - [x] Update `docs/bugs.md` — mark BUG-014 as resolved
  - [x] Update `docs/findings.md` — add Cycle 37 findings
  - [ ] Run full verification: typecheck ✅ lint ✅ build ✅ test:all ✅
  - [ ] Create PR `chore/repokeeper-cycle-37`

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
