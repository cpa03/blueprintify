# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ❌ Workflow Node Version: NOT Applied

All CI workflow files still pin `node-version: "20"` despite the project requiring Node 22+.
This causes API builds to fail in CI with:

```
Wrangler requires at least Node.js v22.0.0. You are using v20.20.2.
```

**Affected files** (11 occurrences across 4 files):
- `.github/workflows/iterate.yml` — 5 occurrences
- `.github/workflows/parallel.yml` — 4 occurrences
- `.github/workflows/on-pull.yml` — 1 occurrence
- `.github/workflows/pr-gatekeeper.yml` — 1 occurrence

### Applying the Fix

The fix has been verified (build + typecheck + lint + all 1,701 tests pass with Node 22).

**Option A: Run the fix script**
```bash
node scripts/fix-ci-node-version.mjs
```

**Option B: Apply the patch file**
```bash
git apply docs/ci-workflow-fixes-node-version.patch
```

The patch updates all `node-version: "20"` to `node-version: "22"` in all workflow files.

### Push Restriction

The GITHUB_TOKEN used in CI Actions runners lacks `workflows: write` permission,
which means workflow file changes cannot be pushed via the CI pipeline.

**To merge this fix, a maintainer with `workflows: write` access must:**
1. Check out the PR branch or apply the patch locally:
   ```bash
   git fetch origin
   git checkout fix/ci-node-version-22-doc
   node scripts/fix-ci-node-version.mjs
   ```
2. Commit and push:
   ```bash
   git add .github/workflows/
   git commit -m "fix(ci): update node-version from 20 to 22 across all workflows"
   git push origin HEAD:fix/ci-node-version-22
   ```
3. Create a PR or merge directly

### Related Issues

- [#2030](https://github.com/cpa03/blueprintify/issues/2030) — Original bug report (P1)
- [#2063](https://github.com/cpa03/blueprintify/issues/2063) — Duplicate, fix documented (closed)
- [#2073](https://github.com/cpa03/blueprintify/issues/2073) — Duplicate, fix documented (closed)
- [#2119](https://github.com/cpa03/blueprintify/issues/2119) — Duplicate, fix documented (closed)

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

Once applied, CI should pass with Node 22:
```bash
# Verify the fix locally
node scripts/fix-ci-node-version.mjs
npm run check
```
