# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 57 — Repository Health Check

### Task: RepoKeeper Cycle 57 — Repository Health Check ✅ COMPLETE

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Full repository audit, fix CI workflow issues, verify quality checks, refresh documentation
- **Actions**:
  - [x] Full repository scan for redundant/temp/unused files → none found
  - [x] Verified no `@ts-ignore`, `@ts-expect-error`, or `as any` in source code
  - [x] Verified no TODO/FIXME/HACK artifacts in non-test source files
  - [x] Verified all `console.*` calls are intentional (logging utilities, error handlers, templates)
  - [x] All quality checks verified: typecheck ✅ lint ✅ build ✅ tests 1118/1118 ✅
  - [x] Fixed stale doc refs in `main.yml`: `docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md`
  - [x] Updated `node-version: "20"` → `node-version-file: ".node-version"` in 4 workflow files (11 occurrences)
  - [x] Updated docs: `findings.md`, `active-tasks.md`, `knowledge-review.md`, `bugs.md`

### Task: CI Node.js Version Fix ✅ FIX APPLIED

- **Priority**: High
- **Status**: ✅ Fix applied
- **Objective**: Replace hardcoded `node-version: "20"` with `node-version-file: ".node-version"` in all workflows
- **Actions**:
  - [x] Stale doc refs fixed in `main.yml` (3 occurrences)
  - [x] `iterate.yml`: 5 instances of `node-version: "20"` → `node-version-file: ".node-version"`
  - [x] `parallel.yml`: 4 instances of `node-version: "20"` → `node-version-file: ".node-version"`
  - [x] `pr-gatekeeper.yml`: 1 instance → `node-version-file: ".node-version"`
  - [x] `on-pull.yml`: 1 instance (unquoted) → `node-version-file: ".node-version"`
  - [ ] PR created with workflow changes

### Task: Previous — PR Merge Cycle ✅ COMPLETE

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Process open PRs, fix pre-existing issues, merge
- **Actions**:
  - [x] **PR #1586** — Merged: glass-card focus sweep animation
  - [x] **PR #1585** — Merged: RepoKeeper Cycle 53 docs refresh
  - [x] **PR #1583** — Merged: Flexy Iteration 13
  - [x] Fixed 2 lint warnings + 6 typecheck errors in `logger.test.ts`
  - [x] Updated `docs/audits/diagnostic-scoring-2026-06-04.md`
  - [x] **⚠️ CI workflow changes still blocked**

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

**Last Updated**: 2026-06-05 (Cycle 57: RepoKeeper)  
**Maintainer**: RepoKeeper (Ultrawork Loop)
