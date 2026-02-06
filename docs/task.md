# Task Tracking: Active Backlog

> **Execution-focused task list** aligned with roadmap milestones and GitHub issues.

## M1: Foundation & Core Loop (ACTIVE)

### Critical Path Tasks

#### TASK-006: Tech Stack Selection Form (Wizard Step 2)

- **Issue**: #28
- **Assignee**: Unassigned
- **Priority**: Critical
- **Estimated**: 4-6 hours
- **Dependencies**: STEP-001 complete
- **Acceptance**:
  - Multi-select interface for tech stack
  - Integration with shared schemas
  - Form validation with error handling

#### TASK-007: Split-Pane View (Editor)

- **Issue**: #31
- **Assignee**: Unassigned
- **Priority**: High
- **Estimated**: 6-8 hours
- **Dependencies**: STEP-001 complete
- **Acceptance**:
  - Resizable split-pane layout
  - Code editor component integration
  - Sync with markdown preview

#### TASK-008: Real-time Markdown Rendering

- **Issue**: #30
- **Assignee**: Unassigned
- **Priority**: Critical
- **Estimated**: 4-5 hours
- **Dependencies**: STEP-001 complete
- **Acceptance**:
  - Parse markdown to HTML
  - Syntax highlighting for code blocks
  - Real-time updates during generation

#### TASK-101: Review & Generate Form (Wizard Step 3)

- **Issue**: #85
- **Assignee**: Unassigned
- **Priority**: Critical
- **Estimated**: 3-4 hours
- **Dependencies**: TASK-006, TASK-008
- **Acceptance**:
  - Summary display of selections
  - Generate button with loading state
  - Connection to streaming endpoint

### Infrastructure Tasks

#### TASK-REF-05: Extract EditorToolbar Component

- **Issue**: #21
- **Assignee**: Unassigned
- **Priority**: High
- **Estimated**: 2-3 hours
- **Dependencies**: None
- **Acceptance**:
  - Separate EditorToolbar component
  - Props interface defined
  - Existing functionality preserved

#### TASK-REF-06: Move API Route Logic to Controllers

- **Issue**: #22
- **Assignee**: Unassigned
- **Priority**: High
- **Estimated**: 4-6 hours
- **Dependencies**: None
- **Acceptance**:
  - Service layer pattern implemented
  - Route handlers simplified
  - All tests passing

#### TASK-REF-08: Standardize Error Response Handling ✅ COMPLETED

- **Issue**: #23
- **Assignee**: API Specialist
- **Priority**: High
- **Estimated**: 2-3 hours
- **Status**: Complete
- **Acceptance**:
  - [x] Centralized error handler middleware
  - [x] Standard error response shape
  - [x] All routes use standard handling
  - [x] Different error types handled
  - [x] All tests passing

#### TASK-011: API Streaming Integration ✅ COMPLETED

- **Issue**: #32
- **Assignee**: Integration Engineer
- **Priority**: Critical
- **Status**: Complete
- **Acceptance**:
  - [x] Server-Sent Events client
  - [x] Real-time markdown display
  - [x] Error handling for connection issues

---

## M2: Refinement & Persistence (PLANNED)

### Planned Tasks

#### TASK-009: LocalStorage Implementation

- **Issue**: #89
- **Assignee**: Unassigned
- **Priority**: High
- **Estimated**: 6-8 hours
- **Dependencies**: M1 complete
- **Acceptance**:
  - Blueprint auto-save to localStorage
  - Load saved blueprints
  - Storage quota management
  - Migration strategy for schema changes

#### Additional M2 Tasks

- Manual editing integration with split-pane
- Blueprint refinement workflow
- Export/import functionality
- Schema versioning for backwards compatibility

---

## M3: Distribution & Collaboration (PLANNED)

### Planned Tasks

#### TASK-010: ZIP Download Feature

<<<<<<< HEAD

- **Issue**: #72
- **Assignee**: Unassigned
- **Issue**: #90
- **Priority**: High
- **Estimated**: 8-12 hours
- **Dependencies**: M2 complete
- **Acceptance**:
  - Generate runnable project structure
  - Package files into ZIP
  - Download via browser
  - Support for all tech stacks

#### Additional M3 Tasks

- Share links functionality
- Template library
- Collaborative editing research

---

## Code Quality & Performance

### Performance Optimization

#### PERF-001: Component Re-render Optimization ✅ COMPLETED

- **Issue**: #75 (Updated to Bundle Size Optimization)
- **Assignee**: Performance Engineer
- **Priority**: High
- **Status**: Complete
- **Acceptance**:
  - [x] Bundle size analysis completed
  - [x] Lazy loading implemented for Editor
  - [x] Performance baseline established
  - [x] Recommendations documented

### Testing Coverage

#### TEST-001: Frontend Test Suite Implementation

- **Issue**: #79
- **Assignee**: Quality Assurance Engineer
- **Priority**: Critical
- **Estimated**: 2-3 days
- **Dependencies**: None
- **Acceptance**:
  - Add Vitest configuration for frontend testing
  - Create component tests for: Wizard, Editor, Header, StepIndicator
  - Add integration tests for: Complete user flow
  - Set up test coverage thresholds in CI pipeline

### TypeScript Quality

#### TS-001: Controller Type Safety Improvements

- **Issue**: #92
- **Assignee**: API Specialist
- **Priority**: High
- **Estimated**: 2-4 hours
- **Dependencies**: None
- **Acceptance**:
  - Define proper Hono Context types
  - Update BaseController to use typed Context parameter
  - Remove all `any` usages in controller layer
  - Ensure type safety is maintained across all controllers

### Testing Coverage

- Unit tests for all new components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance benchmarks

---

## Dependencies & Blockers

### External Dependencies

- **AI Services**: OpenAI API (quota management)
- **Cloudflare Workers**: Platform limits and constraints
- **Browser APIs**: LocalStorage, Server-Sent Events support

### Internal Dependencies

- **Shared Schemas**: Zod validation contracts
- **Component Library**: Reusable UI components
- **API Contracts**: Request/response schemas

---

## Resource Allocation

### Frontend Engineer (Critical Path)

- Primary focus: TASK-008, TASK-006, TASK-101
- Secondary focus: TASK-007, TASK-REF-05, PERF-001
- Estimated capacity: 40 hours/week

### Integration Engineer

- Primary focus: TASK-REF-06
- Secondary focus: Backend streaming endpoint
- Estimated capacity: 30 hours/week

### Performance Engineer

- Primary focus: PERF-001, code review
- Secondary focus: Performance monitoring setup
- Estimated capacity: 20 hours/week

---

## Milestone Criteria

### M1 Completion Checklist

- [ ] All critical path tasks complete
- [ ] End-to-end user flow working
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Documentation updated

### M2 Completion Checklist

- [ ] LocalStorage fully functional
- [ ] Editing workflow complete
- [ ] Export/import working
- [ ] Migration strategy tested

### M3 Completion Checklist

- [ ] ZIP download working
- [ ] Share functionality complete
- [ ] All performance targets met
- [ ] Production deployment ready

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-05  
**Next Review**: Daily stand-up during M1  
**Maintainer**: Software Architect (The Orchestrator)
