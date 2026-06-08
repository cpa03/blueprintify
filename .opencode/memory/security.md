# Security Patterns & Conventions

## Policies

- OWASP Top 10 mitigation.
- Zero Trust Architecture.
- Constant-time comparison for all secret/token validation.
- CI/CD security: Standardized runner versions (`ubuntu-24.04-arm`) and action versions across all workflows.
- Regular security audits (monthly recommended).

## Current Security Status (2026-06-08)

| Control             | Status                                                |
| ------------------- | ----------------------------------------------------- |
| Hardcoded Secrets   | ✅ None found                                         |
| XSS Vectors         | ✅ No dangerouslySetInnerHTML                         |
| Code Injection      | ✅ No eval/innerHTML                                  |
| Input Validation    | ✅ Zod schemas                                        |
| Auth Timing Attacks | ✅ Constant-time compare                              |
| Secure Random       | ✅ crypto.getRandomValues()                           |
| Security Headers    | ✅ Hono secureHeaders()                               |
| Secure Logging      | ✅ Sensitive data redaction                           |
| CSP object-src      | ✅ Added 'none' for plugin attack prevention          |
| HTML Sanitization   | ✅ DOMPurify configured (SVG/math blocked)            |
| Rate Limiting       | ✅ Cloudflare rate limiter                            |
| CI Runner           | ✅ All workflows use ubuntu-24.04-arm                 |
| CI Actions          | ⚠️ main.yml uses invalid @v5 (blocked by #743)        |
| npm audit           | ✅ **0 vulnerabilities** — Clean                      |
| .dev.vars gitignore  | ✅ Added to prevent credential commits               |

## Lessons Learned

### 2026-02-22 06:15 UTC: Cloudflare Workers Environment File in .gitignore

- **Finding**: `.dev.vars` (Cloudflare Workers environment file) was not in `.gitignore`
- **Root Cause**: `.gitignore` included `.env*` patterns but missed Cloudflare's equivalent `.dev.vars`
- **Risk**: Developers could accidentally commit API keys and secrets to version control
- **Fix**: Added `.dev.vars` to `.gitignore` under the Environment variables section
- **Verification**: TypeScript clean, ESLint clean, 236 web tests pass
- **Lesson**: All environment file patterns (including cloud-specific ones like `.dev.vars`) should be in `.gitignore` to prevent credential leakage

### 2026-02-21 21:16 UTC: CSP object-src Hardening

 **Finding**: CSP was missing `object-src 'none'` directive for defense-in-depth against plugin-based attacks (Flash, Java, PDF)
 **Root Cause**: Original CSP configuration did not include this recommended directive
 **Risk**: Without `object-src 'none'`, browsers could potentially load malicious plugins if other attack vectors succeeded
 **Fix**: Added `object-src 'none'` to CSP in `/apps/web/src/lib/security.ts`
 **Verification**: All 236 web tests pass, lint clean
 **Lesson**: CSP should always include `object-src 'none'` as a defense-in-depth measure against plugin-based attacks

### 2026-02-21 17:05 UTC: Security Engineer Audit - main.yml Invalid Action Version

- **Finding**: `main.yml` workflow uses invalid `actions/checkout@v5` (v5 doesn't exist)
- **Root Cause**: Workflow file not kept in sync with project standards defined in AGENTS.md
- **Risk**: Invalid action versions could fail or execute unintended code if malicious actor creates v5 tag
- **Status**: Blocked by issue #483 - requires repository admin to grant `workflows` permission
- **Verification**: All 217 tests pass, build succeeds, lint clean
- **Lesson**: CI workflow action versions must be validated against actual available versions; non-existent versions are a security risk

### 2026-02-20 21:00 UTC: Security Engineer Audit - Posture Verified

- **Finding**: Security audit confirmed all controls remain effective
- **Observation**: Codebase maintains excellent security posture; all 396 tests pass
- **npm audit**: 18 vulnerabilities (dev deps only) - risk accepted
- **Secrets scan**: No hardcoded secrets found
- **XSS scan**: No dangerouslySetInnerHTML, eval(), or innerHTML usage
- **Blocker**: CI workflow fixes for #483 still require GitHub App `workflows` permission
- **Action**: Documented workflow fix steps; awaiting repository permission changes
- **Lesson**: Security audits should verify both code-level controls and CI/CD infrastructure permissions

### 2026-02-20 16:55 UTC: XSS Pattern Library Enhancement

- **Finding**: XSS pattern library was missing modern attack vectors (SVG-based, mutation XSS, DOM clobbering)
- **Root Cause**: Original patterns focused on traditional XSS vectors; newer attack techniques emerged
- **Risk**: SVG elements can contain embedded scripts; mutation XSS exploits browser parsing quirks; DOM clobbering can override global variables
- **Fix**: Added FORBID_TAGS for `svg`, `math`, `base`, `link`, `meta`; added XSS_PATTERNS for SVG animate/set/use, data/base64/blob protocols, DOM clobbering IDs, noscript/template elements
- **Lesson**: XSS defense must evolve with attack techniques; regular pattern library audits are essential for defense-in-depth

### 2026-02-20 13:24 UTC: CI Workflow Security Standardization Fixed

- **Finding**: `on pull.yml` workflow used outdated runner (`ubuntu-22.04-arm`) and invalid action versions (`@v6`)
- **Root Cause**: Workflow not kept in sync with project standards defined in AGENTS.md
- **Risk**: Outdated CI runners may contain unpatched vulnerabilities; invalid action versions could fail or execute unintended code
- **Fix**: Updated runner to `ubuntu-24.04-arm`, actions/checkout and actions/setup-node to `@v4`
- **Lesson**: CI workflows should be audited regularly for version consistency and security compliance per AGENTS.md standards

### 2026-05-25 21:00 UTC: Security Engineer Audit - Lighthouse Dependency Upgrade

- **Finding**: PR upgraded `lighthouse` from `^12.8.2` to `^13.3.0` (dev dependency). No introduced vulnerabilities, secrets, or deprecated functions.
- **Root Cause**: Routine dependency update for performance auditing tool.
- **Verification**: Secret scan, deprecated function scan, npm audit, CVE database check (Snyk/ReversingLabs) all clean.
- **Pre-existing Issue**: `ws@8.18.0` (GHSA-58qx-3vcg-4xpx, moderate) persists in `apps/api/node_modules/ws` — pinned by `miniflare@4.20260426.0` as exact direct dependency (`ws: "8.18.0"`). Root-level npm override `"ws": "8.20.1"` cannot bypass this nested exact pin. Requires miniflare/wrangler upgrade to resolve.
- **Lesson**: When npm overrides don't propagate into workspace-level nested `node_modules` with exact version pins, the fix requires upgrading the parent dependency. Document this for future reference.

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

### 2026-06-08: Security Engineer Audit — Dependency Downgrade Regression Fixed

- **Finding**: PR contained two unauthorized dependency downgrades: `dompurify` from `^3.4.8` to `^3.4.7` (XSS sanitizer regression) and `openai` from `^6.42.0` to `^6.41.0` (OpenAI SDK regression).
- **Root Cause**: Manual edits to `apps/web/package.json` and `apps/api/package.json` lowered version constraints, and `package-lock.json` was regenerated to match.
- **Risk**: Downgrading `dompurify` (XSS sanitization library) reintroduces XSS vulnerabilities patched in 3.4.8. Downgrading `openai` loses bug fixes and security hardening from 6.41.0 → 6.42.0.
- **Fix**: Reverted both dependencies to their correct versions (`dompurify@^3.4.8`, `openai@^6.42.0`) and regenerated `package-lock.json`.
- **Verification**: TypeScript clean, npm audit clean (0 vulnerabilities).
- **Lesson**: Dependency version changes in PRs must only move forward, never backward. A security-critical dependency (like DOMPurify) should never be downgraded without explicit security review sign-off.

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
- [x] XSS pattern library includes SVG/math/mutation XSS vectors
- [ ] Consider distributed rate limiting for production scale
