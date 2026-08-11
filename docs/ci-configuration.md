# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ✅ Workflow Node Version: FIXED ON MAIN

All CI workflow files use `node-version-file: ".node-version"` across all 4 workflow files (11 occurrences total). This matches the project's Node.js 22+ requirement (see `.nvmrc`, `.node-version`).

**BUG-017 — RESOLVED on `main`**:
- `node-version-file: ".node-version"` is the single source of truth
- All 4 workflows (iterate.yml, parallel.yml, on-pull.yml, pr-gatekeeper.yml) use it
- No hardcoded versions remain

**Current verifications (Jul 27 2026):**
- ✅ Typecheck: clean
- ✅ Lint: 0 errors, 0 warnings
- ✅ Build: clean
- ✅ Tests: 2,224/2,224 passed (912 web + 502 api + 810 shared)
- ✅ npm audit: 0 vulnerabilities
- ✅ Secrets scan: clean

#### Related Issues

- [#2030](https://github.com/cpa03/blueprintify/issues/2030) — Original bug report (P1, canonical)
- [#2160](https://github.com/cpa03/blueprintify/issues/2160), [#2248](https://github.com/cpa03/blueprintify/issues/2248), [#2253](https://github.com/cpa03/blueprintify/issues/2253) — Duplicates of #2030

### Setup

```bash
# Use nvm (see .nvmrc)
nvm use

# Or fnm
fnm use

# Verify
node --version  # Should be v22.x.x
```

### Verification

```bash
npm run check
```

## Security Gates

**Status: documented gap — CI-level enforcement BLOCKED on token permissions (as of Cycle 431, Aug 11 2026).**

The repository relies on three quality/security gates. Their enforcement layers differ:

| Gate | Local (`.husky` hooks) | CI (workflows) |
| --- | --- | --- |
| `npm run scan:secrets` | ✅ `.husky/pre-commit` (blocking) + `.husky/pre-push` | ❌ 0 refs in all 5 workflows |
| `npm audit` | ✅ `.husky/pre-push` (via `npm run check`) | ❌ 0 refs in all 5 workflows |
| `npm run test:all` | ✅ `.husky/pre-push` (via `npm run check`) | ❌ 0 refs in all 5 workflows |

### #1084 / #1088 — `npm audit` + `scan:secrets` not enforced in CI

- **Verified Aug 11 2026 (Cycle 431):** all 5 workflows (`main.yml`, `on-pull.yml`, `pr-gatekeeper.yml`, `iterate.yml`, `parallel.yml`) contain **zero** `npm run scan:secrets` and **zero** `npm audit` steps. The only "audit" text match (`parallel.yml` L251) is an agent prompt string ("Perform deep full-repository audit"), not a CI step; all "secret" matches are `${{ secrets.* }}` variable references, not the secrets scanner.
- **Local mitigation already active:** `.husky/pre-commit` runs `npm run scan:secrets` (blocking) + `lint-staged`; `.husky/pre-push` runs `npm run validate:wrangler -- --summary` + full `npm run check` (typecheck + lint + scan:secrets + audit + test:all), blocking on failure.
- **Fix (deferred):** add `scan:secrets` + `npm audit` steps to `pr-gatekeeper.yml` STAGE 1 health checks. **Push REJECTED twice (Cycles 430–431)** — token lacks `workflows:write` (verified PUT `contents/.github/workflows/*` → HTTP 403, zero residue). 2nd consecutive deferral.

### #849 / #953 — `test:all` not enforced in CI (gatekeeper can auto-merge failing-test PRs)

- `pr-gatekeeper.yml` STAGE 1 Health Checks (L58–66) run only `typecheck` / `lint` / `build`; L131 Final Integrity runs `build && typecheck` — **no `test:all`**. A PR whose changes break tests can pass the gatekeeper.
- **Local mitigation already active:** `.husky/pre-push` runs `npm run check` which includes `test:all` (2,530/2,530 passing on main).
- **Fix (deferred):** add `npm run test:all` to `pr-gatekeeper.yml` STAGE 1. **Push-blocked** on `workflows:write` (same as above). 46th consecutive deferral.

### Required human action

Provide a GitHub token with `workflows: write` (and optionally `issues: write` for Steps 1–3 of the ULW loop) so the workflow-level gates can be landed. Until then CI does not run secrets scan, audit, or tests — local hooks are the only enforcement.
