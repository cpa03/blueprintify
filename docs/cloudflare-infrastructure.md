# Cloudflare Infrastructure Setup

> **Status**: ✅ **All resources provisioned with real IDs** — validated by `npm run validate:wrangler` (zero placeholders detected).

## Overview

Blueprintify uses several Cloudflare resources. All required resources have been created and configured with real IDs in `apps/api/wrangler.toml`.

The configuration is validated automatically by `npm run validate:wrangler` which checks for placeholder patterns.

## Configured Resources (Live IDs in wrangler.toml)

### 1. KV Namespace (Caching)

Used for caching blueprint data and session state.

| Environment | Binding | Namespace ID |
|-------------|---------|--------------|
| Production  | `CACHE` | `c55ed3885e8440338c5066ea4f310cc3` |
| Staging     | `CACHE` | `17d72197156e4705b6850e731883d6fb` |
| Development | `CACHE` | (uses Production binding locally via `.dev.vars`) |

### 2. D1 Database (Blueprint Storage)

Used for persistent blueprint storage.

| Environment | Binding | Database ID |
|-------------|---------|-------------|
| Production  | `DB` | `49d9b895-9f4e-4b91-989c-8bfeb0bc2d50` |
| Staging     | `DB` | `7c22c4e8-3451-4cf5-945c-92eb1fb466b4` |
| Development | `DB` | (uses Production binding locally via `.dev.vars`) |

### 3. Rate Limiters

Three tiered rate limiters using native Cloudflare rate limiting:

| Name | Namespace ID (Prod) | Namespace ID (Staging) | Limit | Period |
|------|---------------------|------------------------|-------|--------|
| `STRICT_RATE_LIMITER` | `1001` | `3001` | 10 req | 60s |
| `STANDARD_RATE_LIMITER` | `1002` | `3002` | 60 req | 60s |
| `LENIENT_RATE_LIMITER` | `1003` | `3003` | 120 req | 60s |

### 4. Assets Binding (Workers Static Assets)

Frontend assets served from `apps/web/dist`:

```toml
[assets]
directory = "../../apps/web/dist"
binding = "ASSETS"
not_found_handling = "none"
```

### 5. Workers AI

```toml
[ai]
binding = "AI"
```

### 6. Observability

```toml
[observability]
enabled = true
[observability.logs]
enabled = true
head_sampling_rate = 0.5
```

## Free Tier Constraints

The following Cloudflare features are **explicitly disabled** due to Free Tier limitations:
- **Analytics Engine** (error 10089 on Free Tier)
- **Queues** — no queue bindings in `wrangler.toml`; background processing runs inline

## Validation

Run validation locally:

```bash
npm run validate:wrangler
```

This checks:
- ✅ All resource IDs present (no placeholder patterns)
- ✅ Node.js ≥22 requirement
- ✅ `.dev.vars.example` exists

## Secrets

The following must be set via `wrangler secret put`:

```bash
# Production
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put API_KEY --env production

# Staging
wrangler secret put OPENAI_API_KEY --env staging
wrangler secret put API_KEY --env staging
```

`API_KEY` is required for authentication — protected endpoints return `503 Service Unavailable` when it is not set. Optional `ADMIN_API_KEY` grants the `admin` role via RBAC and takes precedence over `API_KEY`:

```bash
wrangler secret put ADMIN_API_KEY --env production
wrangler secret put ADMIN_API_KEY --env staging
```

Additional optional secrets (not currently configured):
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

| Resource | Prod ID Field | Staging ID Field |
|----------|---------------|------------------|
| KV Cache | `[[kv_namespaces]]` → `id` | `[[env.staging.kv_namespaces]]` → `id` |
| D1 DB | `[[d1_databases]]` → `database_id` | `[[env.staging.d1_databases]]` → `database_id` |

## Related

- [API README](../apps/api/README.md) — Development and deployment guide
- [Environment Variables](./environment-variables.md) — Runtime configuration reference
- [wrangler.toml](../apps/api/wrangler.toml) — Worker configuration with real IDs