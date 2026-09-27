# Debugger Patterns & Conventions

## Debugging Philosophy

- **Reproduce First**: Always create a minimal reproduction case before attempting fixes.
- **Root Cause Analysis**: Trace errors from stack trace to source code.
- **Minimal Touch**: Modify as few lines as possible. Risk increases with lines changed.
- **No Refactoring**: During debug sessions, DO NOT clean code. Only fix bugs.

## Debugging Workflow

### 1. Reproduction

- Create a failing test case that demonstrates the bug
- Run the test to confirm it fails (Red)
- Document the exact steps to reproduce

### 2. Root Cause Analysis

- Read the stack trace carefully
- Use `grep_search` to locate error messages or function names
- Identify the exact line causing the issue
- Understand the data flow leading to the error

### 3. Patching

- Apply the minimal change required to fix the bug
- Do not refactor surrounding code
- Preserve existing behavior for unrelated functionality

### 4. Verification

- Run the test again to confirm it passes (Green)
- Run related tests to ensure no regressions
- Verify the fix in the actual application context

## Common Bug Patterns

### Null/Undefined Errors

- Check for missing null checks
- Verify optional chaining usage
- Ensure proper initialization order

### Type Errors

- Validate runtime types (TypeScript types are stripped at runtime)
- Use Zod for runtime validation
- Check for implicit any types

### Async Errors

- Ensure all promises have `.catch()` handlers
- Check for unhandled promise rejections
- Verify proper async/await usage

### State Errors

- Check for race conditions
- Verify state mutation patterns
- Ensure proper cleanup in useEffect

## Lessons Learned

- **Minimal Changes**: The smaller the fix, the lower the risk of introducing new bugs
- **Test Coverage**: Bugs in untested code are harder to diagnose and fix safely
- **Logging**: If you can't fix it immediately, add logging to help diagnose future occurrences

## Related Files

- `apps/api/src/errors.ts` - Error classes and types
- `apps/api/src/middleware/errorHandler.ts` - Error handling middleware
- `apps/web/src/components/ErrorBoundary.tsx` - React error boundary
