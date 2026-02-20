# Security Patterns & Conventions

## Policies

- OWASP Top 10 mitigation.
- Zero Trust Architecture.
- Constant-time comparison for all secret/token validation.
- CI/CD security: Standardized runner versions (`ubuntu-24.04-arm`) and action versions across all workflows.
- Regular security audits (monthly recommended).

## Current Security Status (2026-02-20 09:35 UTC)

| Control             | Status                                |
| ------------------- | ------------------------------------- |
| Hardcoded Secrets   | ✅ None found                         |
| XSS Vectors         | ✅ No dangerouslySetInnerHTML         |
| Code Injection      | ✅ No eval/innerHTML                  |
| Input Validation    | ✅ Zod schemas                        |
| Auth Timing Attacks | ✅ Constant-time compare              |
| Secure Random       | ✅ crypto.getRandomValues()           |
| Security Headers    | ✅ Hono secureHeaders()               |
| Secure Logging      | ✅ Sensitive data redaction           |
| HTML Sanitization   | ✅ DOMPurify configured               |
| Rate Limiting       | ✅ Cloudflare rate limiter            |
| npm audit           | ⚠️ 19 vulnerabilities (dev deps only) |

## Lessons Learned

### 2026-02-20 09:35 UTC: Security Engineer Audit - Secure Logging Gap Fixed

- **Finding**: Import and export routes used inline error handling without secure logging
- **Root Cause**: Routes implemented custom try-catch blocks that didn't use `secureLogError`
- **Risk**: Potential information leakage through logs if errors contained sensitive data
- **Fix**: Added `secureLogError` calls to import.ts and export.ts error handlers
- **Lesson**: All error handlers should use secure logging utilities to maintain consistent log sanitization

### 2026-02-20 05:58 UTC: Security Engineer Audit - Posture Maintained

- **Finding**: Follow-up security audit confirmed all controls remain effective
- **Observation**: No new security issues found; codebase maintains excellent security posture
- **npm audit**: 19 vulnerabilities (1 low, 1 moderate, 17 high) - all in dev-only dependencies (eslint, lighthouse, vitest)
- **Secrets scan**: No hardcoded secrets found
- **XSS scan**: No dangerouslySetInnerHTML, eval(), or innerHTML usage
- **Action**: Added JSDoc documentation to rate limiting middleware for security clarity
- **Lesson**: Regular security audits confirm controls remain effective over time

### 2026-02-19 21:00 UTC: Security Engineer Audit - Posture Maintained

- **Finding**: Follow-up security audit confirmed all controls remain effective
- **Observation**: No new security issues found; codebase maintains excellent security posture
- **npm audit**: 19 vulnerabilities (1 low, 1 moderate, 17 high) - all in dev-only dependencies (eslint, lighthouse)
- **Secrets scan**: No hardcoded secrets found (only test data in test files)
- **Action**: No immediate fixes required; continue monitoring
- **Lesson**: Regular security audits confirm controls remain effective over time

### 2026-02-19: Security Audit - Excellent Posture Confirmed

- **Finding**: Full security audit completed - all major controls passing
- **Observation**: Codebase has excellent security posture with recent hardening (timing attacks, crypto IDs, secure logging, DOMPurify)
- **Blocker**: CI workflow standardization requires GitHub App `workflows` permission (tracked in #483)
- **npm audit**: 18 vulnerabilities in dev-only dependencies - risk accepted
- **Lesson**: Regular audits confirm security controls remain effective

### 2026-02-19: CI Workflow Security Standardization

- **Finding**: `on pull.yml` workflow used outdated runner (`ubuntu-22.04-arm`) and invalid action versions (`@v6`)
- **Root Cause**: Workflow not kept in sync with project standards defined in AGENTS.md
- **Risk**: Inconsistent CI environments, potential workflow failures from non-existent action versions
- **Fix**: Requires GitHub App `workflows` permission - tracked in #483
- **Lesson**: CI workflow configurations should be audited regularly for version consistency and security compliance

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

### 2026-02-19: Secure Error Logging Implementation

- **Finding**: Error logs contained full error objects with stack traces and potentially sensitive data
- **Root Cause**: Direct `console.error` calls logged raw error information without sanitization
- **Risk**: Information leakage through logs (API keys, file paths, database connection strings)
- **Fix**: Created `secureLog.ts` utility with pattern-based sanitization for sensitive data
- **Lesson**: All error logging should sanitize output to prevent OWASP A09:2021 (Security Logging and Monitoring Failures)

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
