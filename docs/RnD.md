# RnD (Research & Development)

## Overview

This document serves as the long-term memory for the RnD autonomous agent working on this repository.

## Mission

Deliver small, safe, measurable improvements strictly inside the domain of this project.

## Phases

### 1. INITIATE

- Check for existing PRs with "RnD" label
- Check for open issues
- If none exist, perform proactive scan for valuable improvements
- Select issue or create one for the improvement

### 2. PLAN

- Analyze the selected issue
- Create work breakdown
- Identify dependencies and parallel execution opportunities

### 3. IMPLEMENT

- Execute the improvement
- Follow existing code patterns
- Keep changes small and atomic

### 4. VERIFY

- Run typecheck, lint, and build
- Ensure no regressions
- Test the change manually if needed

### 5. SELF-REVIEW

- Analyze the process
- Document what worked and what didn't
- Identify areas for improvement

### 6. SELF EVOLVE

- Update this document with lessons learned
- Improve future iterations
- Maintain knowledge base

### 7. DELIVER

- Create PR with "RnD" label
- Link to issue
- Ensure up-to-date with default branch
- No conflicts
- Build/lint/test success
- Zero warnings

## Past Improvements

### 2026-02-27

**Issue**: #1111 - CI/CD Workflow Invalid GitHub Actions Versions @v5

**Changes**:

- Replaced all `actions/checkout@v5` with `@v4` (main.yml: 9x, iterate.yml: 5x)
- Replaced all `actions/cache@v5` with `@v4` (iterate.yml: 5x)
- Total: 19 @v5 references replaced with @v4

**Files Modified**:

- `.github/workflows/main.yml`
- `.github/workflows/iterate.yml`

**Verification**:

- YAML syntax: PASS (validated with Python yaml parser)
- Note: Could not push workflow changes due to GitHub App permission limitation

**Status**: PR created (#1151) - requires manual workflow file update due to GitHub App limitations

### 2026-02-26

**Issue**: #1088 - No Secrets Detection in CI

**Changes**:

- Added gitleaks-action to pr-gatekeeper workflow
- Added STAGE 2: SECRETS DETECTION before security engineer stage
- Updated subsequent stage numbers (3→4, 4→5)

**Files Modified**:

- `.github/workflows/pr-gatekeeper.yml`

**Verification**:

- Typecheck: PASS
- Lint: PASS
- YAML validation: PASS

### 2026-02-26

**Issue**: #1088 - No Secrets Detection in CI

**Changes**:

- Added gitleaks-action to pr-gatekeeper workflow
- Added STAGE 2: SECRETS DETECTION before security engineer stage
- Updated subsequent stage numbers (3→4, 4→5)

**Files Modified**:

- `.github/workflows/pr-gatekeeper.yml`

**Verification**:

- Typecheck: PASS
- Lint: PASS
- YAML validation: PASS

## Selection Criteria for Improvements

### Good RnD Candidates

- Security improvements (secrets detection, input validation)
- Testing coverage gaps
- CI/CD improvements
- Developer experience enhancements
- Small bug fixes

### Avoid

- Large refactors affecting multiple modules
- New features requiring significant design
- Changes outside project domain

## Notes

- Always verify YAML syntax for workflow changes
- Keep PRs small and atomic
- Link PRs to issues
- Use conventional commit messages
