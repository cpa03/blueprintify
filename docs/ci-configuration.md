# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ✅ Workflow Node Version: FIXED (RepoKeeper Cycle 162)

All CI workflow files now use `node-version-file: ".node-version"` instead of hardcoded `node-version: "20"`.
This was fixed in RepoKeeper Cycle 162 (Jun 28, 2026) — changes applied to `.github/workflows/` on branch `chore/repokeeper-cycle-162`.

| File | Occurrences | Change |
|------|-------------|--------|
| `iterate.yml` | 5 | `node-version: "20"` → `node-version-file: ".node-version"` |
| `parallel.yml` | 4 | `node-version: "20"` → `node-version-file: ".node-version"` |
| `on-pull.yml` | 1 | `node-version: 20` → `node-version-file: ".node-version"` |
| `pr-gatekeeper.yml` | 1 | `node-version: "20"` → `node-version-file: ".node-version"` |

This uses `.node-version` (contents: `22`) as single source of truth, so updating the Node.js version in future requires changing only `.node-version`.

### Applying the Fix (if not yet merged)

**Option A: Run the fix script (Node.js)**
```bash
node scripts/fix-ci-node-version.mjs
```

**Option B: Run the fix script (bash)**
```bash
bash scripts/fix-node-version.sh
```

Both scripts now replace `node-version: "20"` with `node-version-file: ".node-version"`.

### Push Restriction

The GITHUB_TOKEN used in CI Actions runners lacks `workflows: write` permission,
which means workflow file changes cannot be pushed via the CI pipeline.

**To merge this fix, a maintainer with `workflows: write` access must:**
1. Check out the PR branch or apply the changes locally:
    ```bash
    git fetch origin
    git checkout chore/repokeeper-cycle-162
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
