# Reliability Engineering Patterns & Conventions

## Core Reliability Patterns

This document captures the reliability patterns implemented in the Blueprintify codebase. These patterns ensure system stability, fault tolerance, and graceful degradation.

### 1. Error Handling

#### API Layer (Backend)

- **Error Classes**: Hierarchical error types in `apps/api/src/errors.ts`
  - `APIError` - Base class with type, statusCode, code, details
  - `ValidationError` (400) - Request validation failures
  - `AuthenticationError` (401) - Missing/invalid credentials
  - `AuthorizationError` (403) - Permission denied
  - `NotFoundError` (404) - Resource not found
  - `ConfigurationError` (500) - Server config issues
  - `NetworkError` (502) - External service failures
  - `AIServiceError` (502) - AI provider failures
  - `InternalServerError` (500) - Catch-all for unhandled errors

- **Error Handler Middleware**: `apps/api/src/middleware/errorHandler.ts`
  - Centralized error handling for all routes
  - Handles `TimeoutError`, `CircuitBreakerOpenError`, Zod validation errors
  - Returns standardized error responses with requestId

#### Frontend Layer

- **Error Boundary**: `apps/web/src/components/ErrorBoundary.tsx`
  - Catches JavaScript errors in React component tree
  - Displays fallback UI instead of white screen
  - Provides error recovery options

- **API Error Handling**: `apps/web/src/lib/api.ts`
  - Retry logic with exponential backoff
  - Timeout handling with AbortController
  - Graceful degradation on network failures

### 2. Circuit Breaker Pattern

**Location**: `apps/api/src/utils/circuitBreaker.ts`

Implements the Circuit Breaker pattern to prevent cascading failures:

- **States**: CLOSED (normal), OPEN (blocked), HALF_OPEN (testing)
- **Configuration**:
  - `failureThreshold` - Consecutive failures before opening
  - `resetTimeoutMs` - Time before attempting recovery
  - `halfOpenMaxCalls` - Test calls in half-open state
- **Usage**: OpenAI service wrapped with circuit breaker protection

```typescript
// Example usage
const breaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  halfOpenMaxCalls: 3,
});

const result = await breaker.execute(() => fetchExternalAPI());
```

### 3. Retry Logic

**Location**: `apps/api/src/utils/retry.ts`

Exponential backoff retry for transient failures:

- **Configuration**:
  - `retries` - Maximum retry attempts
  - `initialDelay` - First retry delay (ms)
  - `backoffFactor` - Multiplier for subsequent delays
- **Retryable Errors**:
  - Rate limit (429)
  - Server errors (5xx)
  - Network errors (ECONNRESET, ETIMEDOUT, etc.)

### 4. Timeout Handling

**Location**: `apps/api/src/utils/timeout.ts`

Prevents operations from hanging indefinitely:

- **AbortController-based**: Clean cancellation of async operations
- **TimeoutError**: Custom error with timeout duration
- **Combined with Retry**: `withTimeoutAndRetry()` for resilient operations

```typescript
// Example usage
const result = await withTimeout(() => fetchData(), { timeoutMs: 5000 });
```

### 5. Rate Limiting

**Location**: `apps/api/src/middleware/rateLimit.ts`

Cloudflare Workers rate limiting:

- **Limiters**:
  - `STRICT_RATE_LIMITER` - Sensitive endpoints
  - `STANDARD_RATE_LIMITER` - General API
  - `LENIENT_RATE_LIMITER` - Read-heavy endpoints
- **Graceful Fallback**: Logs warning when rate limiter not configured (test environments)
- **Headers**: Returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### 6. Storage Reliability

**Location**: `apps/web/src/lib/storage.ts`

Robust localStorage operations:

- **Error Types**: QUOTA_EXCEEDED, CORRUPTED_DATA, SERIALIZATION_ERROR, etc.
- **Backup System**: Automatic backups with recovery
- **Schema Migration**: Version-based data migration
- **Health Monitoring**: Quota tracking, operation metrics
- **Browser Compatibility**: Graceful degradation for unsupported browsers

## Best Practices

### DO

- Always wrap external API calls with try/catch
- Use AbortController for fetch operations with timeout
- Implement circuit breakers for external service dependencies
- Provide fallback values for optional data (`data || []`)
- Log errors with context for debugging
- Use type guards for error handling (`isAPIError(error)`)

### DON'T

- Never suppress errors silently - always log or handle
- Never use `as any` to bypass type checking
- Never leave promises without `.catch()` handling
- Never assume network requests will succeed
- Never hardcode timeout values - use configuration

## Configuration Reference

### Environment Variables (API)

| Variable                              | Description                   | Default |
| ------------------------------------- | ----------------------------- | ------- |
| `CIRCUIT_BREAKER_FAILURE_THRESHOLD`   | Failures before circuit opens | 5       |
| `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`    | Recovery timeout              | 30000   |
| `CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS` | Test calls in half-open       | 3       |
| `RATE_LIMIT_WINDOW_MS`                | Rate limit window             | 60000   |
| `RATE_LIMIT_STRICT_MAX`               | Strict limit                  | 10      |
| `RATE_LIMIT_STANDARD_MAX`             | Standard limit                | 100     |
| `OPENAI_TIMEOUT_MS`                   | AI request timeout            | 60000   |

### Frontend Timeouts

| Constant                    | Value   | Purpose                |
| --------------------------- | ------- | ---------------------- |
| `TIMEOUTS.API_CONNECTION`   | 30000ms | Initial API connection |
| `TIMEOUTS.API_HEALTH_CHECK` | 5000ms  | Health check timeout   |

## Lessons Learned

### 2026-02-21: Reliability Memory Created

- Documented existing reliability patterns in codebase
- Codebase has comprehensive error handling, circuit breakers, retry logic
- Rate limiting gracefully falls back when Cloudflare bindings unavailable
- Storage module has robust error handling with backup/recovery

### Rate Limiter Warning in Tests

The warning `Rate limiter 'STANDARD_RATE_LIMITER' not configured - rate limiting disabled` is expected in test environments where Cloudflare rate limiter bindings are not available. This is by design - the code gracefully falls back.

### Circuit Breaker for AI Service

The OpenAI service is wrapped with circuit breaker protection to prevent cascading failures when the AI provider is unavailable. This ensures the API returns a proper error response instead of hanging or timing out.

## Related Files

- `apps/api/src/errors.ts` - Error classes and types
- `apps/api/src/middleware/errorHandler.ts` - Error handling middleware
- `apps/api/src/utils/circuitBreaker.ts` - Circuit breaker implementation
- `apps/api/src/utils/retry.ts` - Retry logic with backoff
- `apps/api/src/utils/timeout.ts` - Timeout utilities
- `apps/api/src/middleware/rateLimit.ts` - Rate limiting middleware
- `apps/api/src/services/openai.ts` - AI service with circuit breaker
- `apps/web/src/lib/api.ts` - Frontend API with retry/timeout
- `apps/web/src/lib/storage.ts` - Robust storage layer
- `apps/web/src/components/ErrorBoundary.tsx` - React error boundary
