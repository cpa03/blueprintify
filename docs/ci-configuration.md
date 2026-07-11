# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ⚠️ Workflow Node Version: FIX APPLIED (BugFixer Jul 11 2026)

All CI workflow files have been updated from hardcoded `node-version: "20"` to `node-version: "22"` across all 4 workflow files (11 occurrences total). This matches the project's Node.js 22+ requirement (see `.nvmrc`, `.node-version`).

**BUG-017 — RESOLVED on branch `fix/bugfixer-node-version-jul-11-2026`**:
- `iterate.yml`: 5 occurrences `"20"` → `"22"`
- `parallel.yml`: 4 occurrences `"20"` → `"22"`
- `on-pull.yml`: 1 occurrence `20` → `"22"`
- `pr-gatekeeper.yml`: 1 occurrence `"20"` → `"22"`

**Verification results with fix applied (Node 22.23.1):**
- ✅ Typecheck: clean
- ✅ Lint: 0 errors, 0 warnings
- ✅ Build (web): clean
- ✅ Build (api): clean
- ✅ Tests: 1,890/1,890 passed (755 web + 443 api + 692 shared)
- ✅ Secrets scan: clean
- ⚠️ **Push blocked**: GitHub App token lacks `workflows: write` permission (known blocker — 30+ cycles). PR created with fix instructions.
- ✅ **Prebuild check added**: `apps/api/package.json` now validates Node.js >=22 before `build` runs.
- ✅ **Local fix**: nvm installs Node 22.23.1 (`nvm install 22 && nvm use 22`)

#### Applying the Fix (manual, if PR merge is blocked)

A maintainer with `workflows: write` access can run:

```bash
nvm install 22 && nvm use 22
node scripts/fix-ci-node-version.mjs
git add .github/workflows/
git commit -m "fix(ci): bump node-version from 20 to 22 across all workflows"
git push origin HEAD
```

The `scripts/fix-ci-node-version.mjs` script handles all 11 occurrences across 4 files.

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
