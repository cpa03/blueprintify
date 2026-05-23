# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

## Current Cycle (2026-05-23 - RepoKeeper Cleanup Cycle 3)

### Findings

- **Prettier formatting**: 4 workflow YAML files (.github/workflows/) had formatting issues — fixed.
- **Test count discrepancy**: `active-tasks.md` claimed 891 tests but actual count is 841 (473 web + 261 api + 107 shared) — corrected.
- **Build/Lint/Typecheck**: All passing clean. No warnings or errors.
- **npm audit**: 0 vulnerabilities — clean.
- **Docs audit**: All README.md doc references verified present. 23 doc files on disk, 16 referenced in README — remaining 7 are internal maintenance docs (active-tasks, bugs, findings, completed-tasks, repo-rules, security/, etc.) and correctly excluded.
- **Remote stale branches**: ~95+ remote branches from Jan–May 2026. Cannot delete without workflow permission. PR branches already merged to main.
- **Package freshness**: 24 packages have newer versions available — same as previous cycle, not urgent.

### Actions Taken

- Fixed Prettier formatting in 4 workflow files: iterate.yml, main.yml, on-pull.yml, parallel.yml
- Corrected test count in active-tasks.md: 891 → 841
- Updated bugs.md: bumped last-updated to 2026-05-23
- Updated findings.md — this record
- Verified build/lint/typecheck all pass clean
- All 841 tests pass (473 web + 261 api + 107 shared)

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
