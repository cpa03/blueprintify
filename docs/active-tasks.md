# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: RepoKeeper Cycle 49

### Task: CI Workflow Fixes (Node.js 22 + Stale Doc Refs) — BLOCKED

- **Priority**: High
- **Status**: ⛔ Blocked (requires `workflows: write` permission)
- **Objective**: Fix `node-version: "20"` → `"22"` in all 4 workflow files (11 instances), fix stale doc refs (`docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md`) in `main.yml`
- **Blocked By**: GITHUB_TOKEN lacks `workflows: write` scope in CI runner
- **Workarounds**:
  - Fixes exist in branches: `agent/bugfix-ci-node-22-stale-docs`, `fix/ci-node-22-v3`
  - A maintainer with `workflows: write` scope must apply changes or merge the fix branch
  - Alternative: Apply changes manually via `scripts/fix-ci-workflows.sh`

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

**Last Updated**: 2026-06-03 (Cycle 49: RepoKeeper)
**Maintainer**: RepoKeeper (Ultrawork Loop)
