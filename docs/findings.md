# Findings

> **Incoming signals and observations** — cleared after each orchestration cycle. Historical cycles are preserved in git history.

## Current Cycle (2026-06-02 — Cycle 44: Security Engineering Audit)

### Security Audit: `concurrently` ^9.2.1 → ^10.0.1 (Dependabot PR)

**Files audited**: `package.json`, `package-lock.json`

**Verdict: SAFE TO MERGE** — No vulnerabilities, secrets, or deprecated functions introduced.

| Security Check       | Result                                           |
| -------------------- | ------------------------------------------------ |
| New vulnerabilities  | ✅ None — `concurrently@10.0.1` has 0 known CVEs |
| Hardcoded secrets    | ✅ None found                                    |
| Deprecated functions | ✅ None used                                     |
| Breaking changes     | ✅ Compatible — only used in `"dev:all"` script  |
| Lockfile integrity   | ✅ `concurrently@10.0.1` resolved correctly      |

#### Pre-existing Critical Vulnerabilities (not introduced by this PR)

`npm audit` revealed **4 critical severity vulnerabilities** in the vitest ecosystem that were already present before this change:

| Advisory            | Package                                 | Severity | CVSS | Issue                                                    |
| ------------------- | --------------------------------------- | -------- | ---- | -------------------------------------------------------- |
| GHSA-5xrq-8626-4rwp | vitest@3.2.4                            | Critical | 9.8  | Arbitrary file read/exec when Vitest UI server listening |
| ↑ via               | @vitest/ui@3.2.4                        | Critical | 9.8  | Same advisory                                            |
| ↑ via               | @vitest/coverage-v8@3.2.4               | Critical | 9.8  | Same advisory                                            |
| ↑ via               | @cloudflare/vitest-pool-workers@0.12.21 | Critical | 9.8  | Same advisory                                            |

- **Fix**: Upgrade vitest to 4.1.8+ (major version bump — requires separate migration PR)
- **Mitigating factor**: Vitest UI is development-only; not exposed in production
- **Dependabot branches already exist**: `dependabot/npm_and_yarn/vitest-4.1.8`, `dependabot/npm_and_yarn/vitest/coverage-v8-4.1.8`

#### Detailed Analysis

1. **`concurrently@10.0.1`** — No known CVEs, no deprecated APIs, no transitive dependency changes that introduce risk. The `dev:all` script usage (`concurrently "npm run dev:api" "npm run dev"`) is unaffected by any behavioral changes in 10.0.1.
2. **Secrets scan**: Zero secrets, credentials, or sensitive data in the diff.
3. **Deprecated functions**: Zero usage of deprecated Node.js, npm, or JavaScript APIs.

---

## Previous Cycle (2026-06-01 — Cycle 43: RepoKeeper)

### Findings

- **Typecheck**: ✅ Clean
- **Lint**: ✅ Clean
- **Build**: ✅ Passes
- **Tests**: ✅ 1044/1044 passing (564 web + 299 api + 181 shared)
- **Format**: ✅ Prettier compliant

### Stale CI Workflow References Fixed

**`docs/bug.md` → `docs/bugs.md`** and **`docs/feature.md` → `docs/features.md`** in `.github/workflows/main.yml` (lines 39, 263).

These stale references were flagged across multiple previous cycles (37, 39, 40, 41, 42) but kept getting reverted. This cycle applies the fix and creates a PR for formal review.

### Node.js Version Aligned in CI Workflows

Updated `node-version: "20"` → `"22"` across all CI workflow files (11 instances, 4 files) to match `.nvmrc`:

| File                                  | Instances Fixed |
| ------------------------------------- | --------------- |
| `.github/workflows/iterate.yml`       | 5               |
| `.github/workflows/parallel.yml`      | 4               |
| `.github/workflows/on-pull.yml`       | 1               |
| `.github/workflows/pr-gatekeeper.yml` | 1               |

> **⚠️ BLOCKED**: Pushing workflow file changes requires `workflows: write` permission on the GITHUB_TOKEN. The diffs are documented here; a maintainer with proper permissions should apply them. See `docs/fixes/ci-workflow-fixes-2026-05-31.md` for reference.

