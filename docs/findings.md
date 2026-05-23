# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

## Current Cycle (2026-05-23 - RepoKeeper Cleanup Cycle 4)

### Findings

- **Backup file tracked**: `.opencode/oh-my-openagent.json.bak.*` was untracked but present in working tree — removed and `*.bak` added to `.gitignore`.
- **CI workflow bug on main**: `.github/workflows/main.yml` still references `docs/bug.md` and `docs/feature.md` (should be `docs/bugs.md`, `docs/features.md`) — fixed directly on main.
- **README incomplete**: Missing links to `docs/bugs.md`, `docs/repo-rules.md`, `docs/active-tasks.md` — added.
- **Build/Lint/Typecheck**: All passing clean. No warnings or errors.
- **Tests**: 841 tests all passing (473 web + 261 api + 107 shared).
- **Stale remote branches**: `fix/ci-mainyml-doc-refs-1293` and `test-push-permission` merged into main — candidates for deletion.

### Actions Taken

- Removed untracked backup file `.opencode/oh-my-openagent.json.bak.2026-05-23T20-55-23-405Z`
- Added `*.bak` to `.gitignore` to prevent future backup tracking
- Staged pending `.opencode/oh-my-openagent.json` config changes
- Fixed CI workflow doc refs in `.github/workflows/main.yml` — `docs/bug.md`→`docs/bugs.md`, `docs/feature.md`→`docs/features.md`
- Updated README.md — added links to bugs.md, repo-rules.md, active-tasks.md
- Updated `active-tasks.md` — added Cycle 3 entries
- Updated `findings.md` — this record

---

## Previous Cycle (2026-05-22 - RepoKeeper Cleanup & Security Audit)

### Observations

- **Build/Lint/Test**: All passing. Typecheck clean. Lint clean.
- **`.omo/ralph-loop.local.md`**: Stale working file from prior loop — removed.
- **`docs/roadmap.md`**: Last updated 2026-02-21 — stale M2 finalization status updated.
- **`docs/active-tasks.md`**: Test count discrepancy (471→891) corrected.

### Actions Taken

- Removed stale `ralph-loop.local.md` from `.omo/`
- Fixed test count in `active-tasks.md` (471 → 891)
- Updated `roadmap.md` — Finalization section marked ALL COMPLETED, current focus updated, date bumped
- Updated `active-tasks.md` — marked verified completed items, added this cycle's actions
- Updated `findings.md` — this record
- Verified build/lint/typecheck all pass

---

**Last Cleared**: 2026-05-23  
**Maintainer**: RepoKeeper
