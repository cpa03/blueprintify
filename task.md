# Task Tracking: Blueprint Generator

**Status Legend**:

- [ ] Todo
- [/] In Progress
- [x] Done

## Phase 1: Foundation & Infrastructure (M1)

- [ ] **System Setup**

  - [x] Create Monorepo Structure (`apps/`, `packages/`)
  - [x] Create `blueprint.md` (System Architecture)
  - [x] **TASK-DOC-01**: Update Documentation for QA & CI
  - [x] **TASK-INFRA-01**: Implement Autonomous GitHub Actions CI/CD Workflow
    - [x] Create `.github/workflows/ai-on-push.yml` with Think/Plan/Execute stages
    - [x] Implement Concurrency Locking
    - [x] Configure Agent Specialists
  - [x] **TASK-InFRA-02**: Configure Agent Prompts
    - [x] Create `.agent/prompts/` directory
    - [x] Create prompt files for all 12 specialists
  - [x] **TASK-INFRA-03**: Configure OpenCode CLI (opencode-ai)
    - [x] Update `ai-on-push.yml` with correct package name
    - [x] Fix CLI command syntax
  - [x] **TASK-SEC-01**: Implement API Security Headers (Hono `secureHeaders`)
  - [x] **TASK-001**: Configure Shared Zod Schemas in `packages/shared` <!-- id: 1 -->
  - [x] **TASK-002**: Setup Hono API basic routing in `apps/api` <!-- id: 2 -->
  - [x] **TASK-000**: Setup React+Vite entry point in `apps/web` <!-- id: 0 -->

- [ ] **Core API Implementation (FEAT-02)**

  - [x] **TASK-003**: Implement `POST /generate` endpoint <!-- id: 3 -->
  - [x] **TASK-004**: Integrate OpenAI/AI Client Services <!-- id: 4 -->
  - [x] **TASK-INT-01**: Implement OpenAI Retry Mechanism (Backoff)
  - [x] **TASK-100**: Implement SSE Streaming logic <!-- id: 5 -->
  - [x] **TASK-OPT-01**: Lazy Load Editor Component (Reduce Initial Bundle)

- [ ] **Code Quality & Refactoring**
  - [x] **TASK-REF-01**: [REFACTOR] Split Global Store (`store.ts` -> `store/wizard.ts`, `store/editor.ts`)
  - [x] **TASK-REF-02**: [REFACTOR] Extract Editor Header Component
  - [x] **TASK-REF-03**: [REFACTOR] Accessibility Improvements for Step 2 & 3 (`StepStack`, `StepFeatures`)
  - [x] **TASK-REF-04**: [REFACTOR] Rename `useGeneration.ts` to `useBlueprintStream.ts` to match Blueprint
  - [ ] **TASK-REF-05**: [REFACTOR] Extract `EditorToolbar` from `Editor.tsx` (Reduce complexity)
  - [ ] **TASK-REF-06**: [REFACTOR] Move API Route Logic to Controllers (Service Layer Pattern)
  - [x] **TASK-REF-07**: [REFACTOR] Externalize API Base URL Configuration in `apps/web` (`import.meta.env`)
  - [ ] **TASK-REF-08**: [REFACTOR] Standardize Error Response Handling in API (`apps/api`)

## Phase 2: Frontend Experience (M1/M2)

- [ ] **Wizard UI (FEAT-01)**

  - [x] **TASK-005**: Implementation of Step 1: Project Details Form <!-- id: 6 -->
  - [ ] **TASK-006**: Implementation of Step 2: Tech Stack Selection <!-- id: 7 -->
  - [ ] **TASK-101**: Implementation of Step 3: Review & Generate <!-- id: 8 -->

- [ ] **Live Editor (FEAT-03)**
  - [ ] **TASK-007**: Implement Split-Pane View with CodeMirror/Monaco <!-- id: 9 -->
  - [ ] **TASK-008**: Markdown Rendering Component <!-- id: 10 -->

## Phase 3: Integration & Polish (M3)

- [ ] **TASK-009**: "Download Zip" functionality (FEAT-04) <!-- id: 11 -->
- [ ] **TASK-010**: Implement LocalStorage Persistence (FEAT-05) <!-- id: 12 -->
- [ ] **TASK-011**: Connect Frontend to API Stream <!-- id: 13 -->