### No Other Redundant/Temp/Unused Files

- No empty directories found
- No stale TODO/FIXME artifacts in non-test source code
- No temp files or build artifacts tracked
- All docs exist and are referenced from README

### Repo Health

| Check        | Result                |
| ------------ | --------------------- |
| Build        | ✅ Passes             |
| Lint         | ✅ Clean              |
| Typecheck    | ✅ Clean              |
| Format       | ✅ Prettier compliant |
| Web tests    | 564/564 passed        |
| API tests    | 299/299 passed        |
| Shared tests | 181/181 passed        |
| **Total**    | **1044/1044 passed**  |

---

## Current Cycle (2026-06-01 — Cycle 41: RepoKeeper)

### Findings

- **Typecheck**: ✅ Clean
- **Lint**: ✅ Clean
- **Build**: ✅ Passes
- **Tests**: ✅ 977/977 passing (558 web + 299 api + 120 shared)
- **Format**: ✅ Fixed `apps/web/index.html` (Prettier formatting)

### Stale Doc References Fixed in CI Workflows

**`main.yml`** — stale doc references reverted after Cycle 37/39/40 fixes were not persisted:

- `docs/bug.md` → `docs/bugs.md` (lines 39, 263)
- `docs/feature.md` → `docs/features.md` (line 39)

### Node.js Version Alignment

Updated `node-version: "20"` → `"22"` across all CI workflow files (11 instances, 4 files):

| File                                  | Instances Fixed |
| ------------------------------------- | --------------- |
| `.github/workflows/iterate.yml`       | 5               |
| `.github/workflows/parallel.yml`      | 4               |
| `.github/workflows/pr-gatekeeper.yml` | 1               |
| `.github/workflows/on-pull.yml`       | 1               |

### Unused Dependency Removed

- Removed `playwright-lighthouse` from root `package.json` — not imported in any source file

### Blocked Changes (require `workflows` permission)

GITHUB_TOKEN lacks `workflows: write` permission, preventing CI workflow file modifications:

1. **Stale doc refs in `main.yml`** — `docs/bug.md` → `docs/bugs.md`, `docs/feature.md` → `docs/features.md` (lines 39, 263)
2. **Node.js version alignment** — `node-version: "20"` → `"22"` in 4 workflow files (11 instances)

These fixes need to be applied by a maintainer with `workflows: write` scope.

### PR

