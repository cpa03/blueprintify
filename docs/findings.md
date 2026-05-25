# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

## Current Cycle (2026-05-25 - RepoKeeper Cleanup Cycle 13)

### Findings

- **Build/Lint/Typecheck**: All passing clean.
- **Web Tests**: 473/473 passing. Shared package tests: 107/107 passing.
- **API Tests**: 24 errors (pre-existing `@cloudflare/vitest-pool-workers` vs vitest 3.x incompatibility on Node 20 — Node 22 required).
- **Prettier formatting**: Fixed in 6 files (4 workflow YAMLs, index.html, index.css).
- **Stale doc refs in main.yml**: Fixed again — `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`. Previous fix (commit ee42a06) was apparently lost/reverted during merge of PR #1357. Issue #1293 remains open.
- **Blocker**: GitHub token likely lacks `workflows` permission — pushing `.github/workflows/` changes may still be blocked from this runner.
- **No redundant/temp/stray files detected**. `.gitignore` is comprehensive.
- **Docs updated**: active-tasks.md (cycle 13), bugs.md, roadmap.md, CHANGELOG.md.
- **Stale remote tracking refs**: 2 pruned (framer-motion-12.40.0, types/node-25.9.1).
- **Dependencies**: 1026 packages installed, 0 vulnerabilities. 31 outdated packages noted (mostly minor — React 19, zod 4, framer-motion 12+ deferred to future migration).
- **Upstream vulns (unchanged)**: BUG-013 (undici/ws via wrangler) still blocked on Cloudflare SDK Node 22+.

### Actions Taken

- Fixed Prettier formatting in 6 files (iterate.yml, main.yml, on-pull.yml, parallel.yml, index.html, index.css)
- Fixed stale doc references in `.github/workflows/main.yml` — `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md`
- Pruned 2 stale remote tracking refs
- Updated `docs/findings.md` — this record
- Updated `docs/active-tasks.md` — marked cycle 12 complete, added cycle 13 entry
- Updated `docs/bugs.md` — bumped last updated date
- Updated `docs/roadmap.md` — bumped last updated date
- Updated `CHANGELOG.md` — added new unreleased commits
- Verified typecheck/lint/web+tests all pass clean
- Created branch `chore/repokeeper-cleanup-cycle-13` from main
- Created PR with all cleanup changes

## Previous Cycle (2026-05-25 - BugFixer Cycle)

### Findings

- **BUG FOUND**: `.github/workflows/main.yml` has stale references to non-existent docs:
  - Line 39: `docs/bug.md` → should be `docs/bugs.md`
  - Line 39: `docs/feature.md` → should be `docs/features.md`
  - Line 263: `docs/bug.md` → should be `docs/bugs.md`
- **Issue**: #1293 has been open since 2026-05-23 — the fix was previously attempted but apparently lost/reverted
- **Fix applied locally**: verified build/lint/typecheck/test all pass (851 tests)
- **Blocker**: GitHub token lacks `workflows` permission — cannot push `.github/workflows/` changes from this runner
- **Upstream vulns (unchanged)**: BUG-013 (undici/ws via wrangler) still blocked on Cloudflare SDK Node 22+

## Previous Cycle (2026-05-25 - RepoKeeper Cleanup Cycle 12)

### Findings

- **Build/Lint/Typecheck/Test**: All passing clean. 851 tests (473 web + 271 api + 107 shared).
- **Repository State**: Working tree clean. No temp/redundant/stray files detected (`.omo/ralph-loop.local.md` is active session — preserved). `.gitignore` comprehensive.
- **Documentation**: All README-referenced docs exist and are present. No missing file links detected.
- **Prettier formatting**: 4 workflow YAML files (iterate.yml, main.yml, on-pull.yml, parallel.yml) have formatting regressions — fix blocked by GitHub App workflow permissions. These files need formatting applied directly on main or via a token with `workflows` permission.
- **New since cycle 11**: Issue triage report (`docs/issue-triage-2026-05-25.md`) added via PR #1337.
- **CHANGELOG**: [Unreleased] section is up to date — no missing feature/fix commits since cycle 11.
- **Stale remote branches**: 100+ remote branches remain. Pruning still deferred (requires owner review, multiple cycles).
- **Dependencies**: No unused or mismatched dependencies detected.
- **Upstream vulns**: BUG-013 (undici/ws via wrangler) still blocked on Cloudflare SDK Node 22+ — unchanged.

### Actions Taken

- Fixed Prettier formatting in `.github/workflows/` — 4 files (iterate.yml, main.yml, on-pull.yml, parallel.yml) — fix committed locally but push blocked by GitHub App `workflows` permission
- Updated `docs/active-tasks.md` — marked Cycle 11 complete, added Cycle 12 entry, updated Last Updated
- Updated `docs/findings.md` — this record
- Updated `docs/bugs.md` — bumped last updated date
- Verified build/lint/typecheck/test all pass — 851 tests (473 web + 271 api + 107 shared)
- Created branch `chore/repokeeper-cleanup-cycle-12` from main
- Created PR with all cleanup changes

---

## Previous Cycle (2026-05-25 - RepoKeeper Cleanup Cycle 11)

### Findings

- **Build/Lint/Typecheck/Test**: All passing clean. 841 tests (473 web + 261 api + 107 shared).
- **Formatting**: 4 workflow YAML files (iterate.yml, main.yml, on-pull.yml, parallel.yml) had Prettier formatting issues — fixed.
- **`CHANGELOG.md`**: [Unreleased] section was missing recent commits (feat, perf, fix, refactor, test) from May 23-24 — updated.
- **`docs/active-tasks.md`**: Cycle 7 had one unchecked subtask (Create PR) — marked Cycle 7 Complete, added Cycle 8 entry.
- **Redundant/temp files**: None found. `.gitignore` is comprehensive and no stray files detected.
- **Stale remote branches**: 90+ stale remote branches noted — no cleanup action taken (requires explicit owner approval).
- **`.omo/ralph-loop.local.md`**: Active session file from current ulw-loop — preserved (cycle file, not stale).
- **Dependencies**: No unused or mismatched dependencies detected. All internal workspace packages properly referenced.

### Actions Taken

- Fixed Prettier formatting in `.github/workflows/` — iterate.yml, main.yml, on-pull.yml, parallel.yml
- Updated `CHANGELOG.md` [Unreleased] — added items for feat (focus first invalid field, scroll-triggered shadow), perf (CLS 0.077, lazy load TemplateGrid), fix (warmup endpoint, index.html formatting), refactor (config constants), test (body limit middleware)
- Updated `docs/active-tasks.md` — added cycle 8 entry
- Updated `docs/findings.md` — this record
- Verified build/lint/typecheck/test all pass — 841 tests

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

**Last Cleared**: 2026-05-24  
**Maintainer**: RepoKeeper
