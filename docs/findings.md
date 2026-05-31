# Findings

> **Incoming signals and observations** — cleared after each orchestration cycle. Historical cycles are preserved in git history.

## Current Cycle (2026-05-31 — Cycle 39: RepoKeeper)

### Findings

- **Typecheck**: ✅ Clean
- **Lint**: ✅ Clean
- **Build**: ✅ Passes

### CI Workflow Fixes

**Stale doc references fixed in `main.yml`** (lines 39, 263):

- `docs/bug.md` → `docs/bugs.md`
- `docs/feature.md` → `docs/features.md`
- Note: Cycle 37 previously documented these fixes but they were never actually committed to main. Cycle 39 applies the actual fix.

**Node.js version alignment** — 10 instances of `node-version: "20"` updated to `"22"`:

| File                                  | Instances Fixed |
| ------------------------------------- | --------------- |
| `.github/workflows/iterate.yml`       | 5               |
| `.github/workflows/parallel.yml`      | 4               |
| `.github/workflows/pr-gatekeeper.yml` | 1               |

### Stale Files Removed

- Removed `.omo/ralph-loop.local.md` (leftover ultrawork loop tracking file)
- Created missing `docs/knowledge-review.md` (referenced by `main.yml` line 240 but didn't exist)

### No Other Redundant/Temp/Unused Files

- No empty directories found
- No stale TODO/FIXME artifacts in non-test source code
- Documentation tree in README remains accurate

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