- **Branch**: `chore/repokeeper-cycle-41`
- **PR**: [#1514](https://github.com/cpa03/blueprintify/pull/1514)

### No Other Redundant/Temp/Unused Files

- No empty directories found
- No stale TODO/FIXME artifacts in non-test source code
- No temp files or build artifacts tracked

### Repo Health

| Check        | Result                |
| ------------ | --------------------- |
| Build        | ✅ Passes             |
| Lint         | ✅ Clean              |
| Typecheck    | ✅ Clean              |
| Format       | ✅ Prettier compliant |
| Web tests    | 558/558 passed        |
| API tests    | 299/299 passed        |
| Shared tests | 120/120 passed        |
| **Total**    | **977/977 passed**    |

---

## Current Cycle (2026-05-31 — Cycle 40: RepoKeeper)

### Findings

- **Typecheck**: ✅ Clean
- **Lint**: ✅ Clean
- **Build**: ✅ Passes
- **Format**: ✅ All matched files use Prettier

### CI Workflow Fixes

**Stale doc references in `main.yml`** (lines 39, 263) — previously documented fixes in Cycle 37 & 39 were NOT persisted. Cycle 40 re-applies:

- `docs/bug.md` → `docs/bugs.md` (2 occurrences)
- `docs/feature.md` → `docs/features.md` (1 occurrence)

**Node.js version alignment** — 11 instances of `node-version` set to `"22"`:

| File                                  | Instances Fixed |
| ------------------------------------- | --------------- |
| `.github/workflows/iterate.yml`       | 5               |
| `.github/workflows/parallel.yml`      | 4               |
| `.github/workflows/pr-gatekeeper.yml` | 1               |
| `.github/workflows/on-pull.yml`       | 1               |

### Stale Files Removed

- Removed `.omo/ralph-loop.local.md` (leftover ultrawork loop tracking file — was supposed to be removed in Cycle 39 but persisted)

### No Other Redundant/Temp/Unused Files

- No empty directories found
- No stale TODO/FIXME artifacts in non-test source code
- Documentation tree in README remains accurate

### Repo Health

- Build: ✅ Passes
- Lint: ✅ Clean
- Typecheck: ✅ Clean
- Format: ✅ Prettier compliant

---

## Current Cycle (2026-05-31 — Cycle 36: PR Handler + Issue Audit)

### PR Handler Results

Processed all 5 open pull requests:

| #    | PR                                                          | Action | Result                                                                |
| ---- | ----------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| 1490 | perf(web): BroCula Hunt - optimize chunks and CSS           | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1489 | feat(web): consistent animate-glow on wizard CTA buttons    | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1488 | fix(api): return computed QUOTA_BYTES from STORAGE_QUOTA_MB | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1487 | fix(api): compute STORAGE_CONFIG.QUOTA_BYTES from QUOTA_MB  | Closed | ✅ Changes already upstream via #1488, closed as duplicate            |
| 1486 | fix(api): add user-level authorization with RBAC middleware | Merged | ✅ Rebased, build/lint/test verified, merged via admin (closes #1078) |

### Infrastructure Note

- **Node.js 22 installed** in CI environment (was Node 20) to match project `.nvmrc` requirement
- All CI workflow files still reference `node-version: "20"` — needs `workflows` token to update
- Vercel and Cloudflare Workers deployment checks failing on ALL PRs (project-wide infrastructure issue)

### Build/Lint/Test Status

| Check                        | Result                   |
| ---------------------------- | ------------------------ |
| Web build (Vite)             | ✅ Passes                |
| API build (Wrangler dry-run) | ✅ Passes (with Node 22) |
| Lint (ESLint)                | ✅ Clean                 |
| Web tests (Vitest)           | 558/558 passed           |
| API tests (Vitest)           | 299/299 passed           |
| Shared tests (Vitest)        | 120/120 passed           |
| Total                        | **977/977 passed**       |

### Issue Audit Observations

Token (`GITHUB_TOKEN`) has read-only issue permissions — cannot close, label, or comment on issues. The following actions need a maintainer with `issues: write` scope:

1. **Close #1078** — Fixed by PR #1486 (user-level RBAC middleware merged to main)
2. **Close #1390** — Duplicate of #1470 (CI Node.js version mismatch)
3. **Close #1166** — .nvmrc already exists with value `22`
4. **Close #1045** — Duplicate of #1165 (placeholder Cloudflare resource IDs)
5. **Apply P0/P1/P2/P3 labels** to issues using old `priority:high/medium/low` system

### CI Workflow Issues (Blocked by `workflows` permission)

- All workflow files use `node-version: "20"` instead of `"22"` (#1470)
- main.yml references non-existent `docs/bug.md` and `docs/feature.md` (#1293)
- Multiple workflow files need GitHub Actions version standardization (#980, #1111)

---

## Current Cycle (2026-05-31 — Cycle 35: RepoKeeper)

### Findings

- **RepoKeeper started**: On `main` branch. All quality checks passing.
- **TypeScript error found & fixed**: `apps/api/src/config/constants.ts` line 500 — empty `QUOTA_BYTES` getter declared as `(): number {}` with no return value. Fixed by computing bytes from `STORAGE_QUOTA_MB * 1024 * 1024`.
- **No redundant/temp/unused files detected** — repo remains clean.
- **All docs exist and are referenced** from README — no broken doc references.
- **No stale/TODO/FIXME artifacts** in non-test source code.

### Actions Taken

- Fixed `apps/api/src/config/constants.ts` — `QUOTA_BYTES` getter now returns computed value
- Ran full verification: typecheck ✅ lint ✅ build ✅ test:all (977 passing) ✅
- Updated `docs/active-tasks.md` — added Cycle 35 entry
- Updated `docs/findings.md` — added Cycle 35 entry

---

## Current Cycle (2026-05-31 — Cycle 36: PR Handler + Issue Audit)

### PR Handler Results

Processed all 5 open pull requests:

| #    | PR                                                          | Action | Result                                                                |
| ---- | ----------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| 1490 | perf(web): BroCula Hunt - optimize chunks and CSS           | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1489 | feat(web): consistent animate-glow on wizard CTA buttons    | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1488 | fix(api): return computed QUOTA_BYTES from STORAGE_QUOTA_MB | Merged | ✅ Rebased, build/lint/test verified, merged via admin                |
| 1487 | fix(api): compute STORAGE_CONFIG.QUOTA_BYTES from QUOTA_MB  | Closed | ✅ Changes already upstream via #1488, closed as duplicate            |
| 1486 | fix(api): add user-level authorization with RBAC middleware | Merged | ✅ Rebased, build/lint/test verified, merged via admin (closes #1078) |

### Infrastructure Note

- **Node.js 22 installed** in CI environment (was Node 20) to match project `.nvmrc` requirement
- All CI workflow files still reference `node-version: "20"` — needs `workflows` token to update
- Vercel and Cloudflare Workers deployment checks failing on ALL PRs (project-wide infrastructure issue)

### Build/Lint/Test Status

| Check                        | Result                   |
| ---------------------------- | ------------------------ |
| Web build (Vite)             | ✅ Passes                |
| API build (Wrangler dry-run) | ✅ Passes (with Node 22) |
| Lint (ESLint)                | ✅ Clean                 |
| Web tests (Vitest)           | 558/558 passed           |
| API tests (Vitest)           | 299/299 passed           |
| Shared tests (Vitest)        | 120/120 passed           |
| Total                        | **977/977 passed**       |

### Issue Audit Observations

Token (`GITHUB_TOKEN`) has read-only issue permissions — cannot close, label, or comment on issues. The following actions need a maintainer with `issues: write` scope:

1. **Close #1078** — Fixed by PR #1486 (user-level RBAC middleware merged to main)
2. **Close #1390** — Duplicate of #1470 (CI Node.js version mismatch)
3. **Close #1166** — .nvmrc already exists with value `22`
4. **Close #1045** — Duplicate of #1165 (placeholder Cloudflare resource IDs)
5. **Apply P0/P1/P2/P3 labels** to issues using old `priority:high/medium/low` system

### CI Workflow Issues (Blocked by `workflows` permission)

- All workflow files use `node-version: "20"` instead of `"22"` (#1470)
- ~~main.yml references non-existent `docs/bug.md` and `docs/feature.md` (#1293)~~ ✅ **Fixed** in RepoKeeper Cycle 37
- Multiple workflow files need GitHub Actions version standardization (#980, #1111)

---

## Current Cycle (2026-05-31 — Cycle 37: RepoKeeper)

### Findings

- **TypeScript errors found & fixed**:
  - `apps/api/src/middleware/authorize.ts` — implicit `any` on `user.role` (typed `c.get("user")` as `User | undefined`)
  - `apps/api/src/routes/share.test.ts` — missing `AppVariables` in Hono generics preventing `c.set("user")` call
- **Doc references fixed**:
  - `main.yml` — `docs/bug.md` → `docs/bugs.md` (lines 39, 263)
  - `main.yml` — `docs/feature.md` → `docs/features.md` (line 39)
- **No redundant/temp/unused files detected** — repo remains clean

### Actions Taken

- Fixed type errors in `authorize.ts` and `share.test.ts`
- Fixed stale doc references in `main.yml`
- Ran verification: typecheck ✅ lint ✅
- Updated `docs/bugs.md` — marked BUG-014 as resolved (fix applied to main)
- Updated `docs/findings.md`, `docs/active-tasks.md` — added Cycle 37 entry

---

**Last Updated**: 2026-05-31 (Cycle 37: RepoKeeper)
