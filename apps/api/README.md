# Blueprint Generator API

> Cloudflare Workers backend for AI-powered project architecture documentation generation.

## Overview

The API is a Cloudflare Workers application built with [Hono](https://hono.dev/) framework. It provides endpoints for generating blueprints, tasks, and refining content using OpenAI's AI models.

## Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/) v4
- **Validation**: [Zod](https://zod.dev/)
- **AI**: [OpenAI SDK](https://github.com/openai/openai-node)
- **Testing**: [Vitest](https://vitest.dev/) with [@cloudflare/vitest-pool-workers](https://github.com/cloudflare/vitest-pool-workers)

## Quick Start

### Prerequisites

- Node.js 22+
- npm 8+
- Cloudflare account (for deployment)

### Installation

```bash
# Install dependencies from root
npm install

# The API uses shared package - ensure it's built
npm run build --workspace=@blueprint/shared
```

### Environment Variables

Copy the example file and configure:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
```

Edit `apps/api/.dev.vars` and set your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

```bash
# Start API development server (port 8787)
npm run dev:api

# Or from this directory
cd apps/api
npm run dev
```

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test -- --ui

# Run tests with coverage
npm run test -- --coverage
```

### Build

```bash
# Dry-run build (for validation)
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## API Endpoints

| Method | Endpoint          | Description                                    |
| ------ | ----------------- | ---------------------------------------------- |
| GET    | `/`               | Health check - returns API metadata            |
| POST   | `/generate`       | Generate blueprint from project config (SSE)   |
| POST   | `/tasks`          | Generate tasks from blueprint content (SSE)    |
| POST   | `/refine`         | Refine specific content sections (SSE)         |
| POST   | `/export`         | Export project data (ZIP/JSON/Markdown)        |
| POST   | `/import`         | Import project data with validation            |
| GET    | `/storage/quota`  | Check storage usage                            |
| POST   | `/storage/report` | Report client storage usage for quota tracking |
| DELETE | `/storage/clear`  | Clear stored data                              |
| POST   | `/share`          | Create shareable blueprint link                |
| GET    | `/share/:id`      | Retrieve shared blueprint                      |
| DELETE | `/share/:id`      | Delete shared blueprint                        |

## Project Structure

```
apps/api/
├── src/
│   ├── config/          # Environment and constants configuration
│   │   ├── constants.ts # API endpoints, error codes, prompt templates
│   │   ├── env.ts       # Environment variable loading
│   │   ├── env.test.ts  # Environment variable tests
│   │   ├── prompt-security.ts # Prompt security validation
│   │   └── prompts/     # AI system prompt templates (.ts)
│   │       ├── architect.ts
│   │       ├── refiner.ts
│   │       └── task-splitter.ts
│   ├── controllers/     # Request handlers
│   │   ├── base.controller.ts
│   │   ├── generate.controller.ts
│   │   ├── tasks.controller.ts
│   │   └── refine.controller.ts
│   ├── di/             # Dependency injection container
│   │   ├── container.ts
│   │   └── index.ts
│   ├── errors.ts       # Custom error classes
│   ├── middleware/     # Hono middleware
│   │   ├── auth.ts         # API key authentication
│   │   ├── bodyLimit.ts    # Request body size limits
│   │   ├── errorHandler.ts # Global error handling
│   │   ├── logger.ts      # Request logging
│   │   ├── rateLimit.ts   # Rate limiting
│   │   └── validator.ts   # Zod validation middleware
│   ├── routes/         # Route definitions
│   │   ├── generate.ts
│   │   ├── tasks.ts
│   │   ├── refine.ts
│   │   ├── export.ts
│   │   ├── import.ts
│   │   ├── storage.ts
│   │   └── share.ts
│   ├── services/        # Business logic
│   │   ├── openai.ts   # OpenAI API client
│   │   └── prompts.ts  # Prompt management
│   ├── utils/          # Utility functions
│   │   ├── circuitBreaker.ts
│   │   ├── retry.ts
│   │   ├── secureLog.ts
│   │   ├── stream.ts   # SSE utilities
│   │   └── timeout.ts
│   ├── index.ts        # Main entry point
│   └── types.ts        # TypeScript type definitions
├── wrangler.toml       # Cloudflare Workers configuration
├── vitest.config.ts    # Test configuration
└── package.json
```

## Key Features

### Streaming Responses

All generation endpoints use Server-Sent Events (SSE) for real-time streaming:

```typescript
// Example SSE response handling
const response = await fetch('/generate', {
  method: 'POST',
  body: JSON.stringify({ projectName: 'My App', ... }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  console.log(chunk); // Process SSE chunk
}
```

### Rate Limiting

- Standard endpoints: 100 requests/minute
- Strict endpoints: 30 requests/minute
- Lenient endpoints: 300 requests/minute

### Error Handling

All errors return consistent JSON responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [...]
  }
}
```

### Security

- API key authentication (except health check)
- Request body size limits
- CORS configuration
- Input validation with Zod

## Testing

Tests are co-located with source files using `.test.ts` suffix:

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/routes/generate.test.ts

# Run in watch mode
npm run test -- --watch
```

## Deployment

### To Cloudflare Workers

```bash
npm run deploy
```

### Environment Configuration

Required secrets (set via Cloudflare Dashboard or CLI):

```bash
wrangler secret put OPENAI_API_KEY
```

Optional configuration variables:

| Variable          | Default        | Description         |
| ----------------- | -------------- | ------------------- |
| `OPENAI_BASE_URL` | OpenAI default | Custom API endpoint |
| `OPENAI_MODEL`    | gpt-4o-mini    | Model to use        |
| `CORS_ORIGIN`     | \*             | Allowed CORS origin |

### Required Infrastructure

Before deploying to Cloudflare Workers, the following resources must be created and their IDs must be set in `wrangler.toml`.

> ⚠️ **Warning**: `wrangler.toml` currently contains placeholder IDs (`local_database_id`, `cache_kv_namespace_id`, etc.). Real IDs must be substituted before production deployment. See the `TODO` comments and `# ⚠️ PLACEHOLDER` markers in the file.

#### 1. KV Namespace (for caching)

```bash
# Create a KV namespace for each environment
wrangler kv:namespace create "blueprint-cache"
# → Returns an ID. Set it in wrangler.toml [[kv_namespaces]] id field.

# Repeat for production (create with separate namespace)
wrangler kv:namespace create "blueprint-cache-prod" --env production
```

#### 2. D1 Database (for blueprint storage)

```bash
# Create a D1 database for each environment
wrangler d1 create "blueprint-db"
# → Returns a database_id. Set it in wrangler.toml [[d1_databases]] database_id field.

wrangler d1 create "blueprint-db-prod" --env production
wrangler d1 create "blueprint-db-staging" --env staging
```

#### 3. Queue (for background processing)

The queue `background-processing` is referenced in `wrangler.toml`. Create it via:

```bash
wrangler queue create background-processing
wrangler queue create background-processing-staging --env staging
```

#### 4. Rate Limiting

The rate limiter namespace IDs (`1001`, `1002`, `1003` etc.) are pre-configured. No additional setup is needed for Cloudflare Native Rate Limiting.

> **Tip**: Run `grep -n "TODO\|PLACEHOLDER" apps/api/wrangler.toml` after setup to verify all placeholders have been replaced.

## Related Documentation

- [Main README](../../README.md)
- [API Documentation](../../docs/api-documentation.md)
- [M2 Technical Approach](../../docs/m2-technical-approach.md)
