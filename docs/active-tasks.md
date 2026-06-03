# Active Tasks

> Current active work items and priorities. Historical completed cycles are preserved in git history — see `git log` for archival reference.

## Current Focus: BugFixer Cycle 47

### Task: BugFixer Cycle 47 (2026-06-03) — CI Node.js 22 Version & Stale Doc References

- **Priority**: High
- **Status**: Active
- **Objective**: Fix remaining `node-version: "20"` in all 4 workflow files, fix stale doc refs (`docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md`) in main.yml
- **Actions**:
  - [x] Fix `.github/workflows/main.yml` — stale `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`
  - [x] Fix `.github/workflows/iterate.yml` — 5× `node-version: "20"` → `"22"`
  - [x] Fix `.github/workflows/parallel.yml` — 4× `node-version: "20"` → `"22"`
  - [x] Fix `.github/workflows/on-pull.yml` — `node-version: 20` → `"22"`
  - [x] Fix `.github/workflows/pr-gatekeeper.yml` — `node-version: "20"` → `"22"`
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
