# Task Tracking: Active Backlog

> **Execution-focused task list** aligned with roadmap milestones and GitHub issues.

## M1: Foundation & Core Loop (COMPLETED)

### Completed Critical Path Tasks

#### TASK-007: Split-Pane View (Editor) ✅ COMPLETED

- **Issue**: #31
- **Assignee**: Frontend Engineer
- **Priority**: Critical
- **Status**: Complete
- **Completed**: 2026-02-10
- **Estimated**: 6-8 hours
- **Dependencies**: TASK-008 complete
- **Acceptance**:
  - [x] Resizable split-pane layout
  - [x] Code editor component integration
  - [x] Sync with markdown preview

#### Additional Completed Tasks

- **TASK-006**: Tech Stack Selection Form ✅ (#28)
- **TASK-008**: Real-time Markdown Rendering ✅ (#30)
- **TASK-102**: Complete Basic Wizard UI ✅ (#97)
- **TASK-010**: ZIP Download Feature ✅ (#106)
- **TASK-M2-KICKSTART**: M2 Preparation ✅ (#215)

### Infrastructure Tasks

#### TASK-REF-05: Extract EditorToolbar Component ✅ COMPLETED

- **Issue**: #21
- **Assignee**: Completed
- **Priority**: High
- **Estimated**: 2-3 hours
- **Dependencies**: None
- **Status**: ✅ COMPLETED
- **Acceptance**:
  - [x] Separate EditorToolbar component
  - [x] Props interface defined
  - [x] Existing functionality preserved
  - [x] Component integrated into Editor

#### CI/CD Infrastructure Fixes ✅ COMPLETED

- **Issue**: #190 (CODE-REVIEW-002)
- **Assignee**: DevOps Engineer
- **Priority**: Critical
- **Estimated**: 2-3 hours
- **Dependencies**: None
- **Status**: ✅ COMPLETED (2026-02-10)
- **Acceptance**:
  - [x] Renamed workflow file: 'on pull.yml' → 'on-pull.yml'
  - [x] Updated action versions: v4 → v5 for security
  - [x] Removed continue-on-error: true from critical steps
  - [x] Added fail-fast error handling
  - [x] CI/CD workflow now production-ready

---

## Completed Tasks Log

### 2026-02-08 - Agent Work Session (ULTRAWORK MODE)

**[CONNECT] Live Generation Progress Indicator**

- Added real-time progress indicator to StepReview component
- Shows live status updates during blueprint generation (e.g., "Generating blueprint...", "Blueprint complete. Generating tasks...")
- Animated progress message with pulsing indicator for better UX
- Users now have visibility into generation stages instead of static spinner
- PR: #148

**[CONSOLIDATE] Centralized Generation Time Estimate**

- Moved hardcoded "30-60 seconds" text from StepReview to constants
- Added `GENERATION_ESTIMATES` constant object with typical duration values
- Improves maintainability and allows easy adjustment of time estimates

**[CONSOLIDATE] Extracted Shared API Retry Wrapper**

- Identified ~150 lines of duplicated retry logic across `generateBlueprint`, `generateTasks`, and `refineContent`
- Created shared `apiCallWithRetry` wrapper function in `apps/web/src/lib/api.ts`
- All three API functions now use the consolidated wrapper
- Reduced code duplication and improved maintainability
- All 8 API tests pass with consolidated implementation

### 2026-02-07 - Agent Work Session (ULTRAWORK MODE)

**[CONNECT] Form Progress UX Enhancement**

- Added animated form completion progress indicator to StepInfo.tsx
- Shows real-time completion percentage with gradient progress bar
- Updates dynamically as user fills required and optional fields
- Improves user awareness of form completion status

**[CONSOLIDATE] Centralized Category Icons**

- Moved CATEGORY_ICONS from StepStack.tsx to constants.ts
- Added MIN_REQUIREMENTS constant for validation thresholds
- Updated StepStack to import from centralized config
- Reduces duplication and improves maintainability

**[CONSOLIDATE] Test Utilities Consolidation**

- Created apps/api/src/test-utils.ts with shared mock configurations
- Extracted MOCK_ENV and MOCK_ENV_NO_KEY to shared location
- Updated all test files to use centralized test utilities
- Reduces test file duplication and improves consistency

**[STRENGTHEN] Enhanced Type Safety**

- Fixed all `any` types in controller layer
- Added proper Hono Context types with Env bindings
- Updated BaseController, GenerateController, RefineController, TasksController

**[CONSOLIDATE] Centralized Configuration**

- Created `apps/web/src/config/constants.ts`
- Migrated hardcoded form limits, timeouts, animation durations
- Updated StepInfo, StepIndicator, Editor components to use constants

**[CONNECT] Improved UX Flow**

- Added keyboard shortcuts (Ctrl/Cmd+E toggle editor, Escape cancel generation)
- Enhanced StepIndicator with proper accessibility labels
- Added missing tech stack category icons (ai, testing, other)

**[CONNECT] Expanded Test Coverage**

- Added tests for tasks route (2 tests)
- Added tests for refine route (2 tests)
- Total API test coverage: 8 tests across 3 files

**[REMOVE] Cleaned Console Errors**

- Replaced production console.error with proper error handling
- Added context-aware error logging for Cloudflare Workers
- Updated errorHandler middleware with explanatory comments

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

## M2: Refinement & Persistence (ACTIVE)

### M2 Execution Task

#### TASK-M2-EXECUTION: Execute M2 Refinement & Persistence Phase

- **Issue**: #222
- **Assignee**: Frontend Engineer
- **Priority**: Critical
- **Status**: Active
- **Estimated**: 3-5 days
- **Dependencies**: M1 complete ✅
- **Acceptance**:
  - [ ] All M2 tasks completed
  - [ ] End-to-end editing workflow functional
  - [ ] Storage persistence working reliably
  - [ ] Export/import functionality validated

### Implementation Tasks

#### TASK-009: LocalStorage Implementation

- **Issue**: #105
- **Assignee**: Frontend Engineer
- **Priority**: High
- **Estimated**: 6-8 hours
- **Dependencies**: M1 complete
- **Acceptance**:
  - Blueprint auto-save to localStorage
  - Load saved blueprints
  - Storage quota management
  - Migration strategy for schema changes

#### TASK-103: Manual Editing in Split-Pane View

- **Issue**: #99
- **Assignee**: Frontend Engineer
- **Priority**: High
- **Estimated**: 4-6 hours
- **Dependencies**: TASK-007, TASK-009
- **Acceptance**:
  - Code editor allows editing
  - Changes sync with markdown preview
  - Edit state preserved during session
  - Save/restore via localStorage

#### TASK-104: Blueprint Refinement Workflow

- **Issue**: #100
- **Assignee**: Frontend Engineer
- **Priority**: High
- **Estimated**: 6-8 hours
- **Dependencies**: TASK-103
- **Acceptance**:
  - Select specific sections for regeneration
  - Maintain context during refinement
  - Stream regeneration for selected sections
  - Preserve manual edits during refinement

#### TASK-105: Export/Import Functionality

- **Issue**: #101
- **Assignee**: Frontend Engineer
- **Priority**: Medium
- **Estimated**: 4-5 hours
- **Dependencies**: TASK-009
- **Acceptance**:
  - Export blueprint as JSON file
  - Import blueprint from JSON file
  - Validate imported blueprints
  - Handle schema version migration

#### M2 Quality & Security Tasks

##### SEC-M2-001: Input Sanitization Implementation

- **Issue**: #228
- **Assignee**: API Specialist
- **Priority**: High
- **Estimated**: 6-8 hours
- **Dependencies**: All M2 implementation tasks
- **Acceptance**:
  - All user inputs sanitized before storage
  - XSS protection implemented across all entry points
  - Security tests added to CI pipeline

##### PERF-M2-001: LocalStorage Performance Optimization

- **Issue**: #229
- **Assignee**: Performance Engineer
- **Priority**: High
- **Estimated**: 8-10 hours
- **Dependencies**: TASK-009, TASK-103
- **Acceptance**:
  - Load time < 500ms for blueprints up to 1MB
  - Smooth editing experience without lag
  - Performance benchmarks implemented

##### TEST-M2-001: Comprehensive Test Suite

- **Issue**: #230
- **Assignee**: Quality Assurance
- **Priority**: High
- **Estimated**: 12-16 hours
- **Dependencies**: All M2 implementation tasks
- **Acceptance**:
  - Minimum 90% code coverage for M2 features
  - All critical user flows tested
  - CI pipeline passes all test suites

#### Additional M2 Tasks

- Schema versioning for backwards compatibility
- Performance optimization for large blueprints

---

## M3: Distribution & Collaboration (PLANNED)

### Planned Tasks

#### TASK-010: ZIP Download Feature

- **Issue**: #106
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

- **Issue**: #80
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
