# Feature Specifications

**Status**: Active
**Last Updated**: 2026-01-07

## [FEAT-01] Project Initialization Wizard

**Status**: In Progress
**Priority**: P0 (Critical)
**Progress**: 33% (Step 1 complete, Steps 2-3 in progress)

### User Story

As a user starting a new project, I want to input my project name, description, and select my tech stack via a wizard, so that the system understands my architectural constraints.

### Acceptance Criteria

- [ ] Multi-step form (Project Details -> Tech Stack -> Review).
- [ ] Inputs validated via Zod schema.
- [ ] State preserved between steps.

### Technical Notes

- Use `zustand` for wizard state.
- Validate against `packages/shared/src/schemas.ts`.

### Tasks

- TASK-005, TASK-006

---

## [FEAT-02] Blueprint Generation & Streaming

**Status**: Complete
**Priority**: P0 (Critical)
**Progress**: 100% (API streaming, SSE implementation complete)

### User Story

As a user, I want to click "Generate" and see a real-time stream of the `blueprint.md` content, so that I don't have to wait for the full generation.

### Acceptance Criteria

- [ ] Connects to OpenAI/LLM provider.
- [ ] Streams tokens via SSE (Server-Sent Events).
- [ ] Renders Markdown in real-time.
- [ ] Generates `blueprint.md` and `task.md`.

### Technical Notes

- Backend: Hono Streaming.
- Frontend: `EventSource` or `fetch` with readable stream.

### Tasks

- TASK-003, TASK-004, TASK-008

---

## [FEAT-03] Live Split-Pane Editor

**Status**: In Progress
**Priority**: P1 (High)
**Progress**: 0% (Issue #31 assigned and in progress)

### User Story

As a user, I want to manually edit the generated result in a code editor side-by-side with the chat, so that I can refine the output.

### Acceptance Criteria

- [ ] Split-pane layout (resizable).
- [ ] Monaco Editor or CodeMirror instance on the right.
- [ ] "Regenerate Selection" capability (Future).

### Tasks

- TASK-007

---

## [FEAT-04] Export & Download

**Status**: Draft
**Priority**: P2 (Medium)

### User Story

As a user, I want to download a `.zip` file of the artifacts, so that I can start coding immediately.

### Acceptance Criteria

- [ ] "Download Zip" button.
- [ ] Client-side zip generation (JSZip).
- [ ] Includes `blueprint.md`, `task.md`, and folder structure.

### Tasks

- TASK-009

---

## Completed Features

### [FEAT-02] Blueprint Generation & Streaming ✅ COMPLETED

**Completion Date**: 2026-02-05  
**Issues Resolved**: #32 (API Streaming Integration)

**Delivered Functionality**:

- ✅ Connects to OpenAI/LLM provider
- ✅ Streams tokens via SSE (Server-Sent Events)
- ✅ Backend Hono streaming implementation
- ✅ Frontend EventSource integration
- ✅ Real-time token streaming during generation
- ✅ Error handling for connection issues
- ✅ Generates blueprint.md and task.md

**Technical Implementation**:

- Backend: Hono Streaming with proper error handling
- Frontend: EventSource API with reconnection logic
- Type-safe streaming interfaces via Zod schemas
- Comprehensive test coverage (2 test cases added)

---

## Recent Enhancements (2026-02-06)

### Type Safety & Code Quality ✅ COMPLETED

**Issues Resolved**: #80 (TS-001)

**Improvements**:

- ✅ Fixed all `any` types in controller layer
- ✅ Added proper Hono Context types with Env bindings
- ✅ Updated BaseController, GenerateController, RefineController, TasksController

### Configuration Management ✅ COMPLETED

**Enhancements**:

- ✅ Created `apps/web/src/config/constants.ts`
- ✅ Migrated hardcoded form limits, timeouts, animation durations
- ✅ Updated StepInfo, StepIndicator, Editor components to use constants

### User Experience Improvements ✅ COMPLETED

**Enhancements**:

- ✅ Added keyboard shortcuts (Ctrl/Cmd+E toggle editor, Escape cancel generation)
- ✅ Enhanced StepIndicator with proper accessibility labels
- ✅ Added missing tech stack category icons (ai, testing, other)

### Testing & Error Handling ✅ COMPLETED

**Improvements**:

- ✅ Added tests for tasks route (2 tests)
- ✅ Added tests for refine route (2 tests)
- ✅ Total API test coverage: 8 tests across 3 files
- ✅ Replaced production console.error with proper error handling
- ✅ Added context-aware error logging for Cloudflare Workers
