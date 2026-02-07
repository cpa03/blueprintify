# Roadmap: Strategic Phases

> **Milestone-based development plan** for Blueprintify with clear phases and deliverables.

## Current Status: M1 (Foundation & Core Loop)

### M1: Foundation & Core Loop - **ACTIVE (90% Complete)**

**Objective**: Establish the basic "Input → Generate → View" user flow

#### Status Overview

- **Monorepo Structure**: ✅ Complete (100%)
- **Blueprint Definition**: ✅ Complete (100%)
- **Shared Schemas (Zod)**: ✅ Complete (100%)
- **API Streaming Endpoint**: ✅ Complete (100%)
- **Basic Wizard UI**: ✅ Complete (100% - All 5 wizard steps functional)
- **Real-time Markdown Rendering**: ❌ Not Started (0%)

#### Critical Path Issues

1. **Issue #30**: [FRONTEND] Implement Real-time Markdown Rendering Component
2. **Issue #31**: [FRONTEND] Implement Split-Pane View (Editor)

#### Recently Completed

- **Issue #28**: [FRONTEND] Implement Tech Stack Selection Form (Wizard Step 2) ✅
- **Issue #97**: TASK-102: Complete Basic Wizard UI Implementation (All Steps) ✅
- **Issue #119**: [FRONTEND] Implement Review & Generate Form (Wizard Step 3) ✅
- **Issue #136**: Update M1 Progress - Wizard Step 3 Completed ✅

#### Parallel Work

- **Issue #31**: [FRONTEND] Implement Split-Pane View (Editor)

#### Code Quality (Deferred to post-M1)

- **Issue #21**: [REFACTOR] Extract EditorToolbar from Editor.tsx
- **Issue #22**: [REFACTOR] Move API Route Logic to Controllers
- **Issue #40**: [PERF] Optimize React Component Re-renders

---

### M2: Refinement & Persistence - **READY TO START (0% Complete)**

**Objective**: Add editing capabilities and local storage

#### Prerequisites

- ✅ M1 Wizard completion (All 5 steps functional)
- ⚠️ Split-pane editor implementation (Issue #31 - IN PROGRESS)
- ⚠️ Real-time Markdown Rendering (Issue #30 - IN PROGRESS)

**Status**: Ready to begin as soon as M1 rendering components are complete

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
- [ ] Real-time generation visible in UI
- [ ] Generated markdown renders correctly
- [ ] Error handling works across all endpoints
- [ ] All CI tests passing

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
**Last Updated**: 2026-02-05  
**Next Review**: After M1 Completion  
**Maintainer**: Software Architect (The Orchestrator)
