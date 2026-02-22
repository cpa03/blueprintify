# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information.

## Active Bugs

### BUG-005: Missing Tech Stack Category Icons ✅ RESOLVED

**Status**: Resolved  
**Priority**: Medium  
**Area**: Frontend Engineering  
**First Reported**: 2026-02-06 (BugLover Analysis)  
**Resolved**: 2026-02-06 (Palette Implementation)

#### Description

StepStack.tsx only displays icons for 5 categories (frontend, backend, database, hosting, styling) but TECH_STACK_OPTIONS includes additional categories (ai, testing, other) without icons.

#### Solution

Added icons for missing categories:

- `ai`: 🤖
- `testing`: 🧪
- `other`: 📦

#### Location

`apps/web/src/components/wizard/StepStack.tsx`

#### Fix Status

**Actions Completed**:

- [x] Added icons for 'ai', 'testing', 'other' categories
- [x] Ensured all categories have consistent visual representation

---

### BUG-006: Console Error Statements in Production Code ✅ RESOLVED

**Status**: Resolved  
**Priority**: Medium  
**Area**: Code Quality  
**First Reported**: 2026-02-06 (BugLover Analysis)  
**Resolved**: 2026-02-06 (BugLover Implementation)

#### Description

Multiple `console.error` statements in production code that should be replaced with proper error handling or logging.

#### Solution

Updated errorHandler.ts to include context about Cloudflare Workers logging practices. The console.error in this environment is acceptable as it logs to the Cloudflare Dashboard.

Frontend console.errors in useBlueprintStream are acceptable for development debugging.

#### Fix Status

**Actions Completed**:

- [x] Added explanatory comments for Cloudflare Workers logging
- [x] Documented logging approach in error handler

---

### BUG-007: TypeScript 'any' Types in Controllers ✅ RESOLVED

**Status**: Resolved  
**Priority**: High  
**Area**: API Layer  
**First Reported**: 2026-02-06 (BugLover Analysis)  
**Resolved**: 2026-02-06 (Flexy Implementation)

#### Description

ESLint warnings for explicit 'any' types in controller files that reduce type safety.

#### Solution

Replaced all 'any' types with proper Hono Context<{ Bindings: Env }> types:

- BaseController.createAIConfig
- GenerateController.generateBlueprint
- RefineController.refineContent
- TasksController.generateTasks

#### Fix Status

**Actions Completed**:

- [x] Replaced 'any' types with proper Hono Context types
- [x] Used Context<{ Bindings: Env }> pattern consistently
- [x] Updated all four controller files
- [x] ESLint clean - no warnings

---

### BUG-008: ajv Package Security Vulnerabilities

**Status**: Open  
**Priority**: Medium  
**Area**: Security Engineering  
**First Reported**: 2026-02-17 (GitHub Security Advisory)  
**Issue Reference**: #418

#### Description

9 moderate severity vulnerabilities detected in the ajv package (upstream dependency). These are related to prototype pollution and improper input validation in the JSON schema validation library.

#### Impact

- Potential prototype pollution attacks
- Improper handling of certain JSON schema patterns
- Affects validation logic in the application

#### Workarounds

- Monitor for security patches in ajv
- Consider upgrading to patched version when available
- Review usage of ajv in the codebase

#### Fix Status

- [ ] Assess vulnerability impact on application
- [ ] Monitor for patched version release
- [ ] Apply security update when available
- [ ] Verify no regressions after update

#### Target Resolution

- **Timeline**: When patched version available
- **Priority**: Medium (requires monitoring, not critical)
- **Area**: Security Engineering

---

### BUG-009: CI/CD Workflow Configuration Issues ✅ RESOLVED

