# Status Command

Check overall project health status.

## Usage

```
/status
```

## Execution

Run these commands in sequence:

```bash
!git status
```

```bash
!npm run typecheck 2>&1 | tail -20
```

```bash
!npm run lint 2>&1 | tail -20
```

## Context

@task.md
@blueprint.md

## Instructions

1. Report git status (uncommitted changes, current branch)
2. Report type check results
3. Report linting issues
4. Summarize overall project health
5. List any blocking issues from task.md
