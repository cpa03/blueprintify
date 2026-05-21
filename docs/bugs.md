# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information.

## Active Bugs

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

### BUG-008: ajv Package Security Vulnerabilities

**Status**: Open  
**Priority**: Medium  
**Area**: Security Engineering  
**First Reported**: 2026-02-09  
**Dependency**: ajv (indirect, through @slack/types or similar)

#### Description

Security vulnerabilities in ajv package used as indirect dependency.

#### Current Status

- Affected package: ajv (indirect dependency)
- Severity: Review pending
- Mitigation: Dependency updates tracked through npm audit

---

### BUG-010: GitHub Actions Invalid Versions @v5 → @v4

**Status**: Open  
**Priority**: Medium  
**Area**: DevOps Engineering  
**First Reported**: 2026-02-10

#### Description

GitHub Actions workflows reference `@v5` action versions that don't exist, causing CI failures.

#### Workaround

This is a known issue that requires repository admin permissions to fix. If your PR CI fails with version errors, this is likely BUG-010 and not related to your changes.

---

## Resolved Bugs

- **BUG-002**: Missing Font Display Optimization (Resolved)
- **BUG-003**: Duplicate Retry Configuration (Resolved)
- **BUG-004**: Hardcoded Configuration Values (Resolved)
- **BUG-005**: Missing Tech Stack Category Icons (Resolved)
- **BUG-006**: Console Error Statements in Production Code (Resolved)
- **BUG-007**: TypeScript 'any' Types in Controllers (Resolved)
- **BUG-009**: CI/CD Workflow Configuration Issues (Resolved)
- **BUG-011**: Flaky Analytics Date Range Test (Resolved)
- **BUG-012**: Unhandled Rejection Warnings in Rate Limit Tests (Resolved)

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-21  
**Maintainer**: RepoKeeper (Autonomous Maintenance System)