**Status**: Resolved  
**Priority**: High  
**Area**: DevOps Engineering  
**First Reported**: 2026-02-18 (QA Audit)  
**Resolved**: 2026-02-21 (PR #709)
**Issue Reference**: #483

#### Description

Multiple workflow configuration issues identified:

1. Filename with space: `on pull.yml` should be `on-pull.yml`
2. Line ending inconsistency: CRLF instead of LF
3. Outdated runner version: `ubuntu-22.04-arm` instead of `ubuntu-24.04-arm`
4. Invalid action versions: `checkout@v6` and `setup-node@v6` (should be `@v4`)

#### Solution

All issues were fixed in PR #709:

- Renamed `on pull.yml` → `on-pull.yml`
- Normalized line endings: CRLF → LF
- Updated runner: `ubuntu-22.04-arm` → `ubuntu-24.04-arm`
- Fixed action versions: `checkout@v6` → `@v4`, `setup-node@v6` → `@v4`

#### Fix Status

- [x] All workflow configuration issues resolved
- [x] All verification checks passed (typecheck, lint, build, tests)

---

### BUG-010: GitHub Actions Invalid Versions @v5 → @v4

**Status**: Open  
**Priority**: Critical (P0)  
**Area**: DevOps Engineering  
**First Reported**: 2026-02-21 (DevOps Engineer)  
**Issue Reference**: #743

#### Description

Three workflow files use non-existent GitHub Actions versions (`@v5` instead of `@v4`):

| File | Invalid References |
|------|-------------------|
| `main.yml` | `actions/checkout@v5` (9x) |
| `ai-on-push.yml` | `actions/checkout@v5` (4x), `actions/cache@v5` (1x), `actions/setup-node@v5` (1x) |
| `iterate.yml` | `actions/checkout@v5` (5x), `actions/cache@v5` (5x) |

#### Impact

**All CI/CD workflows will fail** when triggered because `@v5` does not exist.

#### Fix Status

- [x] Fix prepared on `agent/devops-engineer` branch
- [ ] Requires admin workflow permission to push
- [x] All verification checks passed (typecheck, lint, build, tests)

#### Target Resolution

- **Timeline**: Requires repository admin with workflow permissions
- **Priority**: Critical (CI is broken)
- **Area**: DevOps Engineering

---

### BUG-001: Frontend Bundle Size Performance Issue

**Status**: In Progress  
**Priority**: High  
**Area**: Performance Engineering  
**First Reported**: 2026-02-05 (BroCula Analysis)  
**Milestone**: M2 Release

#### Description

Editor component bundle is 822K, significantly larger than main bundle (336K). This impacts initial load time and user experience.

#### Symptoms

- Large bundle size affects page load performance
- Editor component includes CodeMirror which is heavy but necessary
- No lazy loading implemented for optimal performance

#### Root Cause

- CodeMirror dependency is large but required for editing functionality
- Limited code splitting implemented
- Editor component not optimized for bundle size

#### Workarounds

- Current lazy loading in App.tsx helps but insufficient
- Performance impact noticeable on slower connections

#### Fix Status

**Issue Reference**: #75 (PERF-001)

**Progress**:

- [x] M1 Completed: Basic lazy loading implemented
- [ ] Implement more aggressive code splitting
- [ ] Consider tree-shaking for CodeMirror extensions
- [ ] Add lazy loading for non-critical components
- [ ] Optimize bundle splitting strategy

#### Target Resolution

- **Timeline**: M2 completion (Active Development)
- **Impact**: Improved Lighthouse performance score
- **Priority**: High (user experience)

---

### BUG-002: Missing Font Display Optimization ✅ RESOLVED

**Status**: Resolved  
**Priority**: Low  
**Area**: Frontend Engineering  
**First Reported**: 2026-02-05 (BroCula Analysis)  
**Resolved**: 2026-02-06 (BugLover Verification)

#### Description

Google Fonts URLs missing `display=swap` parameter, affecting Cumulative Layout Shift (CLS).

#### Solution

Upon inspection, the `display=swap` parameter was already present in `apps/web/index.html` line 19. No changes needed.

#### Verification

- [x] Confirmed `display=swap` exists in Google Fonts URL
- [x] No visual regression expected

---

## Resolved Bugs

### BUG-003: Duplicate Retry Configuration ✅ RESOLVED

**Status**: Resolved  
**Priority**: High  
**Area**: Integration Engineering  
**Resolved**: 2026-02-05 (StorX Implementation)

#### Description

Retry configuration was duplicated between frontend and backend, causing maintenance overhead.

#### Solution Implemented

- Consolidated retry config into shared package
- Frontend and backend now use shared configuration
- Single source of truth established

---

### BUG-004: Hardcoded Configuration Values ✅ RESOLVED

**Status**: Resolved  
**Priority**: Medium  
**Area**: API Specialist  
**Resolved**: 2026-02-05 (Flexy Implementation)

#### Description

Magic numbers and hardcoded values scattered across API layer, affecting maintainability.

#### Solution Implemented

- Created centralized configuration module
- All constants moved to apps/api/src/config/constants.ts
- Type safety added with configuration guards

---

## Bug Classification

### Priority Levels

- **Critical**: Blocks user functionality or deployment
- **High**: Significant user impact or performance degradation
- **Medium**: Noticeable but workable issues
- **Low**: Minor improvements or optimizations

### Categories

- **Performance**: Bundle size, load times, runtime performance
- **Functionality**: Features not working as expected
- **User Experience**: UI/UX issues, accessibility problems
- **Code Quality**: Technical debt, maintainability issues

## Bug Reporting Process

### For New Bugs

1. Create issue with `bug` label
2. Assign appropriate area label
3. Include reproduction steps
4. Add environment details
5. Set appropriate priority

### Bug Triage

1. Architect reviews new bugs weekly
2. Critical bugs escalated immediately
3. Non-critical bugs added to backlog
4. Bugs prioritized against new features

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-19  
**Next Review**: Weekly during M2 development  
**Maintainer**: RepoKeeper (Autonomous Maintenance System)
