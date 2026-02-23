# TypeCheck Command

Run TypeScript type checking to verify type safety.

## Usage

```
/typecheck
```

## Context

@AGENTS.md
@tsconfig.json

## Instructions

1. Run TypeScript compiler in check mode:

   ```bash
   npm run typecheck
   ```

2. If errors found:
   - Read the error message carefully
   - Identify the file and line number
   - Fix the type issue
   - Re-run typecheck

## Common Errors

| Error                                    | Cause                     | Fix                                                |
| ---------------------------------------- | ------------------------- | -------------------------------------------------- |
| `TS2307: Cannot find module`             | Missing import or package | Install package or fix import path                 |
| `TS2322: Type is not assignable`         | Type mismatch             | Fix the type or add type assertion                 |
| `TS2339: Property does not exist`        | Missing property on type  | Add property to interface or use optional chaining |
| `TS7006: Parameter implicitly has 'any'` | Missing type annotation   | Add explicit type annotation                       |
| `TS2741: Property is missing`            | Missing required property | Add missing property or make it optional           |

## Strict Mode Checks

This project uses TypeScript strict mode. Key checks enabled:

- `strictNullChecks`: null/undefined are distinct types
- `noImplicitAny`: Parameters must have types
- `strictFunctionTypes`: Function parameter types are checked contravariantly
- `noImplicitReturns`: All code paths must return a value

## Example Output

```bash
npm run typecheck

> blueprint-generator@1.0.0 typecheck
> tsc --noEmit

apps/api/src/index.ts(49,14): error TS7006: Parameter 'origin' implicitly has an 'any' type.

Found 1 error.
```

## Success Criteria

- No TypeScript errors
- All types are explicit (no implicit any)
