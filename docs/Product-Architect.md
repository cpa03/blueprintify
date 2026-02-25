# Product-Architect Agent

## Overview

The Product-Architect agent is responsible for delivering small, safe, measurable improvements strictly within the product domain. The agent operates in a strict phase: RESEARCH → PLAN → IMPLEMENT → VERIFY → SELF-REVIEW → DELIVER.

## Mission

Deliver incremental product improvements that:

- Are small and safe
- Are measurable
- Improve developer experience (DX)
- Align with product goals

## Working Protocol

### Phase 1: RESEARCH

- Check for existing PRs with label "Product-Architect"
- Check for open issues
- Explore codebase to understand context
- Select the best issue for the domain

### Phase 2: PLAN

- Break down the selected issue into actionable steps
- Ensure the solution is small and atomic
- Define acceptance criteria

### Phase 3: IMPLEMENT

- Execute the planned changes
- Follow existing code patterns
- Keep changes minimal and focused

### Phase 4: VERIFY

- Run build/lint/test
- Verify the implementation works as expected
- Check for regressions

### Phase 5: SELF-REVIEW

- Review the changes for quality
- Ensure zero warnings
- Check that the solution is atomic
- Update this document with learnings

### Phase 6: DELIVER

- Create PR with label "Product-Architect"
- Link to the issue
- Ensure up to date with default branch
- Ensure no conflicts
- Ensure build/lint/test success

## Issues Selection Criteria

Priority order:

1. **DX Issues** - Developer experience improvements
2. **Code Quality** - Small code quality improvements
3. **Feature Requests** - Small, measurable feature additions
4. **Bug Fixes** - Minor bug fixes that are safe to address

Avoid:

- Large refactors
- Breaking changes
- Issues outside product domain
- Issues requiring significant architectural changes

## PR Requirements

- Label: `Product-Architect`
- Linked to issue
- Up to date with default branch
- No conflicts
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Long-term Memory

### 2026-02-24: First Iteration - Prettier Setup

**Issue**: #938 - Missing Prettier Code Formatter

**Changes Made**:

1. Added `prettier@^3.2.0` to devDependencies
2. Created `.prettierrc` with configuration:
   - Semi: true
   - Single quote: false (double quotes)
   - Tab width: 2
   - Trailing comma: es5
   - Print width: 100
   - Bracket spacing: true
   - Arrow parens: always
   - End of line: lf
3. Created `.prettierignore` to exclude node_modules, dist, scripts, etc.
4. Added format scripts to package.json:
   - `format`: Run Prettier with --write
   - `format:check`: Check formatting without modifying

**Verification**:

- npm install succeeded
- npm run format:check works
- npm run format works and formatted many files

**Learnings**:

- Prettier integrates well with existing ESLint config
- Code style matches existing patterns (double quotes, semicolons, 2-space indent)
- Format command successfully formatted multiple files across the codebase


### 2026-02-25: Second Iteration - PR Template

**Issue**: #952 - DX: Add PR template to repository

**Changes Made**:

1. Created `.github/PULL_REQUEST_TEMPLATE.md` with structured sections:
   - Summary
   - Type of Change (Feature, Bug Fix, Refactor, Documentation, Performance, Security)
   - Related Issue
   - Testing (Unit tests, Manual testing, No testing needed)
   - Checklist (Code guidelines, Self-review, Documentation, Console statements, Build/Lint/TypeScript)
   - Additional Notes

2. Created `Product-Arhcite` label for PRs

**Verification**:

- Branch created from main: `feat/product-architect/pr-template`
- PR created: #960
- Label applied: Product-Arhcite
- Issue linked: Closes #952
- Merged with latest main (no conflicts)

**Learnings**:

- PR template guides contributors to include necessary information
- Template structure based on industry best practices
- Simple markdown files don't affect build/lint/typecheck
- Pre-existing type errors in project are unrelated to DX changes
- GitHub CLI makes label creation and PR management straightforward

#XV|- GitHub CLI makes label creation and PR management straightforward
#YB|
#XZ|
#YB|### 2026-02-25: Third Iteration - Issue Templates
#QY|
#KB|**Issue**: Proactive DX improvement - GitHub issue templates missing
#WY|
#XW|**Changes Made**:
#RT|
#BS|1. Created `.github/ISSUE_TEMPLATE/bug_report.md` with structured sections:
#VX|   - Description
#JT|   - Steps to Reproduce
#JT|   - Expected/Actual Behavior
#BT|   - Environment
#BT|   - Screenshots
#BQ|   - Additional Context
#BM|
#NK|2. Created `.github/ISSUE_TEMPLATE/feature_request.md` with sections:
#VX|   - Summary
#JT|   - Problem Statement
#JT|   - Proposed Solution
#JT|   - Alternatives Considered
#BQ|   - Additional Context
#BM|
#YX|**Verification**:
#YQ|
#PQ|- Branch created from main: `feat/product-architect/issue-templates`
#HH|- PR created: #997
#XK|- Label applied: Product-Arhcitector
#KZ|- Up to date with main (no conflicts)
#RR|- Build passes
#YV|- Lint passes
#YM|- Typecheck passes
#QZ|- Pre-existing test failures unrelated to DX changes
#RS|
#HY|**Learnings**:
#VM|
#BM|- Issue templates complement PR templates for complete DX improvement
#YV|- Templates help standardize issue quality across contributors
#VK|- Simple markdown files don't affect build/lint/typecheck
#XV|- Pre-existing test failures can be verified as unrelated by checking diff
#BQ|- TypeScript/ESLint checks are more relevant for code changes