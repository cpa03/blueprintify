# Bug Log: Known Defects

> **Tracking known bugs and defects** for Blueprintify with status and priority information.

## Active Bugs

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

### BUG-002: Missing Font Display Optimization

**Status**: Open  
**Priority**: Low  
**Area**: Frontend Engineering  
**First Reported**: 2026-02-05 (BroCula Analysis)

#### Description

Google Fonts URLs missing `display=swap` parameter, affecting Cumulative Layout Shift (CLS).

#### Symptoms

- Potential CLS performance impact
- Font loading behavior not optimized

#### Root Cause

- Font URLs in index.html lack display=swap parameter

#### Fix Status

**Required Actions**:

- [ ] Add display=swap to Google Fonts URLs
- [ ] Test CLS improvement
- [ ] Verify no visual regression

#### Target Resolution

- **Timeline**: M2 (low priority)
- **Impact**: Minor CLS improvement
- **Priority**: Low

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
