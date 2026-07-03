# Cloudflare Infrastructure Setup

> **Status**: ⚠️ Placeholder IDs present — real Cloudflare resources must be created before production deployment.

## Overview

Blueprintify uses several Cloudflare resources that require real IDs before deployment works. The configuration lives in `apps/api/wrangler.toml` with annotated `TODO` and `⚠️ PLACEHOLDER` markers at each placeholder.

## Required Resources

### 1. KV Namespace (Caching)

Used for caching blueprint data and session state.

**Create:**
```bash
# Development
wrangler kv:namespace create "blueprint-cache"

# Production
wrangler kv:namespace create "blueprint-cache-prod" --env production

# Staging
wrangler kv:namespace create "blueprint-cache-staging" --env staging
```

**Update in `apps/api/wrangler.toml`:**
| Section | Field | Current Placeholder | Replace With |
|---------|-------|-------------------|--------------|
| `[[kv_namespaces]]` (dev) | `id` | `cache_kv_namespace_id` | Real KV ID |
| `[[env.production.kv_namespaces]]` | `id` | `production_cache_kv_id` | Real KV ID |
| `[[env.staging.kv_namespaces]]` | `id` | `staging_cache_kv_id` | Real KV ID |

### 2. D1 Database (Blueprint Storage)

Used for persistent blueprint storage.

**Create:**
```bash
# Development
wrangler d1 create "blueprint-db"

# Production
wrangler d1 create "blueprint-db-prod" --env production

# Staging
wrangler d1 create "blueprint-db-staging" --env staging
```

**Update in `apps/api/wrangler.toml`:**
| Section | Field | Current Placeholder | Replace With |
|---------|-------|-------------------|--------------|
| `[[d1_databases]]` (dev) | `database_id` | `local_database_id` | Real D1 ID |
| `[[env.production.d1_databases]]` | `database_id` | `production_database_id` | Real D1 ID |
| `[[env.staging.d1_databases]]` | `database_id` | `staging_database_id` | Real D1 ID |

### 3. Queue (Background Processing)

Used for async tasks like report generation.

**Create:**
```bash
# Development (uses same name as production by default)
wrangler queue create background-processing

# Staging
wrangler queue create background-processing-staging --env staging
```

The queue names in `wrangler.toml` (`background-processing`, `background-processing-staging`) are actual names. These are not placeholder values but the queues must still exist.

### 4. Rate Limiting

The rate limiter namespace IDs (`1001`–`1003` for dev, `2001`–`2003` for production, `3001`–`3003` for staging) are pre-configured and functional. Cloudflare Native Rate Limiting does not require additional resource creation — the namespace IDs are provisioned automatically.

### 5. Secrets

The following must be set via `wrangler secret put`:

```bash
# Production
wrangler secret put OPENAI_API_KEY --env production

# Staging
wrangler secret put OPENAI_API_KEY --env staging
```

Additional optional secrets (commented out in `wrangler.toml`):
- `DATABASE_URL`
- `SENTRY_DSN`

## Verification

After setting all real IDs, verify no placeholders remain:

```bash
grep -n "TODO\|PLACEHOLDER" apps/api/wrangler.toml
```

This should return zero matches. Then do a dry-run deploy:

```bash
npm run build:api
```

## Quick Reference

| Resource | Dev ID Field | Prod ID Field | Staging ID Field |
|----------|-------------|---------------|------------------|
| KV Cache | `[[kv_namespaces]]` → `id` | `[[env.production.kv_namespaces]]` → `id` | `[[env.staging.kv_namespaces]]` → `id` |
| D1 DB | `[[d1_databases]]` → `database_id` | `[[env.production.d1_databases]]` → `database_id` | `[[env.staging.d1_databases]]` → `database_id` |
| Queue | `[[queues.producers]]` → `queue` | `[[env.production.queues.producers]]` → `queue` | `[[env.staging.queues.producers]]` → `queue` |

## Related

- [API README](../apps/api/README.md) — Development and deployment guide
- [Environment Variables](./environment-variables.md) — Runtime configuration reference
- [wrangler.toml](../apps/api/wrangler.toml) — Worker configuration with placeholder IDs
