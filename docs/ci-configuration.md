# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).

### ✅ Workflow Node Version: Applied

The CI workflow files have been updated to use `node-version-file: ".node-version"` across all workflow files, replacing the previously hardcoded `node-version: "20"`.

Additionally, stale doc references were fixed: `docs/bug.md` → `docs/bugs.md` and `docs/feature.md` → `docs/features.md` in `.github/workflows/main.yml`.

### Setup

```bash
# Use nvm (see .nvmrc)
nvm use

# Or fnm
fnm use

# Verify
node --version  # Should be v22.x.x
```

### CI Workflow Pattern

All CI workflows use `ubuntu-24.04-arm` runners and `actions/setup-node@v6`. Node version is read from `.node-version`:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version-file: ".node-version"
    cache: "npm"
```

### Verification

The project's CI workflows reference `.node-version` to ensure the correct Node.js version is used.
