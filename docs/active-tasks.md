# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 51

### Task: CI Workflow Fixes (Node.js 22 + Stale Doc Refs) ✅ COMPLETE

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Fix `node-version: "20"` → `"22"` in all 4 workflow files (11 instances), fix stale doc refs (`docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md`) in `main.yml`
- **Actions**:
  - [x] Changed `node-version: "20"` → `"22"` in `iterate.yml` (5 instances)
  - [x] Changed `node-version: "20"` → `"22"` in `parallel.yml` (4 instances)
  - [x] Changed `node-version: "20"` → `"22"` in `pr-gatekeeper.yml` (1 instance)
  - [x] Changed `node-version: 20` → `node-version: "22"` in `on-pull.yml` (1 instance)
  - [x] Fixed stale doc refs in `main.yml`: `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`

### Task: RepoKeeper Cycle 49 — Repository Cleanup Audit ✅ COMPLETE

- **Priority**: Medium
- **Status**: Complete
- **Objective**: Full repository audit — redundant/temp/unused files, documentation health, code quality
- **Actions**:
  - [x] Full repository scan for stale files, temp artifacts, empty dirs → none found
  - [x] Check for `@ts-ignore`/`@ts-expect-error`/`as any` suppressions → none found
  - [x] Check for TODO/FIXME/HACK artifacts in source → none found
  - [x] Verify all quality checks: typecheck ✅ lint ✅ format ✅ test:all (1069/1069) ✅
  - [x] Update `docs/findings.md` — Cycle 49 entry
  - [x] Update `docs/active-tasks.md` — clarify workflow status

### Task: RepoKeeper Cycle 50 — Repository Cleanup Audit ✅ COMPLETE

- **Priority**: Medium
- **Status**: Complete
- **Objective**: Full repository audit — redundant/temp/unused files, documentation health, CI workflow status
- **Actions**:
  - [x] Full repository scan for stale files, temp artifacts, empty dirs → none found
  - [x] No type suppressions or TODO/FIXME/HACK artifacts found
  - [x] Verified all quality checks: typecheck ✅ lint ✅ format ✅ test:all (1069/1069) ✅
  - [x] Updated `docs/findings.md` — Cycle 50 entry
  - [x] Updated `docs/active-tasks.md` — reference Cycle 50
  - [x] Updated `README.md` — added missing links for docs/audits/ files

### Task: RepoKeeper Cycle 51 — CI Alignment & Doc Refresh ✅ COMPLETE

- **Priority**: Medium
- **Status**: Complete
- **Objective**: Apply CI workflow fixes (node-version + stale doc refs), update tracking docs
- **Actions**:
  - [x] Applied node-version fixes across all 4 CI workflow files
  - [x] Fixed stale doc references in `main.yml`
  - [x] Updated `docs/findings.md` — Cycle 51 entry
  - [x] Updated `docs/active-tasks.md` — Cycle 51 status
  - [x] Updated `docs/knowledge-review.md` — review date refreshed
  - [x] Created PR `chore/repokeeper-cycle-51`

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

**Last Updated**: 2026-06-03 (Cycle 50: RepoKeeper)
**Maintainer**: RepoKeeper (Ultrawork Loop)
