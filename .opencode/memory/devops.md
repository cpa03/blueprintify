# DevOps Memory

> Operational knowledge and deployment notes for the DevOps Engineer agent.

## CI/CD Pipeline Overview

### Workflows

| Workflow            | Purpose                           | Runner (Current)   | Runner (Required)  | Trigger                     |
| ------------------- | --------------------------------- | ------------------ | ------------------ | --------------------------- |
| `main.yml`          | AI Software Company orchestration | `ubuntu-24.04-arm` | `ubuntu-24.04-arm` | Schedule (every 6h), Manual |
| `ai-on-push.yml`    | AI agent on push                  | `ubuntu-24.04-arm` | `ubuntu-24.04-arm` | Push to main                |
| `iterate.yml`       | Iteration workflow                | `ubuntu-24.04-arm` | `ubuntu-24.04-arm` | Manual                      |
| `pr-gatekeeper.yml` | PR validation and auto-fix        | `ubuntu-24.04-arm` | `ubuntu-24.04-arm` | PR events                   |
| `on pull.yml`       | Pull request handler              | `ubuntu-22.04-arm` | `ubuntu-24.04-arm` | PR, Schedule, Manual        |

### Known Issues

#### Issue #483 - Workflow Configuration Issues

**Status**: ⚠️ BLOCKED - Requires Manual Intervention

**Problem**: GitHub App token lacks `workflows` permission to push workflow file changes.

**Current State on `main`** (as of 2026-02-20):

- `on pull.yml` still uses `ubuntu-22.04-arm` (should be `ubuntu-24.04-arm`)
- `on pull.yml` still uses `actions/checkout@v6` (should be `v4`)
- `on pull.yml` still uses `actions/setup-node@v6` (should be `v4`)
- File still has space in name: `on pull.yml` (not renamed)

**Fixes Prepared** (2026-02-20):

1. ⏳ **Runner version** (line 23):
   - `ubuntu-22.04-arm` → `ubuntu-24.04-arm` (per AGENTS.md requirement)

2. ⏳ **Action versions**:
   - `actions/checkout@v6` → `actions/checkout@v4`
   - `actions/setup-node@v6` → `actions/setup-node@v4`

3. ⏳ **Line endings**: Normalized to LF

**Verification Results** (2026-02-20):

```
✓ typecheck: passed
✓ lint: passed
✓ build: passed (19.14s)
✓ tests: 343 passed (219 web + 124 api)
```

**Action Required**: Someone with repository admin access must manually apply these fixes to the workflow files.

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
