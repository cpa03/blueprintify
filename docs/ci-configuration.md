# CI/CD Configuration

## Node.js Version

**Required: Node.js 22+**

The project requires Node.js 22+ (see `.nvmrc`, `.node-version`, `package.json` `engines`).

### All workflow files use `actions/setup-node@v6` and MUST specify `node-version: "22"`:

| Workflow File                                    | Current | Required |
| ------------------------------------------------ | ------- | -------- |
| `.github/workflows/on-pull.yml`                  | `20` ⚠️ | `22`     |
| `.github/workflows/parallel.yml` (4 occurrences) | `20` ⚠️ | `22`     |
| `.github/workflows/pr-gatekeeper.yml`            | `20` ⚠️ | `22`     |
| `.github/workflows/iterate.yml` (5 occurrences)  | `20` ⚠️ | `22`     |

> **Note**: Fixes applied locally in Cycle 52 but BLOCKED from push — GitHub App token requires `workflows: write` scope. Maintainer intervention needed.

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
