# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information.

## Active Bugs

### BUG-008: Critical Security Vulnerabilities - Authentication Bypass Risk 🔴

**Status**: Active  
**Priority**: Critical  
**Area**: Security Engineering  
**First Reported**: 2026-02-12 (Security Engineer Assessment)  
**Issue Reference**: #307

#### Description

Multiple high-severity vulnerabilities in core dependencies allowing authentication bypass, XSS, and system compromise.

#### Critical Vulnerabilities

1. **Hono Framework (<=4.11.6)** - Authentication bypass via JWT confusion
   - CVEs: GHSA-3vhc-576x-3qv4, GHSA-f67f-6cw9-2mq4
   - Impact: Unauthorized access to API endpoints
   - Fix: Update to hono@^4.11.7

2. **devalue Package (5.1.0-5.6.1)** - DoS vulnerability
   - CVEs: GHSA-g2pg-6438-jwpf, GHSA-vw5p-8cq8-m7mv
   - Impact: Memory/CPU exhaustion attacks
   - Fix: Update to devalue@^5.7.0

3. **Lodash (4.0.0-4.17.21)** - Prototype pollution
   - CVE: GHSA-xxjr-mmjv-4gpg
   - Impact: Object prototype manipulation attacks
   - Fix: Update to lodash@^4.17.21+

#### Blockers

- **Workspace Dependency Conflicts**: Issue #308 preventing automatic security updates
- **Vitest Version Conflicts**: Blocking package resolution

#### Required Actions

- [ ] Resolve workspace dependency conflicts (Issue #308)
- [ ] Update all vulnerable packages
- [ ] Comprehensive regression testing
- [ ] Production deployment with monitoring

**Timeline**: 24-48 hours (critical)  
**Risk**: HIGH - System compromise possible

---

### BUG-009: Workspace Dependency Conflicts Blocking Security Updates 🔴

**Status**: Active  
**Priority**: High  
**Area**: DevOps Engineering  
**First Reported**: 2026-02-12 (Security Assessment Blocker)  
**Issue Reference**: #308

#### Description

Vitest workspace version conflicts prevent application of critical security patches.

#### Root Cause

- Vitest version mismatch across monorepo workspaces
- Conflicting peer dependencies
- Workspace resolution failing on security update attempts

#### Impact

- Blocks Issue #307 (Critical Security Vulnerabilities)
- Prevents automatic npm audit fixes
- Blocks hono, devalue, and lodash security updates

#### Required Actions

- [ ] Standardize vitest versions across workspaces
- [ ] Resolve peer dependency conflicts
- [ ] Enable security patch application
- [ ] Validate all workspaces build successfully

**Timeline**: 2-4 hours  
**Risk**: HIGH - Critical blocker

---

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

### BUG-001: Frontend Bundle Size Performance Issue

**Status**: Open  
**Priority**: High  
**Area**: Performance Engineering  
**First Reported**: 2026-02-05 (BroCula Analysis)

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

**Required Actions**:

- [ ] Implement more aggressive code splitting
- [ ] Consider tree-shaking for CodeMirror extensions
- [ ] Add lazy loading for non-critical components
- [ ] Optimize bundle splitting strategy

#### Target Resolution

- **Timeline**: M2 completion
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
**Last Updated**: 2026-02-06  
**Next Review**: Weekly during M1 completion  
**Maintainer**: Software Architect (The Orchestrator)
