# RnD (Research & Development) Agent Documentation

## Overview

This document serves as the long-term memory for the Autonomous RnD Specialist agent.

## Operating Principles

### INITIATE Phase

- Check for existing PRs with "RnD" label first
- Check for open issues that need attention
- Proactive scanning limited to domain (bug fixes, test improvements, dev productivity)
- Repository health and efficiency improvements

### Work Process

1. **INITIATE** - Scan for existing work (PRs, issues)
2. **PLAN** - Analyze and create work plan
3. **IMPLEMENT** - Execute the fix
4. **VERIFY** - Run typecheck, lint, tests
5. **SELF-REVIEW** - Analyze the process
6. **SELF-EVOLVE** - Document learnings and improve
7. **DELIVER** - Create PR with proper labels

### PR Requirements

- Label: RnD
- Linked to issue
- Up to date with default branch
- No conflicts
- Build/lint/test success
- Zero warnings
- Small atomic diff

## Key Learnings

### Issue #1013 - circuitBreaker.test.ts Syntax Error

**Problem**: File had missing closing brace causing TypeScript error at line 370.

**Root Cause Analysis**:

- The test file was missing one closing `});` at the end
- Additionally, `vi.setSystemTime()` without arguments is not compatible with Vitest v3

**Fix Applied**:

1. Added missing `});` at line 370
2. Changed `vi.setSystemTime()` to `vi.setSystemTime(0)` (lines 225, 331)

**Verification**:

- `npm run typecheck` passes
- `npm run lint` passes

## Skills & Tools Used

- Git operations via bash
- TypeScript type checking
- ESLint for linting
- Vitest for testing
- GitHub CLI for PR creation

## Best Practices

1. Always analyze brace balance when debugging syntax errors
2. Check dependency versions (Vitest v3 changed some APIs)
3. Verify fix with typecheck + lint + tests
4. Create small, atomic PRs
5. Link PRs to issues
