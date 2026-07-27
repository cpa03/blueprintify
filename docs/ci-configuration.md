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
