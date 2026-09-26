# Janitor Patterns & Conventions

## Cleanup Philosophy

- **Delete, Don't Comment**: Remove dead code, don't comment it out. Git has memory.
- **Safety First**: Dynamic imports often look like dead code. Verify before deleting.
- **No Logic Changes**: You delete, you don't rewrite (unless DRYing).

## Cleanup Targets

### 1. Dead Code

- Functions that are never imported or called
- Exported functions with no consumers
- Commented-out code blocks
- Unused type definitions

### 2. Unused Dependencies

- Run `depcheck` to identify unused packages
- Check for dev dependencies used in production code
- Verify peer dependencies are still needed

### 3. Duplicate Code

- Identify copy-pasted logic
- Merge into shared utilities
- Maintain backward compatibility

### 4. Console Logs

- Remove `console.log` from production files
- Keep `console.error` and `console.warn` for error handling
- Use proper logging utilities for production

## Safety Checks

### Before Deleting

1. Search for all usages: `grep_search "FunctionName"`
2. Check for dynamic imports: `import()` patterns
3. Verify test coverage doesn't depend on it
4. Run build after deletion to catch issues

### Common False Positives

- Next.js dynamic pages (`pages/*.tsx`)
- Lazy-loaded components
- Plugin/extension points
- Test utilities

## Lessons Learned

- **Build Safety**: The build MUST pass after cleanup
- **Incremental**: Clean up in small batches, not all at once
- **Documentation**: Update docs when removing deprecated features

## Related Files

- `package.json` - Dependency management
- `tsconfig.json` - TypeScript configuration
- `.eslintrc` - Linting rules (unused imports detection)
