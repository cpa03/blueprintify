# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).

### All workflow files use `actions/setup-node@v6` and use `node-version-file: ".node-version"`:

| Workflow File                                    | Current                              | Status |
| ------------------------------------------------ | ------------------------------------ | ------ |
| `.github/workflows/on-pull.yml`                  | `node-version-file: ".node-version"` | ✅     |
| `.github/workflows/parallel.yml` (4 occurrences) | `node-version-file: ".node-version"` | ✅     |
| `.github/workflows/pr-gatekeeper.yml`            | `node-version-file: ".node-version"` | ✅     |
| `.github/workflows/iterate.yml` (5 occurrences)  | `node-version-file: ".node-version"` | ✅     |

> **Note**: All workflows fixed in Cycle 58 — changed from hardcoded `node-version: "20"` to `node-version-file: ".node-version"` (11 occurrences total). Automatically stays in sync with `.node-version` (Node 22).

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
