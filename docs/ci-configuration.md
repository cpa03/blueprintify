# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).
Wrangler 4.x requires Node.js >=22 — the API build (`npm run build:api`) fails with Node 20.

### ⚠️ Workflow Node Version: FIX VERIFIED (ULW Loop Jul 3)

All CI workflow files **still use hardcoded `node-version: "20"`** on `main`. This does NOT match the project's Node.js 22+ requirement (see `.nvmrc`, `.node-version`).

The fix (replace `node-version: "20"` with `node-version-file: ".node-version"`) was prepared, applied, and verified locally on branch `fix/ci-node-version-file` via `scripts/fix-ci-node-version.mjs` but **cannot be pushed** because the GitHub App token lacks `workflows: write` permission (this is the core blocker tracked in all related issues).

**Verification results with fix applied (Node 22):**
- ✅ Typecheck: clean
- ✅ Lint: 0 errors, 0 warnings
- ✅ Build: clean
- ✅ Tests: 1744 passed (723 web + 443 api + 578 shared)

#### Affected Files

| File | Occurrences | Current | Required Fix |
|------|-------------|---------|-------------|
| `iterate.yml` | 5 | `node-version: "20"` | `node-version-file: ".node-version"` |
| `parallel.yml` | 4 | `node-version: "20"` | `node-version-file: ".node-version"` |
| `on-pull.yml` | 1 | `node-version: 20` | `node-version-file: ".node-version"` |
| `pr-gatekeeper.yml` | 1 | `node-version: "20"` | `node-version-file: ".node-version"` |
| `main.yml` | 0 (doc refs) | `docs/bug.md` / `docs/feature.md` | `docs/bugs.md` / `docs/features.md` |

#### Applying the Fix

A maintainer with `workflows: write` access must:

```bash
# Run the fix script
git fetch origin
git checkout -b fix/apply-ci-fixes origin/main
node scripts/fix-ci-node-version.mjs
git add .github/workflows/
git commit -m "fix(ci): replace hardcoded node-version 20 with node-version-file"
git push origin fix/apply-ci-fixes
# Create PR linked to #2030
```

The fix script also handles BUG-014 (stale doc references in `main.yml`).

#### Related Issues

- [#2030](https://github.com/cpa03/blueprintify/issues/2030) — Original bug report (P1, canonical)
- [#2160](https://github.com/cpa03/blueprintify/issues/2160) — Duplicate of #2030 (same BUG-017)
- [#2248](https://github.com/cpa03/blueprintify/issues/2248) — Duplicate of #2030
- [#2253](https://github.com/cpa03/blueprintify/issues/2253) — Duplicate of #2030
- [#1166](https://github.com/cpa03/blueprintify/issues/1166) — Already resolved (`.nvmrc` exists)

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
