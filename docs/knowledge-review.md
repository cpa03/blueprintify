# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:
- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State (Oct 2026)

**Last Review**: 2026-10-27 (RepoKeeper Cycle 29: hygiene + doc-sync on `origin/main` `82891afa`; live `Status` line tests 2,973 → **2,975** (+2 web from #3916/#3921/#3924); `DOC-004` CHANGELOG line count re-counted → **1,066**; `docs/bugs.md` header tests + dates synced. Prior: 2026-10-26 (RepoKeeper Cycle 28: hygiene + doc-sync on `origin/main` `954f8571`; **root-cause fix** — `scripts/scan-secrets.mjs` now excludes gitignored `.omo/` agent-runtime state (was walked → count varied 356↔361 with local session files, the cause of same-day 356/357/359 drift); live `Status` line `scan:secrets 357 files` → **356 files** (stable in every environment, verified ×2); `DOC-004` CHANGELOG line count re-counted → 1,064; `docs/bugs.md` footer synced same cycle. Prior: BugFixer Cycle 27 (fatal-gate re-verification on `f44ee4d7`; live `Status` line tests 2,964 → 2,970; `docs/bugs.md` full-audit 8 → **4 (0 mod/4 high)** + eslint `10.12.0` → **`10.13.0`**) · RepoKeeper Cycle 27: root `bug.md` + `task.md` stubs deleted; `Status` tests 2,964 → 2,970 (+6 web from #3910 + #3915). Prior review: BugFixer Cycle 26, 2026-10-26, on `f65ffbd2` — `Status` **3 stale fields fixed** — tests 2,958 → 2,964, scan:secrets 354 → 356, `DOC-004` 1,056 → 1,058; cycle-25's `test:coverage` `ERR_MODULE_NOT_FOUND` verified **RESOLVED** (PR #3900 merged `169c9f34`). Earlier: BugFixer Cycle 25 on `a0696ecd` — `Status` in sync, `DOC-004` 1,055 → 1,056; BugFixer Cycle 24 on `bbd17809` — 3 stale current-state numbers fixed (tests 2,942 → 2,953, scan:secrets 352 → 354, `DOC-004` 1,053 → 1,054) after #3894)  
**Status**: ✅ All quality gates clean (typecheck ✅ lint ✅ 0/0 (`--max-warnings=0`) ✅ prettier ✅ build ✅ build:api ✅ tests 2,975/2,975 ✅ test:coverage ✅ audit prod 0 vulns ✅ scan:secrets 356 files ✅ validate:wrangler ✅ validate:models 56 agent files ✅)

### Known Documentation Drift (Resolved)

All previously tracked drift items resolved in the Sep 2026 consolidation pass:

| Area | Previous Drift | Resolution |
|------|----------------|------------|
| **AJV Security Assessment** (`docs/security/assessment-ajv-vulnerabilities.md`) | Claimed 9 vulnerabilities in `ajv@6.12.6` | Updated to `ajv@6.15.0`; 0 vulnerabilities per `npm audit` |
| **Cloudflare Infrastructure** (`docs/cloudflare-infrastructure.md`) | Claimed "⚠️ Placeholder IDs present" | Real resource IDs provisioned; `validate:wrangler` clean |
| **API Base URL** (`docs/api-documentation.md`) | Placeholder `blueprintify-api.your-domain.workers.dev` | Updated to actual worker URL |
| **Environment Variables** (`docs/api-documentation.md`) | Partial table (3 vars) duplicating `environment-variables.md` | Replaced with reference to canonical `environment-variables.md` |
| **CI Permissions** (`docs/ci-configuration.md`) | Claimed `issues: write` absent in all workflows | Verified: `pr-gatekeeper.yml`, `main.yml`, `parallel.yml`, `iterate.yml` have `issues: write`; only `on-pull.yml` lacks it |
| **CI Security Gates** (`docs/ci-configuration.md`) | Stale Aug 2026 test counts and status | Updated to current verification commands |
| **Broken Links** | 2 links to purged `issue-audit-report-2026-07-15.md` | Backtick-wrapped in historical log entries |

### Active Documentation Gaps

| ID | Area | Gap Description | Priority |
|----|------|-----------------|----------|
| **DOC-001** | CI Workflows | `on-pull.yml` still lacks `issues: write`; blocks Issue Manager automation | Medium |
| **DOC-002** | CI Workflows | All 5 workflows lack `workflows: write`; blocks self-healing gatekeeper workflows | Medium |
| **DOC-003** | API Docs | `docs/api-documentation.md` endpoint list verified sync: 14 paths / 15 operations (was tracked as incomplete vs. stale "32 endpoints" claim) | Low |
| **DOC-004** | CHANGELOG | 1,066 lines of cycle logs; consider moving to archive | Low |

---

## Historical Context

> Over 600 ULW orchestration cycles and 110+ BugFixer cycles have been executed since 2026-02-18.
> Individual cycle logs and daily audit records are preserved in [`findings.md`](./findings.md) and `git log -- docs/knowledge-review.md`.

## Process

1. **Pre-merge**: Knowledge Steward reviews changed files for documentation implications
2. **Post-merge**: Knowledge Review updated with any new drift detected
3. **Consolidation**: Periodic review to collapse redundant cycle logs into living summaries

---

**Last Updated**: 2026-10-27 — RepoKeeper Cycle 29 hygiene + doc-sync (**0 files deleted** — hygiene re-verified clean; live `Status` tests 2,973 → **2,975/2,975** (+2 web from #3916/#3921/#3924); `docs/bugs.md` header tests + verification dates synced; `DOC-004` 1,064 → **1,066** (post-entry); all fatal gates green incl. tests **2,975/2,975** + test:coverage exit 0; companion `docs/bugs.md` footer synced) + prior RepoKeeper Cycle 28 (2026-10-26, `954f8571`) hygiene + doc-sync (**0 files deleted** — hygiene clean; **root-cause fix**: `scripts/scan-secrets.mjs` excludes gitignored `.omo/` runtime state, stabilizing the reported count at **356** — was 361-with-5-sessions vs 356 clean, causing recurring live-status drift; `Status` `scan:secrets 357` → **356**; `DOC-004` 1,062 → **1,064** post-entry; companion `docs/bugs.md` footer synced; all fatal gates green incl. tests **2,973/2,973** + test:coverage exit 0) + prior RepoKeeper Cycle 27 (root `bug.md`/`task.md` stubs deleted, `Status` tests → 2,970) + BugFixer Cycle 27 (all gates green, `Status` tests → 2,970, `DOC-004` → 1,059, `docs/bugs.md` sync: header tests, eslint 10.13.0, full-audit 4 high) — prior BugFixer Cycle 26 + 25 entries retained  
**Maintainer**: Documentation Specialist
