# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

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

### Impact

1. **Inconsistency**: Different runner versions across workflows may lead to unpredictable behavior
2. **Compliance**: Violates documented project standards
3. **Maintenance**: `ubuntu-22.04-arm` may receive fewer updates and security patches

### Recommended Action

Update `.github/workflows/on pull.yml` line 23:

```yaml
# Change from:
runs-on: ubuntu-22.04-arm
# To:
runs-on: ubuntu-24.04-arm
```

### Verification

- [ ] Update runner version in workflow file
- [ ] Run workflow to verify compatibility
- [ ] Confirm no breaking changes in CI pipeline

### Note

This change requires `workflows` permission on GitHub App. Currently blocked by permission restrictions.

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
