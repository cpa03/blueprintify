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

### BUG-013: Upstream npm Vulnerabilities (undici, ws via wrangler/miniflare)

**Status**: Upstream Dependency (Cannot Fix)  
**Priority**: Low  
**Area**: DevOps Engineering  
**First Reported**: 2026-05-22

#### Description

npm audit reports 5 vulnerabilities (3 moderate, 2 high) in `undici` and `ws` packages. These are transitive dependencies of Cloudflare tooling (`wrangler` → `miniflare` → `undici`/`ws`).

#### Current Status

- undici: Override set to 7.25.0 (latest 7.x), but nested miniflare copy at 7.18.2 not fully bypassed
- ws: Override set to 8.20.1 (above vulnerable 8.20.0), but nested miniflare copy at 8.18.0
- Full fix requires `@cloudflare/vitest-pool-workers@0.16.8+`, which needs Node 22+ and vitest 4.x
- Tracking upstream: Cloudflare Workers SDK compatibility

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
- **BUG-010**: GitHub Actions Invalid Versions @v5 → @v4 (Resolved 2026-05-22)

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-22  
**Maintainer**: RepoKeeper (Autonomous Maintenance System)

> RepoKeeper cycle 2026-05-22: Build/lint/test all passing. No new bugs identified.
