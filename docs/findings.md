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

1. **Fetch Timeout**: API calls in `apps/web/src/lib/api.ts` don't use AbortController with timeout. Consider adding per-request timeout control.

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
