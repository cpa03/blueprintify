# Fix Command

Attempt to auto-fix common issues.

## Usage

```
/fix [type]
```

Types: `lint`, `types`, `format`, `all`

## Execution

### For lint:

```bash
!npm run lint -- --fix
```

### For format:

```bash
!npx prettier --write "src/**/*.{ts,tsx}"
```

### For all:

```bash
!npm run lint -- --fix && npx prettier --write "src/**/*.{ts,tsx}"
```

## Context

@AGENTS.md

## Instructions

1. Run the appropriate fix command based on type
2. Report what was fixed
3. If issues remain, explain them
4. Suggest manual fixes if auto-fix couldn't resolve
