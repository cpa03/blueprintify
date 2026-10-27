# Knowledge Review

> **Document drift tracking** — records inconsistencies between documentation and actual codebase state after each merge cycle.

## Purpose

This file is referenced by the Knowledge Steward step in `.github/workflows/main.yml`. It tracks:
- Inconsistencies between docs and code
- Documentation gaps discovered during PR review
- Recommendations for bringing docs in sync with actual code

## Current State (Oct 2026)

**Last Review**: 2026-10-26 (BugFixer Cycle 27: fatal-gate re-verification on `origin/main` `f44ee4d7`; live `Status` line **1 stale field fixed** — tests 2,964 → 2,970; `DOC-004` CHANGELOG line count re-counted → 1,059; `docs/bugs.md` also re-synced same cycle — full-audit 8 (4 mod/4 high) → **4 (0 mod/4 high)** + toolchain-drift/BUG-048 rows `eslint@10.12.0` → **`eslint@10.13.0`** (installed per root `package.json`; peer-drift status unchanged, lint 0/0) · RepoKeeper Cycle 27: hygiene + doc-sync on `origin/main` `f44ee4d7`; root `bug.md` + `task.md` stubs deleted; live `Status` line tests 2,964 → 2,970 (+6 web from #3910 a11y chip padding + #3915 export-button a11y); `DOC-004` re-verified 1,058. Prior review: BugFixer Cycle 26, 2026-10-26, on `f65ffbd2` — live `Status` line **3 stale fields fixed** — tests 2,958 → 2,964 (+6 web from #3906), scan:secrets 354 → 356 files, `DOC-004` 1,056 → 1,058 (this cycle's entry; janitor #3907's entry also un-counted); cycle-25's tracked live defect `npm run test:coverage` verified **RESOLVED** (PR #3900 merged `169c9f34`, exit 0 live). Prior review: BugFixer Cycle 25, 2026-10-25, on `a0696ecd` — `Status` line re-verified already in sync, `DOC-004` 1,055 → 1,056, 1 live defect found (`test:coverage` `ERR_MODULE_NOT_FOUND` — fix already open as PR #3900, not duplicated). Earlier: BugFixer Cycle 24, 2026-10-25, on `bbd17809` — 3 stale current-state numbers fixed (tests 2,942 → 2,953, scan:secrets 352 → 354, `DOC-004` 1,053 → 1,054) after #3894 added `useHashScroll.test.ts`)  
**Status**: ✅ All quality gates clean (typecheck ✅ lint ✅ 0/0 (`--max-warnings=0`) ✅ prettier ✅ build ✅ build:api ✅ tests 2,973/2,973 ✅ test:coverage ✅ audit prod 0 vulns ✅ scan:secrets 357 files ✅ validate:wrangler ✅ validate:models 56 agent files ✅)

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
| **DOC-004** | CHANGELOG | 1,062 lines of cycle logs; consider moving to archive | Low |

---

## Historical Context

> Over 600 ULW orchestration cycles and 110+ BugFixer cycles have been executed since 2026-02-18.
> Individual cycle logs and daily audit records are preserved in [`findings.md`](./findings.md) and `git log -- docs/knowledge-review.md`.

## Process

1. **Pre-merge**: Knowledge Steward reviews changed files for documentation implications
2. **Post-merge**: Knowledge Review updated with any new drift detected
3. **Consolidation**: Periodic review to collapse redundant cycle logs into living summaries

---

**Last Updated**: 2026-10-26 — RepoKeeper Cycle 27 hygiene + doc-sync (root `bug.md`/`task.md` stubs deleted, all gates green, `Status` tests 2,964 → 2,970) + BugFixer Cycle 27 fatal-gate re-verification (all gates green, `Status` 1 stale field fixed (2,964 → 2,970), `DOC-004` 1,058 → 1,059, companion `docs/bugs.md` sync: header tests, eslint 10.13.0, full-audit 4 high) — re-synced post-merge of #3920 (janitor): tests **2,973/2,973** (web 1,389 + api 555 + shared 1,029), scan:secrets 357 files; prior BugFixer Cycle 26 + BugFixer Cycle 25 entries retained  
**Maintainer**: Documentation Specialist
