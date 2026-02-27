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

| Variable             | Required | Default                     | Description                                                  |
| -------------------- | -------- | --------------------------- | ------------------------------------------------------------ |
| `OPENAI_API_KEY`     | Yes      | -                           | Your OpenAI API key for AI completions                       |
| `OPENAI_BASE_URL`    | No       | `https://api.openai.com/v1` | Custom API base URL for OpenAI-compatible endpoints          |
| `OPENAI_MODEL`       | No       | `gpt-4o-mini`               | Model to use for completions                                 |
| `OPENAI_TIMEOUT_MS`  | No       | `60000`                     | Request timeout in milliseconds                              |
| `OPENAI_MAX_TOKENS`  | No       | `4000`                      | Maximum tokens per request                                   |
| `OPENAI_TEMPERATURE` | No       | `0.7`                       | Sampling temperature (0-2)                                   |
| `CORS_ORIGIN`        | No       | `*`                         | Allowed CORS origins (comma-separated)                       |
| `CORS_MAX_AGE`       | No       | `86400`                     | CORS preflight cache duration in seconds                     |
| `API_KEY`            | Recommended | -                           | API authentication key. If not set, protected endpoints return 503 
| `ENVIRONMENT`        | No       | `development`               | Runtime environment (`development`, `staging`, `production`) |

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
| `CIRCUIT_BREAKER_FAILURE_THRESHOLD`   | No       | `5`     | Number of failures before circuit opens |
| `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`    | No       | `60000` | Time before attempting to close circuit |
| `CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS` | No       | `3`     | Max calls in half-open state            |

### Retry Configuration

| Variable                 | Required | Default | Description                                   |
| ------------------------ | -------- | ------- | --------------------------------------------- |
| `RETRY_MAX_RETRIES`      | No       | `3`     | Maximum number of retry attempts              |
| `RETRY_INITIAL_DELAY_MS` | No       | `1000`  | Initial delay between retries in milliseconds |
| `RETRY_BACKOFF_FACTOR`   | No       | `2`     | Exponential backoff multiplier                |
| `RETRY_MAX_DELAY_MS`     | No       | `10000` | Maximum delay between retries in milliseconds |

### External URLs

| Variable               | Required | Default | Description                 |
| ---------------------- | -------- | ------- | --------------------------- |
| `PROJECT_HOMEPAGE_URL` | No       | -       | Public project homepage URL |
| `GITHUB_URL`           | No       | -       | GitHub repository URL       |

---

## Frontend Environment Variables

The frontend is built with Vite and uses `.env` files.

| Variable                    | Required | Default        | Description                     |
| --------------------------- | -------- | -------------- | ------------------------------- |
| `VITE_API_BASE_URL`         | No       | `/api`         | API base URL for requests       |
| `VITE_PROJECT_HOMEPAGE_URL` | No       | -              | Public project homepage URL     |
| `VITE_GITHUB_URL`           | No       | -              | GitHub repository URL           |
| `VITE_STORAGE_QUOTA_MB`     | No       | `5`            | LocalStorage quota in megabytes |
| `VITE_APP_NAME`             | No       | `Blueprintify` | Application name                |
| `VITE_DEFAULT_PROJECT_NAME` | No       | `my-project`   | Default project name            |
| `VITE_ENABLE_ANALYTICS`     | No       | `false`        | Enable analytics tracking       |

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

### Queues

| Binding            | Type  | Description                         |
| ------------------ | ----- | ----------------------------------- |
| `BACKGROUND_QUEUE` | Queue | Queue for background job processing |

### Rate Limiting

| Binding                 | Type       | Description             |
| ----------------------- | ---------- | ----------------------- |
| `STRICT_RATE_LIMITER`   | Rate Limit | 10 requests per minute  |
| `STANDARD_RATE_LIMITER` | Rate Limit | 60 requests per minute  |
| `LENIENT_RATE_LIMITER`  | Rate Limit | 120 requests per minute |

### Analytics

| Binding     | Type             | Description                   |
| ----------- | ---------------- | ----------------------------- |
| `ANALYTICS` | Analytics Engine | Production metrics collection |

---

## Setup Instructions

### 1. API Setup

```bash
# Navigate to API directory
cd apps/api

# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your actual values
# Required: OPENAI_API_KEY and API_KEY
```

Example `.dev.vars`:

```bash
OPENAI_API_KEY=sk-xxxxx
API_KEY=your-secure-api-key
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

For production deployments, secrets should be set via Wrangler:

```bash
# Set production secrets
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put API_KEY --env production

# Set staging secrets
wrangler secret put OPENAI_API_KEY --env staging
wrangler secret put API_KEY --env staging
```

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
- `CORS_ORIGIN=http://localhost:3000`
- Rate limiting: 100 requests per window

### Staging

- `ENVIRONMENT=staging`
- Custom domain: `api-staging.blueprintify.dev`
- Production-like settings with test data

### Production

- `ENVIRONMENT=production`
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
