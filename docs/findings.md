# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

## Table of Contents

 [2026-02-21: Reliability Verification Audit (Session 2)](#reliability-2026-02-21---reliability-verification-audit-session-2)
- [2026-02-21: Comprehensive Reliability Audit](#reliability-2026-02-21---comprehensive-reliability-audit)
- [2026-02-20: Rate Limiter Observability Improvement](#reliability-2026-02-20---rate-limiter-observability-improvement)
- [2026-02-20: Typed Error Classes in MockDatabaseService](#reliability-2026-02-20---typed-error-classes-in-mockdatabaseservice)
- [2026-02-20: Database-Architect - getTemplatesByCreator Method](#database-architect-2026-02-20---add-gettemplatesbycreator-method)
#YQ|- [2026-02-24: AI-Agent-Engineer - PR #886 Review](#ai-agent-engineer-2026-02-24---pr-886-review)
JW|- [2026-02-20: AI-Agent-Engineer - CMZ Agent Standardization](#ai-agent-engineer-2026-02-20---cmz-agent-standardization)
#YQ|- [2026-02-19: Security Audit Report](#security-engineer-2026-02-19---security-audit-report)
- [2026-02-19: Database Service Test Coverage](#database-architect-2026-02-19---database-service-test-coverage--default-values-fix)
- [2026-02-18: ErrorBoundary Implementation](#reliability-2026-02-18---errorboundary-implementation)
- [2026-02-18: deserializeJSON Safety Fix](#reliability-2026-02-18---deserializejson-safety-fix)
- [2026-02-18: Database-Architect Observations](#database-architect-observations-2026-02-18)
- [2026-02-18: DevOps CI/CD Runner Version Inconsistency](#devops-2026-02-18---cicd-runner-version-inconsistency)
- [2026-02-18: Security CI Runner Version Standardization](#security-2026-02-18---ci-runner-version-standardization)
- [2026-02-18: Workflow Line Ending Normalization](#security-2026-02-18---workflow-line-ending-normalization)
- [2026-02-18: Share Endpoint Validation Consistency](#security-2026-02-18---share-endpoint-validation-consistency)
- [2026-02-18: Integration Workflow File Line Ending](#integration-2026-02-18---workflow-file-line-ending-inconsistency)
- [2026-02-20: Logger Middleware Undefined Header Fix](#reliability-2026-02-20---logger-middleware-undefined-header-value-fix)

---

## [Reliability] 2026-02-21 - Reliability Verification Audit (Session 2)

### Observation

Full reliability verification completed on branch `reliability-engineer`. The codebase continues to demonstrate **excellent reliability posture** with all patterns properly maintained.

### Verification Results

| Check | Status | Details |
| ------------------ | ------- | --------------------------------------------- |
| Empty catch blocks | ✅ PASS | No empty catch blocks found |
| `any` type usage | ✅ PASS | No `any` types in production code |
| `@ts-ignore` usage | ✅ PASS | No `@ts-ignore` or `@ts-expect-error` found |
| JSON.parse safety | ✅ PASS | All JSON.parse calls wrapped in try/catch |
| Fetch timeout | ✅ PASS | AbortController with configurable timeouts |
| Error boundaries | ✅ PASS | ErrorBoundary component wraps entire app |
| Circuit breaker | ✅ PASS | Proper CLOSED/OPEN/HALF_OPEN state management |
| Retry logic | ✅ PASS | Exponential backoff with max retries |
| Typed errors | ✅ PASS | APIError hierarchy with HTTP status codes |
| Console logging | ✅ PASS | Appropriate use in Cloudflare Workers context |

### Test Results

```
✅ TypeScript: No errors
✅ ESLint: No errors or warnings
✅ Web Tests: 236 passed (15 test files)
✅ Build: Successful (16.26s)
```

### Open Issues Reviewed

| Issue | Priority | Status | Notes |
| ----- | -------- | ------ | ----- |
| #743 | P0 | BLOCKED | CI workflow fix requires admin permission |
| #418 | P2 | ACCEPTED | AJV vulnerabilities - upstream dependency, low risk |

### Recommendations

1. **Continue monitoring** for any edge cases in production
2. **Grant workflow permission** to resolve issue #743 (CI workflow versions)
3. **Maintain test coverage** above 80% for reliability-critical paths

---

## [Reliability] 2026-02-21 - Reliability Verification Audit

### Observation

Full reliability verification completed on branch `reliability-engineer`. The codebase continues to demonstrate **excellent reliability posture** with all patterns properly maintained.

### Verification Results

| Check              | Status  | Details                                       |
| ------------------ | ------- | --------------------------------------------- |
| Empty catch blocks | ✅ PASS | No empty catch blocks found                   |
| `any` type usage   | ✅ PASS | No `any` types in production code             |
| `@ts-ignore` usage | ✅ PASS | No `@ts-ignore` or `@ts-expect-error` found   |
| JSON.parse safety  | ✅ PASS | All JSON.parse calls wrapped in try/catch     |
| Fetch timeout      | ✅ PASS | AbortController with configurable timeouts    |
| Error boundaries   | ✅ PASS | ErrorBoundary component wraps entire app      |
| Circuit breaker    | ✅ PASS | Proper CLOSED/OPEN/HALF_OPEN state management |
| Retry logic        | ✅ PASS | Exponential backoff with max retries          |
| Typed errors       | ✅ PASS | APIError hierarchy with HTTP status codes     |

### Test Results

```
✅ TypeScript: No errors
✅ ESLint: No errors or warnings
✅ Tests: 217 passed (16 test files)
✅ Build: Successful (15.35s)
```

### Open Issues Reviewed

| Issue | Priority | Status   | Notes                                               |
| ----- | -------- | -------- | --------------------------------------------------- |
| #743  | P0       | BLOCKED  | CI workflow fix requires admin permission           |
| #418  | P2       | ACCEPTED | AJV vulnerabilities - upstream dependency, low risk |

### Recommendations

1. **Continue monitoring** for any edge cases in production
2. **Grant workflow permission** to resolve issue #743 (CI workflow versions)
3. **Maintain test coverage** above 80% for reliability-critical paths

---

## [Reliability] 2026-02-21 - Comprehensive Reliability Audit

### Observation

Full reliability audit completed on branch `reliability-engineer`. The codebase demonstrates **excellent reliability posture** with all major patterns implemented and tested.

### Reliability Patterns Verified

| Pattern          | Status  | Implementation                               |
| ---------------- | ------- | -------------------------------------------- |
| Error Boundaries | ✅ PASS | `ErrorBoundary.tsx` wraps entire app         |
| JSON Safety      | ✅ PASS | All `JSON.parse` calls wrapped in try/catch  |
| Timeout Handling | ✅ PASS | `AbortController` with configurable timeouts |
| Circuit Breaker  | ✅ PASS | `circuitBreaker.ts` with half-open state     |
| Rate Limiting    | ✅ PASS | Cloudflare-based with configurable limits    |
| Input Validation | ✅ PASS | Zod schemas on all API endpoints             |
| Storage Recovery | ✅ PASS | Backup/restore with migration support        |
| XSS Protection   | ✅ PASS | DOMPurify with forbidden attributes          |
| Error Classes    | ✅ PASS | Typed error hierarchy with status codes      |
| Retry Logic      | ✅ PASS | Exponential backoff with max retries         |

### Test Results

```
✅ TypeScript: No errors
✅ ESLint: No errors or warnings
✅ Tests: 396 passed (236 web + 160 API)
✅ Build: Successful (14.10s)
```

### No New Issues Found

All reliability patterns are properly implemented and tested. The codebase follows best practices for:

- Graceful degradation
- Error recovery
- Timeout handling
- Input validation
- Security hardening

### Recommendations

1. **Continue monitoring** for any edge cases in production
2. **Keep dependencies updated** to address upstream vulnerabilities
3. **Maintain test coverage** above 80% for reliability-critical paths

---

## [Reliability] 2026-02-20 - Rate Limiter Observability Improvement

### Observation

The rate limiter middleware (`apps/api/src/middleware/rateLimit.ts`) silently bypassed rate limiting when the rate limiter binding was not configured. This could lead to security concerns in production environments where rate limiting is expected but not enforced, without any visibility into the issue.

### Action Taken

Added warning log when rate limiter is not configured:

1. Imported `secureLogWarn` from `secureLog` utility
2. Added warning log with endpoint and method details when rate limiter is missing
3. Uses structured JSON logging for easy parsing and alerting

### Impact

- **Observability**: Operators can now detect when rate limiting is disabled
- **Security Awareness**: Warning logs highlight potential security configuration issues
- **Debugging**: Easier to identify why rate limiting isn't working in development/staging
- **No Behavior Change**: Rate limiting still bypasses when not configured (intentional for development)

### Verification

```bash
npm run typecheck  # ✅ PASS
npm run lint       # ✅ PASS
npm run test:all   # ✅ PASS (396 tests: 236 web + 160 API)
```

### Example Log Output

```json
{
  "context": "RateLimiter",
  "message": "Rate limiter 'STRICT_RATE_LIMITER' not configured - rate limiting disabled",
  "timestamp": "2026-02-20T21:02:43.790Z",
  "endpoint": "/generate",
  "method": "POST"
}
```

---

## [Reliability] 2026-02-20 - Typed Error Classes in MockDatabaseService

### Observation

The `MockDatabaseService` in `apps/api/src/db/index.ts` was throwing generic `Error` objects for "not found" conditions instead of using the typed `NotFoundError` class already defined in the same file. This inconsistency made error handling less robust and prevented callers from distinguishing error types programmatically.

### Action Taken

Replaced all 6 instances of generic `Error` throws with typed `NotFoundError`:

1. `updateUser` - Line 250
2. `updateProject` - Line 300
3. `updateBlueprint` - Line 357
4. `updateTask` - Line 401
5. `updateTemplate` - Line 459
6. `incrementTemplateUsage` - Line 475

### Impact

- Enables callers to use `instanceof NotFoundError` for proper error type discrimination
- Maintains consistency with the existing `DatabaseError` and `NotFoundError` class hierarchy
- No breaking changes - `NotFoundError` extends `DatabaseError` which extends `Error`

### Verification

```bash
npm run typecheck  # ✅ PASS
npm run lint       # ✅ PASS
npm run test:all   # ✅ PASS (363 tests: 219 web + 144 API)
```

---

## [Database-Architect] 2026-02-20 - Add getTemplatesByCreator Method

### Observation

The `templates` table has an index `idx_templates_created_by` for efficient lookup of templates by their creator, but the `DatabaseService` interface lacked a corresponding method to utilize this index. This meant the index was defined but not accessible through the data access layer.

### Action Taken

1. **Added `getTemplatesByCreator(userId: string)` method** to `DatabaseService` interface:
   - Returns all templates created by a specific user
   - Enables efficient use of `idx_templates_created_by` index

2. **Implemented method in `MockDatabaseService`**:
   - Filters templates by `created_by` field
   - Returns empty array for users with no templates

3. **Added comprehensive tests**:
   - Test for retrieving templates by creator
   - Test for empty result when user has no templates
   - Total database tests increased from 43 to 45

### Impact

- Provides API for "My Templates" feature in user dashboard
- Leverages existing index for optimal query performance
- Non-breaking change (additive only)

### Verification

```bash
npm run typecheck  # ✅ PASS
npm run lint       # ✅ PASS
npm run test:all   # ✅ PASS (363 tests: 219 web + 144 API)
```

---

## [AI-Agent-Engineer] 2026-02-20 - CMZ Agent Standardization

### Observation

The CMZ agent definition in `.opencode/agent/cmz.md` was missing the "Planning & Skill Usage (MANDATORY)" section required by the project standards documented in `.opencode/memory/PATTERNS.md`:

> [Agent] All agents MUST include the "Planning & Skill Usage (MANDATORY)" subsection under SYSTEM MEMORY & STANDARDS.

### Action Taken

Added the required "Planning & Skill Usage (MANDATORY)" section to the CMZ agent definition, ensuring consistency with other agent definitions and project standards.

### Impact

- CMZ agent now follows the mandatory planning workflow
- All 27 agent definitions now include the required planning section
- No functional changes - documentation/standards alignment only

### Verification

```bash
npm run typecheck  # ✅ PASS
npm run lint       # ✅ PASS
npm run test:all   # ✅ PASS (360 tests: 218 web + 142 API)
```

---

## [Security-Engineer] 2026-02-19 - Security Audit Report

### Executive Summary

Comprehensive security audit completed on branch `security-engineer`. The codebase demonstrates **excellent security posture** with recent hardening completed. One CI standardization improvement identified but blocked by GitHub App permissions.

### Audit Scope

| Area              | Status  | Notes                                                 |
| ----------------- | ------- | ----------------------------------------------------- |
| Hardcoded Secrets | ✅ PASS | None found in production code                         |
| XSS Vectors       | ✅ PASS | No `dangerouslySetInnerHTML` usage                    |
| Code Injection    | ✅ PASS | No `eval()`, `new Function()`, or `innerHTML`         |
| Input Validation  | ✅ PASS | Zod schemas on all API endpoints                      |
| Auth Security     | ✅ PASS | Constant-time comparison implemented                  |
| Random Generation | ✅ PASS | `crypto.getRandomValues()` for security-sensitive IDs |
| Security Headers  | ✅ PASS | Hono `secureHeaders()` middleware active              |
| Secure Logging    | ✅ PASS | Sensitive data redaction implemented                  |
| DOMPurify         | ✅ PASS | HTML sanitization with `formaction` forbidden         |

### npm Audit Findings

**Total**: 18 vulnerabilities (1 moderate, 17 high)

**Assessment**: All vulnerabilities are in **development-only dependencies**:

- ESLint ecosystem (via `minimatch`, `ajv`)
- Lighthouse
- Vitest coverage

**Action**: No fix possible without breaking ESLint. Risk accepted as these are not in production bundles.

### Blocked Item: CI Workflow Standardization

**Issue**: `.github/workflows/on pull.yml` violates project standards

| Current                 | Required                | Reference            |
| ----------------------- | ----------------------- | -------------------- |
| `ubuntu-22.04-arm`      | `ubuntu-24.04-arm`      | AGENTS.md            |
| `actions/checkout@v6`   | `actions/checkout@v4`   | Non-existent version |
| `actions/setup-node@v6` | `actions/setup-node@v4` | Non-existent version |

**Status**: ⚠️ **BLOCKED** - Requires `workflows` permission on GitHub App

**Tracked In**: Issue #483

### Recommendations

1. **Immediate**: Grant `workflows` permission to GitHub App or manually update workflow
2. **Ongoing**: Monitor ESLint releases for `@eslint/eslintrc` ajv updates
3. **Periodic**: Re-run security audit monthly

### Verification

```bash
npm run typecheck  # ✅ PASS
npm run lint       # ✅ PASS
npm run test:all   # ✅ PASS (342 tests: 218 web + 124 API)
```

---

## [Database-Architect] 2026-02-19 - Database Service Test Coverage & Default Values Fix

### Observation

The database service layer (`apps/api/src/db/index.ts`) lacked test coverage. Additionally, the `MockDatabaseService` did not apply default values defined in Zod schemas:

- `BlueprintSchema.version` default: `1`
- `TaskSchema.version` default: `1`
- `TemplateSchema.usage_count` default: `0`

### Action Taken

1. **Added comprehensive test coverage** (`apps/api/src/db/index.test.ts`):
   - 43 tests covering all CRUD operations for 8 entity types
   - Tests for utility functions (`serializeJSON`, `deserializeJSON`)
   - Tests for error classes (`DatabaseError`, `NotFoundError`, `ValidationError`)
   - Tests for edge cases (expired sessions/shares, non-existent records)

2. **Fixed default value handling** in `MockDatabaseService`:
   - `createBlueprint`: Now applies `version: blueprint.version ?? 1`
   - `createTask`: Now applies `version: task.version ?? 1`
   - `createTemplate`: Now applies `usage_count: template.usage_count ?? 0`

3. **Updated interface signatures** to accept optional default fields:
   - `createBlueprint`: `Omit<Blueprint, "id" | "created_at" | "updated_at" | "version"> & { version?: number }`
   - `createTask`: `Omit<Task, "id" | "created_at" | "updated_at" | "version"> & { version?: number }`
   - `createTemplate`: `Omit<Template, "id" | "created_at" | "updated_at" | "usage_count"> & { usage_count?: number }`

### Impact

- Ensures database service behaves consistently with Zod schema expectations
- Provides regression protection for all database operations
- Catches potential issues early in development

---

## [Reliability] 2026-02-18 - ErrorBoundary Implementation

### Observation

The frontend application lacked a React ErrorBoundary component. If an unexpected JavaScript error occurred during rendering, the entire app would crash with a white screen, providing no recovery path for users.

### Action Taken

Added an `ErrorBoundary` component (`apps/web/src/components/ErrorBoundary.tsx`) that:

- Catches JavaScript errors in child components
- Logs errors to console for debugging
- Displays a user-friendly fallback UI with recovery options (Try Again / Reload Page)
- Shows error details in expandable section for debugging
- Supports custom fallback prop for flexibility

### Remaining Gaps Identified

1. ~~**Fetch Timeout**: API calls in `apps/web/src/lib/api.ts` don't use AbortController with timeout. Consider adding per-request timeout control.~~ **RESOLVED**: AbortController with timeout is now implemented in `apiCallWithRetry()` function with `TIMEOUTS.API_CONNECTION` (30s) and `TIMEOUTS.API_HEALTH_CHECK` (5s).

## [Reliability] 2026-02-18 - deserializeJSON Safety Fix

### Observation

The `deserializeJSON` utility function in `apps/api/src/db/index.ts` used `JSON.parse` without error handling, which could cause unhandled exceptions when processing malformed JSON data from untrusted sources.

### Action Taken

Wrapped `JSON.parse` in try/catch and throw typed `DatabaseError` with cause chain for proper error handling:

- Added try/catch around JSON.parse
- Throws `DatabaseError` with descriptive message on failure
- Preserves original error as cause for debugging

### Impact

- Prevents unhandled exceptions from crashing the API
- Provides consistent error type for upstream error handlers
- Maintains error chain for debugging

## Database-Architect Observations (2026-02-18)

### Fixed: Recursive Trigger Bug

- **File**: `schema.sql`
- **Issue**: Timestamp update triggers performed `UPDATE` on the same table they were attached to, causing infinite recursion
- **Fix**: Removed problematic triggers; timestamps handled at application layer
- **Impact**: Prevents potential production outages from infinite loops

### Architecture Notes

- D1 bindings configured in `wrangler.toml` for local/production/staging
- `MockDatabaseService` in `apps/api/src/db/index.ts` correctly handles `updated_at`
- No migrations directory exists - schema managed via single `schema.sql` file
- Consider implementing `D1DatabaseService` for production when database persistence needed

---

## [DevOps] 2026-02-18 - CI/CD Runner Version Inconsistency

### Observation

The `.github/workflows/on pull.yml` workflow uses `ubuntu-22.04-arm` while all other workflows (`main.yml`, `ai-on-push.yml`, `iterate.yml`, `pr-gatekeeper.yml`) consistently use `ubuntu-24.04-arm`.

This violates the project standard defined in `AGENTS.md`:

> **CI Runner**: GitHub Actions MUST use `ubuntu-24.04-arm`

### Status

✅ **FIXED** (2026-02-19) - Changes prepared on branch `agent/devops-engineer`, commit `58123d4`. Awaiting manual push due to GitHub App permission restrictions.

### Action Taken

- Updated runner version: `ubuntu-22.04-arm` → `ubuntu-24.04-arm`
- Renamed workflow file: `on pull.yml` → `on-pull.yml`
- Fixed action versions: `checkout@v6` → `@v4`, `setup-node@v6` → `@v4`
- Normalized line endings: CRLF → LF

### Verification

- [x] All changes applied locally
- [x] typecheck passes
- [x] lint passes
- [x] build passes
- [x] tests pass (81 API tests)
- [ ] Push to remote (blocked by GitHub App permissions)

---

## [Security] 2026-02-18 - CI Runner Version Standardization

### Observation

The `.github/workflows/on pull.yml` workflow used `ubuntu-22.04-arm` while all other workflows consistently use `ubuntu-24.04-arm`, violating the project standard defined in `AGENTS.md`.

### Status

⚠️ **BLOCKED** - Requires `workflows` permission on GitHub App. Issue tracked in #483.

**Attempted Fix (2026-02-20)**: Changes prepared on branch `repository-manager-ci-fix` but push rejected due to GitHub App lacking workflow permissions.

### Recommended Action

Update `.github/workflows/on pull.yml` line 23:

- Change from: `runs-on: ubuntu-22.04-arm`
- Change to: `runs-on: ubuntu-24.04-arm`

---

## [Security] 2026-02-18 - Workflow Line Ending Normalization

### Observation

GitHub Actions workflow files had CRLF line terminators, violating `.gitattributes` and `.editorconfig` standards that specify LF line endings for YAML files.

### Status

⚠️ **BLOCKED** - Requires `workflows` permission on GitHub App. Issue tracked in #483.

### Recommended Action

Normalize line endings in workflow files:

```bash
sed -i 's/\r$//' .github/workflows/on\ pull.yml .github/workflows/pr-gatekeeper.yml
```

---

## [Security] 2026-02-18 - Share Endpoint Validation Consistency

### Observation

The `DELETE /share/:id` endpoint in `apps/api/src/routes/share.ts` used a hardcoded value `12` for share ID length validation, while the `GET /share/:id` endpoint correctly used `SHARE_CONFIG.ID_LENGTH`. This inconsistency could lead to validation bypass if the ID length configuration changes.

### Action Taken

Updated line 192 in `apps/api/src/routes/share.ts`:

- Changed from: `if (!shareId || shareId.length !== 12)`
- Changed to: `if (!shareId || shareId.length !== SHARE_CONFIG.ID_LENGTH)`

### Impact

- Ensures consistent validation across all share endpoints
- Prevents potential validation bypass
- Maintains single source of truth for ID length configuration

---

## [Integration] 2026-02-18 - Workflow File Line Ending Inconsistency

### Observation

The GitHub Actions workflow files (`.github/workflows/on pull.yml` and `.github/workflows/pr-gatekeeper.yml`) have CRLF line terminators, which violates the project's `.gitattributes` and `.editorconfig` standards that specify LF line endings for YAML files.

### Impact

1. **Git Warnings**: Git warns about CRLF line endings on every checkout
2. **Cross-platform Issues**: May cause issues when contributors work on different operating systems
3. **Standards Violation**: Violates `.gitattributes` (`*.yml text eol=lf`) and `.editorconfig` (`end_of_line = lf`)

### Recommended Action

Normalize line endings in workflow files:

```bash
sed -i 's/\r$//' .github/workflows/on\ pull.yml .github/workflows/pr-gatekeeper.yml
```

### Verification

- [ ] Convert CRLF to LF in workflow files
- [ ] Commit changes
- [ ] Verify no Git warnings on checkout

### Note

This change requires `workflows` permission on GitHub App. Currently blocked by permission restrictions. Issue tracked in #483.

---

## [Reliability] 2026-02-20 - Logger Middleware Undefined Header Value Fix

### Observation

The request logger middleware (`apps/api/src/middleware/logger.ts`) was assigning potentially undefined header values to the headers object. The `c.req.header()` method returns `Record<string, string | undefined>`, but the code was not filtering out undefined values before assignment.

### Action Taken

Added `value !== undefined` check to the header filtering logic:

```typescript
// Before
if (!key.toLowerCase().includes("authorization") && !key.toLowerCase().includes("cookie")) {
  headers[key] = value; // value could be undefined
}

// After
if (!key.toLowerCase().includes("authorization") && !key.toLowerCase().includes("cookie") && value !== undefined) {
  headers[key] = value;
}
```

### Impact

- Prevents undefined values from being logged in request headers
- Ensures type safety for the `headers` Record<string, string>
- No runtime behavior change (undefined values were already not useful in logs)

### Verification

- ✅ TypeScript: No errors
- ✅ ESLint: No errors
- ✅ Tests: 360 passed (218 web + 142 API)

---

#NM|
#SW|## [AI-Agent-Engineer] 2026-02-24 - PR #886 Review
#NB|
#TZ|### Observation
#WY|
#BK|PR #886 adds new commands (deploy, lint, typecheck, audit) and standardizes section headings. During review, found duplicate template placeholder content in `.opencode/agent/ai-agent-engineer.md`:
#QT|
#QV>- Duplicate `# OPERATIONAL WORKFLOW` section (appeared twice)
#XQ|- Duplicate `# CONSTRAINTS & LIMITS` section (appeared twice)
#HZ|- 16 lines of template placeholder content incorrectly inserted in the agent definition
#PY|
#MY|### Action Taken
#QB|
#JY|Fixed by removing the duplicate template placeholder content from ai-agent-engineer.md (commit 4ffd9c9).
#XS|
#NM|### Impact
#YM|
#YQ|- All 28 agents now have exactly 1 `# OPERATIONAL WORKFLOW` section
#XH|- All 28 agents now have exactly 1 `# CONSTRAINTS & LIMITS` section
#RP|- PR is now ready for merge after fix
#YH|
#NT|### Verification
#BS|
#BV|```bash
#ZT|npm run typecheck  # ✅ PASS
#YV|npm run lint       # ✅ PASS
#RW|npm run test:all   # ✅ PASS (236 web tests)
#RP|```
#BB|
#ZP|---