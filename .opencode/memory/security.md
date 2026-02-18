# Security Patterns & Conventions

## Policies

- OWASP Top 10 mitigation.
- Zero Trust Architecture.
- Constant-time comparison for all secret/token validation.

## Lessons Learned

### 2026-02-18: AJV Dependency Vulnerability (Issue #418)

- **Finding**: 9 moderate vulnerabilities in `ajv` package (ReDoS via `$data` option)
- **Root Cause**: Upstream dependency via `@eslint/eslintrc` - cannot fix at project level
- **Risk Assessment**: LOW - development-only dependency, not in production bundle
- **Resolution**: Risk accepted, documented in `docs/security/assessment-ajv-vulnerabilities.md`
- **Lesson**: Always assess actual exploitability before panic-fixing dependency vulnerabilities

### 2026-02-18: Timing Attack Vulnerability in Auth Middleware

- **Finding**: API key comparison used direct string equality (`===`) which is vulnerable to timing attacks
- **Root Cause**: JavaScript string comparison is not constant-time
- **Fix**: Implemented `constantTimeCompare()` using XOR-based comparison
- **Lesson**: All secret/token comparisons must use constant-time algorithms to prevent timing side-channel attacks

## Security Checklist

- [x] No hardcoded secrets in codebase
- [x] Environment variables used for sensitive configuration
- [x] Input validation with Zod schemas
- [x] Rate limiting implemented
- [x] Security headers via Hono middleware
- [x] CORS properly configured
- [x] Constant-time comparison for auth tokens
- [x] Circuit breaker for external dependencies
- [ ] Consider distributed rate limiting for production scale
