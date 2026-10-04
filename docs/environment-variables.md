# Environment Variables

This document describes all environment variables and configuration options for the Blueprint Generator project.

## Table of Contents

- [API Environment Variables](#api-environment-variables)
- [Frontend Environment Variables](#frontend-environment-variables)
- [Cloudflare Bindings](#cloudflare-bindings)
- [Setup Instructions](#setup-instructions)

---

## API Environment Variables

The API is built on Cloudflare Workers and uses `.dev.vars` for local development.

| Variable             | Required    | Default                     | Description                                                        |
| -------------------- | ----------- | --------------------------- | ------------------------------------------------------------------ |
| `OPENAI_API_KEY`     | Yes         | -                           | Your OpenAI API key for AI completions                             |
| `OPENAI_BASE_URL`    | No          | `https://api.openai.com/v1` | Custom API base URL for OpenAI-compatible endpoints                |
| `OPENAI_MODEL`       | No          | `gpt-4o-mini`               | Model to use for completions                                       |
| `OPENAI_TIMEOUT_MS`  | No          | `60000`                     | Request timeout in milliseconds                                    |
| `OPENAI_MAX_TOKENS`  | No          | `4000`                      | Maximum tokens per request                                         |
| `OPENAI_TEMPERATURE` | No          | `0.7`                       | Sampling temperature (0-2)                                         |
| `API_VERSION`        | No          | `1.0.0`                     | API version identifier returned in health check                    |
| `CORS_ORIGIN`        | No          | `*`                         | Allowed CORS origins (comma-separated)                             |
| `CORS_MAX_AGE`       | No          | `86400`                     | CORS preflight cache duration in seconds                           |
| `API_KEY`            | Recommended | -                           | API authentication key. **Secret only** — never a `[vars]` entry. If not set, protected endpoints return 503 |
| `ADMIN_API_KEY`      | No          | -                           | Admin API key granting the `admin` role (RBAC). Takes precedence over `API_KEY` for admin-protected endpoints |
| `ENVIRONMENT`        | No          | `development`               | Runtime environment (`development`, `staging`, `production`). Production detection uses this because CF Workers never sets `NODE_ENV` |
| `NODE_ENV`           | No          | `development`               | Runtime environment (`development`, `test`, `production`)          |

### Rate Limiting

| Variable                  | Required | Default | Description                                   |
| ------------------------- | -------- | ------- | --------------------------------------------- |
| `RATE_LIMIT_WINDOW_MS`    | No       | `60000` | Time window for rate limiting in milliseconds |
| `RATE_LIMIT_STRICT_MAX`   | No       | `10`    | Maximum requests for strict tier              |
| `RATE_LIMIT_STANDARD_MAX` | No       | `60`    | Maximum requests for standard tier            |
| `RATE_LIMIT_LENIENT_MAX`  | No       | `120`   | Maximum requests for lenient tier             |

### Storage

| Variable           | Required | Default | Description                     |
| ------------------ | -------- | ------- | ------------------------------- |
| `STORAGE_QUOTA_MB` | No       | `5`     | LocalStorage quota in megabytes |

### Circuit Breaker

| Variable                              | Required | Default | Description                             |
| ------------------------------------- | -------- | ------- | --------------------------------------- |
| `CIRCUIT_BREAKER_FAILURE_THRESHOLD`      | No       | `5`      | Number of failures before circuit opens |
| `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`       | No       | `60000`  | Time before attempting to close circuit |
| `CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS`    | No       | `3`      | Max calls in half-open state            |
| `CIRCUIT_BREAKER_COLD_START_WINDOW_MS`   | No       | `30000`  | Cold start window in ms before circuit breaker normal operation |

### Retry Configuration

| Variable                 | Required | Default | Description                                   |
| ------------------------ | -------- | ------- | --------------------------------------------- |
| `RETRY_MAX_RETRIES`      | No       | `3`     | Maximum number of retry attempts              |
| `RETRY_INITIAL_DELAY_MS` | No       | `1000`  | Initial delay between retries in milliseconds |
| `RETRY_BACKOFF_FACTOR`   | No       | `2`     | Exponential backoff multiplier                |
| `RETRY_MAX_DELAY_MS`     | No       | `10000` | Maximum delay between retries in milliseconds |

### External URLs

| Variable               | Required | Default                                       | Description                 |
| ---------------------- | -------- | --------------------------------------------- | --------------------------- |
| `PROJECT_HOMEPAGE_URL` | No       | `https://blueprint-generator.pages.dev`       | Public project homepage URL |
| `GITHUB_URL`           | No       | `https://github.com/cpa03/blueprintify`       | GitHub repository URL       |

---

## Frontend Environment Variables

The frontend is built with Vite and uses `.env` files.

| Variable                    | Required | Default                                       | Description                     |
| --------------------------- | -------- | --------------------------------------------- | ------------------------------- |
| `VITE_API_BASE_URL`         | No       | `/api`                                        | API base URL for requests       |
| `VITE_PROJECT_HOMEPAGE_URL` | No       | `https://blueprint-generator.pages.dev`       | Public project homepage URL     |
| `VITE_GITHUB_URL`           | No       | `https://github.com/cpa03/blueprintify`       | GitHub repository URL           |
| `VITE_STORAGE_QUOTA_MB`     | No       | `5`                                           | LocalStorage quota in megabytes |
| `VITE_APP_NAME`             | No       | `Blueprintify`                                | Application name                |
| `VITE_DEFAULT_PROJECT_NAME` | No       | `my-project`                                  | Default project name            |
| `VITE_ENABLE_ANALYTICS`     | No       | `false`                                       | Enable analytics tracking       |

---

## Cloudflare Bindings

The API uses Cloudflare Workers bindings for various services.

### D1 Database

| Binding | Type | Description                            |
| ------- | ---- | -------------------------------------- |
| `DB`    | D1   | SQLite database for persistent storage |

### KV Namespaces

| Binding | Type | Description                        |
| ------- | ---- | ---------------------------------- |
| `CACHE` | KV   | Cache namespace for temporary data |

### Workers AI

| Binding | Type       | Description                            |
| ------- | ---------- | -------------------------------------- |
| `AI`    | Workers AI | AI binding for server-side AI features |

### Rate Limiting

| Binding                 | Type       | Description             |
| ----------------------- | ---------- | ----------------------- |
| `STRICT_RATE_LIMITER`   | Rate Limit | 10 requests per minute  |
| `STANDARD_RATE_LIMITER` | Rate Limit | 60 requests per minute  |
| `LENIENT_RATE_LIMITER`  | Rate Limit | 120 requests per minute |

### Free Tier Limitations

The following bindings are **intentionally omitted** from `wrangler.toml` due to Cloudflare Free Tier constraints:

| Feature | Status | Reason |
|---------|--------|--------|
| Queues (`BACKGROUND_QUEUE`) | ❌ Disabled | Free Tier does not support Queues |
| Analytics Engine (`ANALYTICS`) | ❌ Disabled | Free Tier returns error 10089 |

Background processing runs inline (synchronously) instead of via Queues. Metrics are collected via Workers Observability Logs (`[observability.logs]` in `wrangler.toml`).

---

## Setup Instructions

### 1. API Setup

```bash
# Navigate to API directory
cd apps/api

# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your actual values
# Required: OPENAI_API_KEY (Recommended: API_KEY — protected endpoints return 503 when unset)
```

Example `.dev.vars`:

```bash
OPENAI_API_KEY=sk-xxxxx
API_KEY=your-secure-api-key
# Optional: admin key for RBAC admin role (takes precedence over API_KEY)
# ADMIN_API_KEY=your-admin-api-key
CORS_ORIGIN=http://localhost:3000
```

### 2. Frontend Setup

```bash
# Navigate to web directory
cd apps/web

# Copy the example file
cp .env.example .env

# Edit .env with your values (all optional)
```

### 3. Cloudflare Setup

`API_KEY` must be set as a Worker **secret**, never as a `[vars]` entry in
`wrangler.toml`. `[vars]` is committed plaintext and is read by every clone of
this repository.

```bash
# Set production secrets
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put API_KEY --env production

# Set staging secrets
wrangler secret put OPENAI_API_KEY --env staging
wrangler secret put API_KEY --env staging
```

The top-level (production) environment takes no `--env` flag:

```bash
wrangler secret put API_KEY
```

#### Blocking precondition: verify the secret before deploying

`API_KEY` is absent from `[vars]`, and `npm run validate:wrangler` — the first
command in `apps/api`'s `deploy` script, so it runs before every deploy — now
fails if it is ever declared there again, in either committed config
(`wrangler.toml`, or `wrangler.test.toml`, which the test pool loads and which is
just as public). Until the secret exists, every protected route fails closed with
`503 CONFIGURATION_ERROR` — the right behaviour for a known-compromised
credential, but a dark API. **Set the secret before, or together with, the
deploy. Not after.**

Verify it, from the repo root, while authenticated (`wrangler login` or
`CLOUDFLARE_API_TOKEN`):

```bash
npm run validate:secrets
```

This reads the Worker's secret names for **both** environments the runbook above
provisions — the top-level (production) Worker and `staging` — and names the
environment it is reporting on in every line, so a green result can never be
mistaken for covering an environment it did not check. It exits non-zero when
`API_KEY` is missing from either one. It needs Cloudflare credentials, so it is
deliberately **not** part of the offline CI gate — run it manually as a pre-merge
step. It fails rather than skips if it cannot reach Cloudflare, so a green result
always means the secret was actually seen.

It also fails with an explicit **"could not determine"** when Cloudflare answers
with something the script cannot read as a list of secret names — an
unrecognised or non-JSON response. That is a failure, not a pass, and it is
reported separately from "NOT provisioned" precisely so the two are never
confused: it means the environment was **not verified**, and must not be read as
"provisioned".

### API Key Rotation

An API key previously committed to `apps/api/wrangler.toml`, published in
`SHARED_DEFAULTS`, and compiled into the web bundle. It was readable by anyone
who cloned the repository or loaded the app, and remains readable in git
history, so **it must be treated as compromised and rotated regardless of this
change.**

Rotation has to happen in every location the old value was ever consumed:

| Location                   | Action                                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Worker, prod    | `wrangler secret put API_KEY`                                                                                                                                                                                                     |
| Cloudflare Worker, staging | `wrangler secret put API_KEY --env staging`                                                                                                                                                                                       |
| Any other deployed worker  | Same command against that worker, or its dashboard Secrets tab                                                                                                                                                                    |
| Web build (`VITE_API_KEY`) | Rebuild and redeploy with a **new** value in the same deploy as the Worker secret. Leave unset **only** if the Worker `API_KEY` secret is also unset (fully locked down) — otherwise the SPA sends no header and every protected call returns `401` |
| Local `apps/api/.dev.vars` | Replace the `API_KEY=` line                                                                                                                                                                                                       |
| Git history                | Treat as permanently public; rotate rather than rewrite history                                                                                                                                                                   |

Rotating the Worker secret is what actually revokes the old key. Anything
already built with the old value in `VITE_API_KEY` stays compromised until
rebuilt and redeployed. The two are not independent: the Worker secret and the
build-time value are read by the two halves of one request, so rotating one
without the other leaves either a locked-down API or a client that cannot
authenticate.

### Browser-shipped keys

`VITE_API_KEY` is inlined into the JavaScript bundle at build time. There is no
configuration in which a browser-delivered key stays secret — anything the
browser sends, an attacker can read. With `VITE_API_KEY` unset the client omits
the `x-api-key` header entirely and the API responds `401` on protected routes —
or `503 CONFIGURATION_ERROR` while the Worker `API_KEY` secret is unset too,
which is the state every environment is in until the runbook above has been run.

The Worker authenticates browsers from the same origin it serves the SPA on, so
the long-term fix is a server-side session rather than a shipped credential.
That is tracked as an open design decision, not an implemented feature: do not
treat `VITE_API_KEY` as a way to keep a secret private.

### 4. Verify Configuration

Run the development server and verify everything works:

```bash
# Start both services
npm run dev:all

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

---

## Environment-Specific Configuration

### Development (default)

- `ENVIRONMENT=development`
- `NODE_ENV=development`
- `CORS_ORIGIN=http://localhost:3000`
- Rate limiting: 60 requests per minute (standard tier)

### Testing

- `NODE_ENV=test`
- Rate limiting disabled
- Analytics disabled

### Staging

- `NODE_ENV=staging`
- Custom domain: `api-staging.blueprintify.dev`
- Production-like settings with test data

### Production

- `NODE_ENV=production`
- Custom domain: `api.blueprintify.dev`
- Full rate limiting enabled
- Analytics enabled

---

## Security Notes

1. **Never commit `.dev.vars` or `.env` files** - Add them to `.gitignore`
2. **Use secrets for production** - Never hardcode API keys in `wrangler.toml`
3. **Rotate keys regularly** - Update API keys periodically
4. **Restrict CORS origins** - Don't use `*` in production
5. **Monitor rate limits** - Adjust thresholds based on traffic patterns
