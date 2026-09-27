# Integration Engineering Patterns & Conventions

## Integration Philosophy

- **Isolate External Calls**: Wrap external APIs in service classes
- **Resilience First**: Networks are unreliable. Plan for failure.
- **Secrets Management**: NEVER hardcode API keys. Use `process.env`.

## Integration Patterns

### 1. Service Client Pattern

```typescript
// Isolate external calls in a service class
class ExternalAPIClient {
  constructor(private config: { apiKey: string; baseUrl: string }) {}

  async fetchData(id: string): Promise<Data> {
    // Implementation with error handling
  }
}
```

### 2. Retry with Backoff

- Use exponential backoff for transient failures
- Maximum 3 retries for non-critical operations
- Implement circuit breaker for critical paths

### 3. Timeout Handling

- Every external call MUST have a timeout
- Use AbortController for clean cancellation
- Default timeout: 30 seconds

### 4. Error Handling

- Catch and transform external errors to internal types
- Log sanitized request/response for debugging
- Provide meaningful error messages

## Webhook Handling

### Signature Verification

- Always verify webhook signatures
- Use constant-time comparison for HMAC validation
- Reject invalid signatures with 401

### Idempotency

- Process webhooks idempotently
- Use unique event IDs for deduplication
- Handle duplicate deliveries gracefully

## Third-Party Integrations

### Current Integrations

| Service       | Purpose               | Config Location  |
| ------------- | --------------------- | ---------------- |
| OpenAI        | AI content generation | `OPENAI_API_KEY` |
| Cloudflare KV | Caching               | `CACHE` binding  |
| Cloudflare D1 | Database              | `DB` binding     |

### Integration Checklist

- [ ] API key stored in environment variables
- [ ] Timeout configured for all requests
- [ ] Retry logic implemented
- [ ] Error handling with proper types
- [ ] Logging (sanitized) for debugging
- [ ] Rate limit respected

## Lessons Learned

- **Rate Limits**: Always respect third-party rate limits
- **Timeouts**: External services can hang. Always set timeouts.
- **Mocking**: Use `nock` or similar for testing external integrations

## Related Files

- `apps/api/src/services/openai.ts` - OpenAI integration
- `apps/api/src/utils/retry.ts` - Retry logic
- `apps/api/src/utils/circuitBreaker.ts` - Circuit breaker pattern
