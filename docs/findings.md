# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

## Current Cycle (2026-05-24 - Combined Cleanup Cycle 8)

### Findings

- **Build/Lint/Typecheck/Test**: All passing clean. 851 tests (473 web + 271 api + 107 shared). API tests increased from 261→271 since cycle 7.
- **Formatting**: 4 workflow YAML files (iterate.yml, main.yml, on-pull.yml, parallel.yml) had Prettier formatting issues — fixed.
- **`CHANGELOG.md`**: [Unreleased] section updated with recent commits.
- **`docs/bugs.md`**: Test count stale (841→851), date stale — fixed.
- **`docs/active-tasks.md`**: Corrected test counts, added Cycle 8 entry.
- **Redundant/temp files**: None found. `.gitignore` is comprehensive and no stray files detected.
- **Stale branches**: None to clean — all merged branches already cleaned in cycle 7.
- **Dependencies**: No unused or mismatched dependencies detected.
- **Upstream vulns**: BUG-013 (undici/ws via wrangler) still blocked on Cloudflare SDK Node 22+ — unchanged.

### Actions Taken

- Fixed Prettier formatting in `.github/workflows/` — iterate.yml, main.yml, on-pull.yml, parallel.yml
- Updated `CHANGELOG.md` [Unreleased] — added items for feat, perf, fix, refactor, test
- Updated `docs/bugs.md` — corrected test count to 851, bumped date
- Updated `docs/active-tasks.md` — corrected test counts, added Cycle 8 entry
- Updated `docs/findings.md` — this record
- Verified build/lint/typecheck/test all pass — 851 tests (473 web + 271 api + 107 shared)
- Clean merged branches after PR merge

---

## Previous Cycle (2026-05-24 - RepoKeeper Cleanup Cycle 7)

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
