# Lint Command

Run ESLint to check and fix code quality issues.

## Usage

```
/lint [--fix]
```

## Arguments

- `--fix` (optional): Automatically fix linting issues

## Context

@AGENTS.md
@.eslintrc.cjs

## Instructions

1. Run ESLint check:

   ```bash
   npm run lint
   ```

2. If issues found and `--fix` provided:

   ```bash
   npm run lint -- --fix
   ```

3. Review remaining issues:
   - Warnings: Should be addressed but not blocking
   - Errors: Must be fixed before commit

## Common Issues

| Issue                                              | Fix                                       |
| -------------------------------------------------- | ----------------------------------------- |
| `@typescript-eslint/no-unused-vars`                | Remove unused variable or prefix with `_` |
| `@typescript-eslint/explicit-function-return-type` | Add return type annotation                |
| `react-hooks/exhaustive-deps`                      | Add missing dependencies to useEffect     |
| `no-console`                                       | Remove console.log or use proper logging  |

## Example Output

```bash
npm run lint

> blueprint-generator@1.0.0 lint
> eslint . --ext .ts,.tsx

apps/web/src/components/Button.tsx
  15:10  warning  'onClick' is defined but never used  @typescript-eslint/no-unused-vars

✖ 1 problem (0 errors, 1 warning)
```

## Success Criteria

- No errors
- Warnings reviewed and documented if accepted
