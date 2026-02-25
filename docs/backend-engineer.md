# Backend Engineer Agent - Long-term Memory

## Overview

This document serves as the long-term memory for the backend-engineer agent, tracking patterns, lessons learned, and process improvements.

## Process

### Ultrawork Loop Phases

1. **INITIATE**: Check for existing PRs with backend-engineer label, look for issues
2. **PLAN**: Create work plan for the task
3. **IMPLEMENT**: Make the code changes
4. **VERIFY**: Run TypeScript check and tests
5. **SELF-REVIEW**: Review the changes
6. **SELF-EVOLVE**: Update this document with lessons learned
7. **DELIVER**: Create PR with proper labels

## Lessons Learned

### 2026-02-25 (Session 2)

- **Issue #932 & #930 Fix**: Fixed rate limiter security issue and CORS default
  - rateLimit.ts: Changed to return 503 when rate limiter not configured
  - rateLimit.test.ts: Updated test expectations to expect 503
  - env.ts: Changed CORS_ORIGIN default from "*" to ""
  - .dev.vars.example: Added proper localhost CORS origin
- **Verification**: All 13 rate limit tests pass

- **Edit Tool Issues**: The edit tool was causing issues with file structure
  - Solution: Use write tool to completely rewrite files when making significant changes
  - Always backup/restore from git when edit causes corruption

### 2026-02-25 (Session 1)

TW|- **Issue #959 Analysis**: The issue incorrectly mentioned `export.ts` as the file needing changes. The actual magic strings were in:
XV|  - `import.ts` (5 instances)
JP|  - `storage.ts` (1 instance)
TB|  - `bodyLimit.ts` (1 instance)
JS|- **Fix Applied**: Fixed `import.ts` first - replaced 5 magic strings with ErrorType enum
RH|- **Verification**: TypeScript compilation passes, 8/8 tests pass

### 2026-02-25

- **Issue #959 Analysis**: The issue incorrectly mentioned `export.ts` as the file needing changes. The actual magic strings were in:
  - `import.ts` (5 instances)
  - `storage.ts` (1 instance)
  - `bodyLimit.ts` (1 instance)
- **Fix Applied**: Fixed `import.ts` first - replaced 5 magic strings with ErrorType enum
- **Verification**: TypeScript compilation passes, 8/8 tests pass

### Testing Notes

- Pre-existing test failures exist in the codebase (environment config, circuit breaker, retry tests)
- Focus on running specific test files rather than full suite when verifying changes
- Import route tests: `npx vitest --run apps/api/src/routes/import.test.ts`

### Common Patterns

- Error handling: Always use `ErrorType` enum from `errors.ts`
- Import format: `import { ErrorType } from "../errors";`
- Replacement pattern: `"validation" as const` → `ErrorType.VALIDATION`

## Future Work (Related Issues)

- Issue #959: Still needs fixes in `storage.ts` and `bodyLimit.ts`
- The refactor is partially complete - import.ts is done
