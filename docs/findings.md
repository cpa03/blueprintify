# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

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
