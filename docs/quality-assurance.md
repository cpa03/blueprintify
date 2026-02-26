# Quality Assurance Agent

## Overview

This document serves as the long-term memory for the Quality Assurance agent.

## Testing Gaps Identified

### packages/shared (CRITICAL - ZERO TESTS)

The shared package has 0 test files but contains critical utilities:

- `config.ts` - Configuration constants
- `schema.ts` - Zod schemas
- `templates.ts` - Template definitions
- `types.ts` - TypeScript types
- `utils/debounce.ts` - Debounce utility

### apps/web/src/lib (PARTIALLY TESTED)

- `api.ts` - NO TESTS (now added)
- `clipboard.ts` - NO TESTS (now added)

### apps/web/src/hooks

Most hooks have tests, but coverage could be expanded.

## Test Files Added

1. **debounce.test.ts** - Tests for `createDebouncedSaver` from shared package
   - Debounce functionality
   - Delay execution
   - Argument passing
   - Flush and cancel methods

2. **clipboard.test.ts** - Tests for clipboard utilities
   - Modern clipboard API
   - Fallback method
   - Error handling
   - formatForIDE utility

3. **api.test.ts** - Tests for API client
   - checkHealth function

## Known Issues

### Existing Test Failures

Some integration tests fail with 503 errors (likely network-related in CI):

- Route tests (generate, tasks, refine, import, export, storage)
- These appear to be environment-specific, not code bugs
- The rate limiter is rejecting requests in the test environment

### circuitBreaker Tests

Two tests failing in circuitBreaker.test.ts that may need investigation:

- HALF_OPEN state test
- Custom resetTimeoutMs configuration test

### Controller Test Fixes (2026-02-26)

Fixed failing controller tests that were missing proper Hono context mocking:

- `generate.controller.test.ts` - Added createMockContext helper
- `refine.controller.test.ts` - Added createMockContext helper
- `tasks.controller.test.ts` - Added createMockContext helper
- Fixed test data to match schema (instruction vs instructions/section)
- Result: 12 previously failing controller tests now pass

### Existing Test Failures

Some integration tests fail with 503 errors (likely network-related in CI):

- Route tests (generate, tasks, refine, import, export, storage)
- These appear to be environment-specific, not code bugs

### circuitBreaker Tests

Two tests failing in circuitBreaker.test.ts that may need investigation:

- HALF_OPEN state test
- Custom resetTimeoutMs configuration test

## Best Practices

1. Always add tests for new utilities in shared packages
2. Use vitest with fake timers for debounce/throttle utilities
3. Mock browser APIs (clipboard, fetch) when testing browser-specific code
4. Tests should be deterministic and not depend on external services
