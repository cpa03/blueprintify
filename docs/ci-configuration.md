# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).

### ⚠️ Workflow Node Version: Stale (BLOCKED from push)

All CI workflow files still use the **hardcoded** `node-version: "20"` on `main` because `GITHUB_TOKEN` lacks `workflows: write` permission. The fixes are prepared on a separate branch but cannot be pushed without a PAT with the `workflows` scope.

| Workflow File                                    | Current on `main`             | Target (prepared)                    |
| ------------------------------------------------ | ----------------------------- | ------------------------------------ |
| `.github/workflows/iterate.yml` (5 occurrences)  | `node-version: "20"`          | `node-version-file: ".node-version"` |
| `.github/workflows/parallel.yml` (4 occurrences) | `node-version: "20"`          | `node-version-file: ".node-version"` |
| `.github/workflows/pr-gatekeeper.yml`            | `node-version: "20"`          | `node-version-file: ".node-version"` |
| `.github/workflows/on-pull.yml`                  | `node-version: 20` (unquoted) | `node-version-file: ".node-version"` |

> **Fix approach**: Change from hardcoded `node-version` to `node-version-file: ".node-version"` (11 occurrences across 4 files). Fixes are prepared in branches `chore/repokeeper-cycle-59` and `fix/bugfixer-cycle-48-stale-refs` — both blocked from push by missing `workflows: write` permission.

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

All CI workflows use `ubuntu-24.04-arm` runners and `actions/setup-node@v6`. The node version is hardcoded as a string parameter:

```yaml
- uses: actions/setup-node@v6
  with:
    node-version: "22"
    cache: "npm"
```

### Verification

The project includes an automated check via `scripts/ensure-node-version.mjs`.
