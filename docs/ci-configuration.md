# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ⚠️ Workflow Node Version: PENDING FIX (RepoKeeper Cycle 163)

All CI workflow files **still use hardcoded `node-version: "20"`**. This does NOT match the project's Node.js 22+ requirement (see `.nvmrc`, `.node-version`).

The fix (replace `node-version: "20"` with `node-version-file: ".node-version"`) was prepared on branch `chore/repokeeper-cycle-163` but **cannot be pushed via CI** because the GitHub App token lacks `workflows: write` permission.

#### Affected Files

| File | Occurrences | Current | Required |
|------|-------------|---------|----------|
| `iterate.yml` | 5 | `node-version: "20"` | `node-version-file: ".node-version"` |
| `parallel.yml` | 4 | `node-version: "20"` | `node-version-file: ".node-version"` |
| `on-pull.yml` | 1 | `node-version: 20` | `node-version-file: ".node-version"` |
| `pr-gatekeeper.yml` | 1 | `node-version: "20"` | `node-version-file: ".node-version"` |

#### Applying the Fix

A maintainer with `workflows: write` access must:

```bash
# Option A: Run the fix script
node scripts/fix-ci-node-version.mjs

# Option B: Manual changes
# In each file listed above, replace:
#   node-version: "20"  →  node-version-file: ".node-version"
#   node-version: 20    →  node-version-file: ".node-version"

# Commit and push
git add .github/workflows/
git commit -m "fix(ci): update node-version from 20 to 22 across all workflows"
git push origin HEAD:main
```

#### Related Issues

- [#2030](https://github.com/cpa03/blueprintify/issues/2030) — Original bug report (P1, canonical)
- [#2160](https://github.com/cpa03/blueprintify/issues/2160) — Duplicate of #2030 (same BUG-017)

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
