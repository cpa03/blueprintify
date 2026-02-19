# DevOps Memory

> Operational knowledge and deployment notes for the DevOps Engineer agent.

## CI/CD Pipeline Overview

### Workflows

| Workflow            | Purpose                           | Runner             | Trigger                     |
| ------------------- | --------------------------------- | ------------------ | --------------------------- |
| `main.yml`          | AI Software Company orchestration | `ubuntu-24.04-arm` | Schedule (every 6h), Manual |
| `ai-on-push.yml`    | AI agent on push                  | `ubuntu-24.04-arm` | Push to main                |
| `iterate.yml`       | Iteration workflow                | `ubuntu-24.04-arm` | Manual                      |
| `pr-gatekeeper.yml` | PR validation and auto-fix        | `ubuntu-24.04-arm` | PR events                   |
| `on-pull.yml`       | Pull request handler              | `ubuntu-24.04-arm` | PR, Schedule, Manual        |

### Known Issues

#### Issue #483 - Workflow Configuration Issues

**Status**: READY TO PUSH (requires manual intervention or admin token)

**Changes Prepared** (2026-02-19):

- Branch: `agent/devops-engineer`
- Commit: `58123d4` - "ci: fix workflow configuration issues"
- All fixes applied and verified locally (typecheck, lint, build, test pass)

The GitHub App token lacks `workflows` permission. The following changes have been prepared and are ready to be pushed manually:

1. **Rename workflow file** (remove space in filename):

   ```bash
   git mv ".github/workflows/on pull.yml" ".github/workflows/on-pull.yml"
   ```

2. **Normalize line endings to LF**:

   ```bash
   sed -i 's/\r$//' .github/workflows/on-pull.yml .github/workflows/pr-gatekeeper.yml
   ```

3. **Update runner version** (line 23 in on-pull.yml):

   ```yaml
   # Change from:
   runs-on: ubuntu-22.04-arm
   # To:
   runs-on: ubuntu-24.04-arm
   ```

4. **Fix action versions** (in on-pull.yml):

   ```yaml
   # Line 43: Change from:
   uses: actions/checkout@v6
   # To:
   uses: actions/checkout@v4

   # Line 50: Change from:
   uses: actions/setup-node@v6
   # To:
   uses: actions/setup-node@v4
   ```

**Verification** (after applying):

```bash
npm run typecheck && npm run lint && npm run build && npm run test:all
```

## Deployment Configuration

### Cloudflare Workers (API)

- **Framework**: Hono
- **Runtime**: Cloudflare Workers (Edge)
- **Config**: `apps/api/wrangler.toml`
- **Environments**: development, staging, production

### Key Bindings

- **KV Namespace**: `CACHE` - for caching
- **D1 Database**: `DB` - SQLite at the edge
- **Queue**: `BACKGROUND_QUEUE` - background processing
- **Rate Limiters**: STRICT, STANDARD, LENIENT

### Deployment Commands

```bash
# Development
npm run dev:api

# Deploy to staging
npm run deploy --workspace=apps/api -- --env staging

# Deploy to production
npm run deploy --workspace=apps/api -- --env production
```

## Project Standards (from AGENTS.md)

- **CI Runner**: MUST use `ubuntu-24.04-arm`
- **Model**: MUST use `opencode/glm-4.7-free`
- **Secrets**: NEVER expose in logs or commits

## CI/CD Best Practices

1. **Fail Fast**: Put fastest tests (lint, unit) first
2. **Caching**: Use `actions/cache` for node_modules and build artifacts
3. **Concurrency**: Use `cancel-in-progress` for PR workflows
4. **Security**: Never log secrets, use GitHub Secrets for CI variables

## Troubleshooting

### Workflow Permission Errors

If you see:

```
refusing to allow a GitHub App to create or update workflow `.github/workflows/X.yml` without `workflows` permission
```

This means the GitHub App token lacks workflow write permissions. The fix must be applied manually by someone with repository admin access.

### Runner Not Available

If `ubuntu-24.04-arm` is not available, check:

1. GitHub Actions plan supports ARM runners
2. Repository has access to larger runners
3. Fallback to `ubuntu-latest` if needed (but violates project standards)
