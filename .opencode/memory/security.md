# Security Patterns & Conventions

## Policies

- OWASP Top 10 mitigation.
- Zero Trust Architecture.
- Constant-time comparison for all secret/token validation.

## Lessons Learned

### 2026-02-19: Insecure Random ID Generation in Share Endpoint

- **Finding**: `generateShareId()` used `Math.random()` which is not cryptographically secure
- **Root Cause**: `Math.random()` is predictable and can be reverse-engineered by attackers
- **Risk**: ID prediction attacks could allow unauthorized access to shared blueprints
- **Fix**: Replaced with `crypto.getRandomValues()` for cryptographically secure random generation
- **Lesson**: All security-sensitive random values (IDs, tokens, nonces) must use `crypto.getRandomValues()` or equivalent CSPRNG

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

### 2026-02-19: Security Headers Enhancement

- **Finding**: Missing modern security headers (Permissions-Policy, HSTS)
- **Root Cause**: Headers function was created before these became standard
- **Fix**: Added `Permissions-Policy` header to disable unnecessary browser features and `Strict-Transport-Security` for HTTPS enforcement
- **Lesson**: Security headers should be reviewed regularly as web standards evolve

### 2026-02-19: DOMPurify Configuration Hardening

- **Finding**: Missing `rel` attribute in ALLOWED_ATTR and `formaction` in FORBID_ATTR
- **Root Cause**: Configuration wasn't covering all attack vectors for links and forms
- **Fix**: Added `rel` to ALLOWED_ATTR (for safe external links with noopener/noreferrer) and `formaction` to FORBID_ATTR (prevents form-based XSS)
- **Lesson**: HTML sanitization configs should be reviewed against latest XSS vectors

## Security Checklist

- [x] No hardcoded secrets in codebase
- [x] Environment variables used for sensitive configuration
- [x] Input validation with Zod schemas
- [x] Rate limiting implemented
- [x] Security headers via Hono middleware
- [x] CORS properly configured
- [x] Constant-time comparison for auth tokens
- [x] Circuit breaker for external dependencies
- [x] Cryptographically secure random ID generation
- [x] Permissions-Policy header (browser features disabled)
- [x] HSTS header (HTTPS enforcement)
- [x] DOMPurify with formaction forbidden
- [ ] Consider distributed rate limiting for production scale
