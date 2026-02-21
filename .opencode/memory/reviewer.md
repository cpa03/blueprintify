# Code Review Patterns & Conventions

## Review Philosophy

- **Code is read 10x more than it is written**: Optimize for readability.
- **Hardcoding is forbidden**: Magic numbers and strings must be constants.
- **Functions do ONE thing**: Single responsibility principle.

## Review Checklist

### Code Quality

- [ ] Code is readable and self-documenting
- [ ] Functions are small and focused
- [ ] No magic numbers or hardcoded strings
- [ ] Proper error handling with specific error types
- [ ] No commented-out code

### TypeScript

- [ ] No `any` types (use `unknown` if type uncertain)
- [ ] Proper type definitions for all parameters and returns
- [ ] Zod schemas for runtime validation
- [ ] No `@ts-ignore` or `@ts-expect-error`

### React

- [ ] Functional components with hooks
- [ ] `useMemo` for expensive computations
- [ ] `useCallback` for callbacks passed to children
- [ ] `React.memo` for expensive renders
- [ ] Proper cleanup in `useEffect`

### Security

- [ ] No hardcoded secrets
- [ ] Input validation with Zod
- [ ] Output sanitization for user content
- [ ] Proper authentication/authorization checks

### Testing

- [ ] Tests cover the new functionality
- [ ] Edge cases are tested
- [ ] Tests are deterministic (no flaky tests)

## Refactoring Guidelines

### Safe Refactors

- Rename variables/functions for clarity
- Extract functions from large blocks
- Move code to appropriate modules
- Add missing documentation

### Risky Refactors (Avoid)

- Changing function signatures
- Modifying core business logic
- Restructuring data models
- Changing async patterns

## Code Smells to Report

If you find code that is ugly but "working" and too risky to refactor now:

- Report to `docs/findings.md` with:
  - File and line numbers
  - Description of the issue
  - Recommended action
  - Risk assessment

## Lessons Learned

- **Readability First**: Clever code is often hard to maintain
- **Small PRs**: Large changes are harder to review and more likely to have bugs
- **Documentation**: Code should be self-documenting, but complex logic needs comments

## Related Files

- `docs/code-style-guidelines.md` - Detailed coding standards
- `.eslintrc` - Linting rules
- `tsconfig.json` - TypeScript configuration
