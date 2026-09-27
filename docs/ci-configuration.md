# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ✅ Workflow Node Version: FIXED ON MAIN

All CI workflow files use `node-version-file: ".node-version"` across 4 of 5 workflow files (11 occurrences total — iterate 5, parallel 4, on-pull 1, pr-gatekeeper 1). `main.yml` is the sole exception (0 occurrences — it does not use `setup-node`). This matches the project's Node.js 22+ requirement (see `.nvmrc`, `.node-version`).

**BUG-017 — RESOLVED on `main`**:
- `node-version-file: ".node-version"` is the single source of truth
- 4 of 5 workflows (iterate.yml, parallel.yml, on-pull.yml, pr-gatekeeper.yml) use it; `main.yml` has no `setup-node` step
- No hardcoded versions remain

**Current verifications (Sep 2026):**
- ✅ Typecheck: clean (`npm run typecheck`)
- ✅ Lint: 0 errors, 0 warnings (`npm run lint`)
- ✅ Build: clean (`npm run build`, `npm run build:api`)
- ✅ Secrets scan: clean (`npm run scan:secrets`)
- ✅ npm audit: 0 vulnerabilities (`npm audit --audit-level=high`)
- ✅ Wrangler configuration: clean, real IDs (`npm run validate:wrangler`)

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

**Status: documented gap — CI-level enforcement for `npm audit`, `scan:secrets`, `test:all` BLOCKED on `workflows: write` permission (absent in all 5 workflows).**

The repository relies on three quality/security gates. Their enforcement layers differ:

| Gate | Local (`.husky` hooks) | CI (workflows) |
| --- | --- | --- |
| `npm run scan:secrets` | ✅ `.husky/pre-commit` (blocking) + `.husky/pre-push` | ❌ 0 refs in all 5 workflows |
| `npm audit` | ✅ `.husky/pre-push` (via `npm run check`) | ❌ 0 refs in all 5 workflows |
| `npm run test:all` | ✅ `.husky/pre-push` (via `npm run check`) | ❌ 0 refs in all 5 workflows |

### Permissions analysis (Sep 2026)

| Workflow | `contents` | `pull-requests` | `issues` | `checks` | `actions` | `workflows` |
|----------|-----------|----------------|----------|----------|-----------|-------------|
| `main.yml` | write | write | write | — | — | — |
| `parallel.yml` | write | write | write | — | write | — |
| `pr-gatekeeper.yml` | write | write | write | write | — | — |
| `iterate.yml` | write | write | write | — | write | — |
| `on-pull.yml` | write | write | **no** | — | read | — |

- `issues: write` **is present** in 4 of 5 workflows (absent only in `on-pull.yml`)
- `workflows: write` is **absent in all 5** — this is the actual blocker for adding CI steps that modify workflow files

### #1084 / #1088 — `npm audit` + `scan:secrets` not enforced in CI

- **Verified Sep 2026:** all 5 workflows contain **zero** `npm run scan:secrets` and **zero** `npm audit` steps.
- **Local mitigation active:** `.husky/pre-commit` runs `npm run scan:secrets` (blocking) + `lint-staged`; `.husky/pre-push` runs `npm run validate:wrangler -- --summary` + full `npm run check` (typecheck + lint + scan:secrets + audit + test:all), blocking on failure.
- **Fix (deferred):** add `scan:secrets` + `npm audit` steps to `pr-gatekeeper.yml` STAGE 1 health checks. **Push REJECTED** — token lacks `workflows:write` (verified PUT `contents/.github/workflows/*` → HTTP 403, zero residue).

### #849 / #953 — `test:all` not enforced in CI (gatekeeper can auto-merge failing-test PRs)

- `pr-gatekeeper.yml` STAGE 1 Health Checks (L58–66) run only `typecheck` / `lint` / `build`; L131 Final Integrity runs `build && typecheck` — **no `test:all`**. A PR whose changes break tests can pass the gatekeeper.
- **Local mitigation active:** `.husky/pre-push` runs `npm run check` which includes `test:all` (2,600+ tests passing on main).
- **Fix (deferred):** add `npm run test:all` to `pr-gatekeeper.yml` STAGE 1. **Push-blocked** on `workflows:write` (same as above).

### Required human action

Provide a GitHub token with `workflows: write` so the workflow-level gates can be landed. Until then CI does not run secrets scan, audit, or tests — local hooks are the only enforcement.
