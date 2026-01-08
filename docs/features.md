# Feature Specifications

**Status**: Active
**Last Updated**: 2026-01-08

## [FEAT-01] Project Initialization Wizard

**Status**: In Progress (Step 1 Complete)
**Priority**: P0 (Critical)

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

- TASK-005 (✅ Complete), TASK-006 (Issue #16), TASK-101 (Issue #17)

---

## [FEAT-02] Blueprint Generation & Streaming

**Status**: Backend Complete, Frontend Pending
**Priority**: P0 (Critical)

### User Story

As a user, I want to click "Generate" and see a real-time stream of the `blueprint.md` content, so that I don't have to wait for the full generation.

### Acceptance Criteria

- [x] Connects to OpenAI/LLM provider.
- [x] Streams tokens via SSE (Server-Sent Events).
- [ ] Renders Markdown in real-time.
- [ ] Generates `blueprint.md` and `task.md`.

### Technical Notes

- Backend: Hono Streaming.
- Frontend: `EventSource` or `fetch` with readable stream.

### Tasks

- TASK-003, TASK-004, TASK-100 (✅ Complete), TASK-008 (Issue #18), TASK-011 (Issue #19)

---

## [FEAT-03] Live Split-Pane Editor

**Status**: Draft
**Priority**: P1 (High)

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
