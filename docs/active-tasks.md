# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: PR Merge Cycle & Code Quality Fixes

### Task: PR Merge Cycle ✅ COMPLETE

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Process open PRs, fix pre-existing issues, merge
- **Actions**:
  - [x] **PR #1586** — Merged: glass-card focus sweep animation (CSS-only, reduced-motion support)
  - [x] **PR #1585** — Merged: RepoKeeper Cycle 53 docs refresh
  - [x] **PR #1583** — Merged: Flexy Iteration 13 (doc/dev vars; CI workflow changes blocked by token)
  - [x] Fixed 2 lint warnings + 6 typecheck errors in `logger.test.ts` (pre-existing on main)
  - [x] Updated `docs/audits/diagnostic-scoring-2026-06-04.md` — Phase 1 scoring update
  - [x] **⚠️ CI workflow changes still blocked** — token lacks `workflows: write` permission

### Task: CI Node.js Version Fix ⏳ BLOCKED

- **Priority**: High
- **Status**: ⏳ Blocked
- **Objective**: Replace hardcoded `node-version: "20"` with `node-version-file: ".node-version"` in all workflows
- **Actions**:
  - [x] Changes applied locally and committed to PR #1583 branch
  - [x] Push rejected — `GITHUB_TOKEN` lacks `workflows` scope
  - [ ] Manual action needed: Push CI workflow changes from a token with `workflows: write` permission

### Task: RepoKeeper Cycle 52 — Repository Audit & Doc Refresh ✅ COMPLETE

- **Priority**: High
- **Status**: ✅ Complete
- **Objective**: Full repository audit, apply CI workflow fixes (locally), update documentation
- **Actions**:
  - [x] Full repository scan for redundant/temp/unused files → none found
  - [x] Removed stale `.omo/ralph-loop.local.md`
  - [x] Applied CI workflow fixes locally (node-version `"20"`→`"22"`, stale doc refs in main.yml)
  - [x] **⚠️ CI workflow fixes BLOCKED** — push rejected: GitHub App token lacks `workflows: write` permission
  - [x] Updated docs: `ci-configuration.md`, `findings.md`, `active-tasks.md`, `knowledge-review.md`
  - [x] Created PR with docs-only changes

### Task: RepoKeeper Cycle 51 — CI Alignment & Doc Refresh ✅ COMPLETE

- **Priority**: Medium
- **Status**: Complete
- **Objective**: Update docs to record Cycle 51 audit
- **Actions**:
  - [x] Updated `docs/findings.md` — Cycle 51 entry
  - [x] Updated `docs/active-tasks.md` — Cycle 51 status
  - [x] Updated `docs/knowledge-review.md` — review date refreshed

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

**Last Updated**: 2026-06-04 (Cycle 53: RepoKeeper)  
**Maintainer**: RepoKeeper (Ultrawork Loop)
