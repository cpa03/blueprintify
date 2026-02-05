# Infrastructure as Code Configuration

## Cloudflare Workers Infrastructure

### Production Environment

- **Worker Name**: blueprint-generator-api
- **Environment**: production
- **Domain**: blueprint-generator-api.workers.dev
- **Region**: Global (Cloudflare edge network)

### Staging Environment

- **Worker Name**: blueprint-generator-api-staging
- **Environment**: staging
- **Domain**: blueprint-generator-api-staging.workers.dev
- **Region**: Global (Cloudflare edge network)

### Development Environment

- **Worker Name**: blueprint-generator-api-dev
- **Environment**: development
- **Domain**: blueprint-generator-api-dev.workers.dev
- **Region**: Global (Cloudflare edge network)

## Required Secrets

### Production

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers permissions
- `OPENAI_API_KEY_PRODUCTION`: OpenAI API key for production
- `OPENAI_BASE_URL_PRODUCTION`: OpenAI base URL (optional)

### Staging

- `OPENAI_API_KEY_STAGING`: OpenAI API key for staging
- `OPENAI_BASE_URL_STAGING`: OpenAI base URL (optional)

### Development

- `OPENAI_API_KEY_DEVELOPMENT`: OpenAI API key for development
- `OPENAI_BASE_URL_DEVELOPMENT`: OpenAI base URL (optional)

## Environment Variables

All environments share:

- `ENVIRONMENT`: Environment identifier (production/staging/development)

## Deployment Pipeline

1. **Development**: Auto-deploy on push to `main` branch
2. **Staging**: Auto-deploy on push to `main` and `develop` branches
3. **Production**: Manual deployment on tag creation or release

## Monitoring & Observability

### Health Checks

- Endpoint: `/` (returns service status)
- Expected Response: `{"status": "ok", "environment": "<env>"}`

### Metrics to Track

- Request latency
- Error rates
- Request count
- OpenAI API usage

### Alerting Thresholds

- Error rate > 5% for 5 minutes
- Latency > 2 seconds for 5 minutes
- Health check failures > 3 consecutive

## Security Configuration

### CORS

- Allow origins: Production domain, staging domain
- Allow methods: GET, POST, OPTIONS
- Allow headers: Content-Type, Authorization

### Rate Limiting

- 100 requests per minute per IP
- Burst allowance: 20 requests

### Input Validation

- All API endpoints validate input with Zod schemas
- Sanitize all user inputs
- Validate OpenAI API responses
