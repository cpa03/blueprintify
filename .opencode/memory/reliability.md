# Reliability Engineering Memory

> Patterns, conventions, and lessons learned for system reliability and stability.

## Reliability Patterns Implemented

### Error Handling

- **Error Boundary**: React ErrorBoundary wraps entire app (`apps/web/src/components/ErrorBoundary.tsx`)
- **Global Error Handler**: Hono error handler middleware (`apps/api/src/middleware/errorHandler.ts`)
- **Typed Errors**: Custom error classes with status codes (`DatabaseError`, `NotFoundError`, `TimeoutError`, `CircuitBreakerOpenError`)
- **Safe JSON Parsing**: All `JSON.parse` calls wrapped in try/catch with typed error handling

### Timeout Handling

- **AbortController**: All API calls use AbortController with configurable timeouts
- **Timeout Utility**: `withTimeout()` and `withTimeoutAndRetry()` in `apps/api/src/utils/timeout.ts`
- **Timeout Constants**: `TIMEOUTS.API_CONNECTION` (30s), `TIMEOUTS.API_HEALTH_CHECK` (5s)

### Circuit Breaker

- **Implementation**: `apps/api/src/utils/circuitBreaker.ts`
- **States**: CLOSED, OPEN, HALF_OPEN
- **Default Config**:
  - `failureThreshold`: 5
  - `resetTimeoutMs`: 30000
  - `halfOpenMaxCalls`: 3

### Retry Logic

- **Implementation**: `apps/api/src/utils/retry.ts`
- **Exponential Backoff**: Default initial delay 1000ms, backoff factor 2
- **Retryable Status Codes**: 429 (rate limit), 500+ (server errors)
- **Retryable Error Codes**: ECONNRESET, ETIMEDOUT, ENOTFOUND, EAI_AGAIN

### Rate Limiting

- **Middleware**: `apps/api/src/middleware/rateLimit.ts`
- **Cloudflare-based**: Uses Cloudflare Rate Limiting API when configured
- **Warning Logs**: Logs warning when rate limiter not configured for observability

### Input Validation

- **Zod Schemas**: All API endpoints use Zod validation
- **Security Validation**: `validateJSONSecurity()` for JSON content with prototype pollution protection
- **DOMPurify**: XSS protection with forbidden attributes (`formaction`)

### Storage Recovery

- **Backup System**: Automatic backup before writes
- **Recovery Flow**: Automatic recovery from backups on corruption
- **Migration Support**: Version-based schema migration

## Lessons Learned

### 2026-02-21 - Memory File Creation

Created this reliability memory file as it was referenced in the reliability-engineer agent but didn't exist. This provides future sessions with context about implemented patterns.

### 2026-02-20 - Rate Limiter Observability

Added warning log when rate limiter binding is not configured. This improves security awareness without changing behavior (rate limiting still bypasses in development).

### 2026-02-20 - Typed Error Classes

Replaced generic `Error` throws with typed `NotFoundError` in `MockDatabaseService`. Enables callers to use `instanceof` for proper error type discrimination.

### 2026-02-18 - ErrorBoundary Implementation

Added React ErrorBoundary to prevent white-screen crashes. Includes user-friendly fallback UI with recovery options and error details for debugging.

### 2026-02-18 - deserializeJSON Safety

Wrapped `JSON.parse` in `deserializeJSON` with try/catch that throws typed `DatabaseError`. Prevents unhandled exceptions from malformed JSON.

## Reliability Checklist

When reviewing code for reliability:

1. [ ] All async operations have try/catch
2. [ ] JSON.parse calls are wrapped
3. [ ] Timeouts are set on external calls
4. [ ] Fallbacks exist for failed data fetches
5. [ ] Input is validated at boundaries
6. [ ] Errors are logged (use `secureLogError`/`secureLogWarn`)
7. [ ] No silent error swallowing
8. [ ] Rate limiting is configured for production

## Key Files

| File                                        | Purpose                                |
| ------------------------------------------- | -------------------------------------- |
| `apps/api/src/utils/timeout.ts`             | AbortController-based timeout          |
| `apps/api/src/utils/circuitBreaker.ts`      | Circuit breaker pattern                |
| `apps/api/src/utils/retry.ts`               | Exponential backoff retry              |
| `apps/api/src/middleware/errorHandler.ts`   | Global error handling                  |
| `apps/api/src/middleware/rateLimit.ts`      | Rate limiting middleware               |
| `apps/web/src/components/ErrorBoundary.tsx` | React error boundary                   |
| `apps/web/src/lib/storage.ts`               | Resilient storage with backup/recovery |
| `apps/web/src/lib/security.ts`              | Input validation and sanitization      |

## Anti-Patterns to Avoid

- **Empty catch blocks**: Never swallow errors silently
- **Infinite waits**: Always set timeouts on async operations
- **Generic errors**: Use typed error classes for proper handling
- **Hardcoded values**: Use constants from config
- **Missing null checks**: Validate data from external sources
- **Untrusted input**: Always validate at API boundaries
