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
| `on-pull.yml`       | Pull request handler              | `ubuntu-24.04-arm` | `ubuntu-24.04-arm` | PR, Schedule, Manual        |

### Known Issues

#### Issue #483 - Workflow Configuration Issues

**Status**: ✅ RESOLVED (2026-02-21)

**Original Problem**: Workflow files had configuration issues including:

- File named `on pull.yml` with space (problematic for shell commands)
- Outdated runner version `ubuntu-22.04-arm`
- Invalid action versions (`@v6` which doesn't exist)

**Resolution**: All issues fixed on `main` branch:

- ✅ File renamed to `on-pull.yml` (with hyphen)
- ✅ Runner updated to `ubuntu-24.04-arm`
- ✅ Action versions updated to `@v4`

#### Action Version Standardization (2026-02-21)

**Status**: ✅ RESOLVED (2026-02-21)

**Original Problem**: Several workflows used `actions/*@v5` which doesn't exist. This would cause workflow failures.

**Fixes Applied** (by devops-engineer agent on branch `agent/devops-engineer`):

1. **main.yml**:
   - `actions/checkout@v5` → `actions/checkout@v4` (9 occurrences)

2. **ai-on-push.yml**:
   - `actions/checkout@v5` → `actions/checkout@v4` (4 occurrences)
   - `actions/cache@v5` → `actions/cache@v4` (1 occurrence)
   - `actions/setup-node@v5` → `actions/setup-node@v4` (1 occurrence)

3. **iterate.yml**:
   - `actions/checkout@v5` → `actions/checkout@v4` (5 occurrences)
   - `actions/cache@v5` → `actions/cache@v4` (5 occurrences)

**Note**: `on-pull.yml` and `pr-gatekeeper.yml` already used `@v4` versions and required no changes.

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
