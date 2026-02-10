# Roadmap: Strategic Phases

> **Milestone-based development plan** for Blueprintify with clear phases and deliverables.

## Current Status: M2 (Refinement & Persistence)

### M1: Foundation & Core Loop - **COMPLETED (100% Complete)**

**Objective**: Establish the basic "Input → Generate → View" user flow

#### Status Overview

- **Monorepo Structure**: ✅ Complete (100%)
- **Blueprint Definition**: ✅ Complete (100%)
- **Shared Schemas (Zod)**: ✅ Complete (100%)
- **API Streaming Endpoint**: ✅ Complete (100%)
- **Basic Wizard UI**: ✅ Complete (100% - All 5 wizard steps functional)
- **Real-time Markdown Rendering**: ✅ Complete (Issue #30)
- **Split-Pane Editor**: ✅ Complete (Issue #31)
- **ZIP Download Feature**: ✅ Complete (Issue #106)

#### Recently Completed

- **Issue #31**: [FRONTEND] Implement Split-Pane View (Editor) ✅
- **Issue #30**: [FRONTEND] Implement Real-time Markdown Rendering ✅
- **Issue #106**: TASK-010: Implement ZIP Download Feature ✅
- **Issue #215**: TASK-M2-KICKSTART: Prepare M2 Refinement & Persistence Phase ✅

---

### M2: Refinement & Persistence - **ACTIVE (0% Complete)**

**Objective**: Add editing capabilities and local storage

#### Prerequisites

- ✅ M1 Wizard completion (All 5 steps functional)
- ✅ Split-pane editor implementation (Issue #31 - COMPLETED)
- ✅ Real-time Markdown Rendering (Issue #30 - COMPLETED)
- ✅ M2 Preparation completed (Issue #215 - COMPLETED)

**Status**: Active - All prerequisites met, implementation in progress
**Critical Blockers**: ✅ RESOLVED - CI/CD and QA issues fixed (2026-02-10)

#### Recently Completed

- **Issue #28**: [FRONTEND] Implement Tech Stack Selection Form (Wizard Step 2) ✅
- **Issue #97**: TASK-102: Complete Basic Wizard UI Implementation (All Steps) ✅
- **Issue #119**: [FRONTEND] Implement Review & Generate Form (Wizard Step 3) ✅
- **Issue #136**: Update M1 Progress - Wizard Step 3 Completed ✅
- **Issue #30**: [FRONTEND] Implement Real-time Markdown Rendering ✅
- **Issue #148**: Live Generation Progress Indicator ✅
- **Issue #167**: Performance Validation & Benchmarks ✅
- **Issue #156**: Frontend Test Suite Implementation ✅

#### Parallel Work

- **Issue #31**: [FRONTEND] Implement Split-Pane View (Editor) - IN PROGRESS
- **Issue #30**: [FRONTEND] Implement Real-time Markdown Rendering - IN PROGRESS

#### Code Quality (Deferred to post-M1)

- **Issue #21**: [REFACTOR] Extract EditorToolbar from Editor.tsx
- **Issue #22**: [REFACTOR] Move API Route Logic to Controllers
- **Issue #40**: [PERF] Optimize React Component Re-renders

---

### M2: Refinement & Persistence - **ACTIVE (0% Complete)**

**Objective**: Add editing capabilities and local storage

#### Prerequisites

- ✅ M1 Wizard completion (All 5 steps functional)
- ✅ Split-pane editor implementation (Issue #31 - COMPLETED)
- ✅ Real-time Markdown Rendering (Issue #30 - COMPLETED)

**Status**: Active - All prerequisites met, implementation in progress

#### M2 Support Tasks

##### SECURITY-M2-001: Input Sanitization ✅ ISSUED

- **Issue**: #228
- **Assignee**: API Specialist
- **Priority**: High
- **Status**: Open
- **Acceptance**:
  - All user inputs sanitized before storage
  - XSS protection implemented across all entry points
  - Security tests added to CI pipeline

##### PERF-M2-001: LocalStorage Performance ✅ ISSUED

- **Issue**: #229
- **Assignee**: Performance Engineer
- **Priority**: High
- **Status**: Open
- **Acceptance**:
  - Load time < 500ms for blueprints up to 1MB
  - Smooth editing experience without lag
  - Performance benchmarks implemented

##### TEST-M2-001: Comprehensive Test Suite ✅ ISSUED

- **Issue**: #230
- **Assignee**: Quality Assurance
- **Status**: Open
- **Acceptance**:
  - Minimum 90% code coverage for M2 features
  - All critical user flows tested
  - CI pipeline passes all test suites

---

### M3: Distribution & Collaboration - **PLANNED (0% Complete)**

**Objective**: Enable sharing and collaboration features

#### Planned Features

- **TASK-010**: Download generated projects as ZIP files
- Share links to blueprints
- Collaborative editing (future scope)
- Template library

#### Prerequisites

- M2 completion (Persistence + Refinement)
- Advanced export capabilities

---

## Timeline Estimates

### Current Focus: M1 Completion

- **Remaining Work**: 1-2 days (dedicated Frontend Engineer)
- **Blockers**: None identified
- **Dependencies**: External AI services available
- **Status**: Wizard UI complete, focusing on rendering and editor components

### M2 Start: After M1 Complete

- **Estimated Duration**: 3-5 days
- **Focus**: LocalStorage integration + editing features

### M3 Start: After M2 Complete

- **Estimated Duration**: 5-7 days
- **Focus**: Distribution features + advanced export

---

## Success Metrics

### M1 Success Criteria

- [x] Users can complete full wizard workflow (5 steps: info, stack, features, review, generating)
- [x] Real-time generation visible in UI
- [x] Generated markdown renders correctly
- [x] Error handling works across all endpoints
- [x] All CI tests passing

### M2 Success Criteria

- [ ] Blueprints persist in localStorage
- [ ] Users can edit generated content
- [ ] Refinement workflow functional
- [ ] Export/import working

### M3 Success Criteria

- [ ] ZIP download generates runnable projects
- [ ] Share links work correctly
- [ ] Performance meets standards

---

## Risk Assessment

### Technical Risks

- **Low**: Monorepo structure established
- **Medium**: Streaming implementation complexity (completed)
- **Low**: External AI API dependencies (well-documented)

### Timeline Risks

- **Medium**: Frontend resource availability (critical path heavy on frontend)
- **Low**: Backend complexity (minimal API surface)
- **Low**: Integration complexity (well-defined contracts)

---

## Strategic Decisions

### Architecture Decisions Made

- **Cloudflare Workers**: Serverless, scalable, cost-effective
- **React + TypeScript**: Industry standard, strong ecosystem
- **Hono**: Lightweight, fast Workers framework
- **Zod**: Type-safe validation across boundaries

### Technology Choices Justified

- **Vite over Webpack**: Faster development, simpler config
- **Tailwind CSS**: Rapid UI development, consistent design
- **Vitest**: Unified testing across frontend and backend
- **Conventional Commits**: Automated changelog, clear history

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-10  
**Next Review**: Daily stand-up during M2 execution  
**Maintainer**: Software Architect (The Orchestrator)
