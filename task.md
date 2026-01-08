# Task Tracking: Blueprint Generator

**Status Legend**:

- [ ] Todo
- [/] In Progress
- [x] Done

---

## ✅ Phase 1: Foundation & Infrastructure (M1 - COMPLETE)

- [x] **System Setup**
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

- [x] **Core API Implementation (FEAT-02)**
  - [x] **TASK-003**: Implement `POST /generate` endpoint <!-- id: 3 -->
  - [x] **TASK-004**: Integrate OpenAI/AI Client Services <!-- id: 4 -->
  - [x] **TASK-INT-01**: Implement OpenAI Retry Mechanism (Backoff)
  - [x] **TASK-100**: Implement SSE Streaming logic <!-- id: 5 -->
  - [x] **TASK-OPT-01**: Lazy Load Editor Component (Reduce Initial Bundle)

- [x] **Code Quality & Refactoring**
  - [x] **TASK-REF-01**: [REFACTOR] Split Global Store (`store.ts` -> `store/wizard.ts`, `store/editor.ts`)
  - [x] **TASK-REF-02**: [REFACTOR] Extract Editor Header Component
  - [x] **TASK-REF-03**: [REFACTOR] Accessibility Improvements for Step 2 & 3 (`StepStack`, `StepFeatures`)
  - [x] **TASK-REF-04**: [REFACTOR] Rename `useGeneration.ts` to `useBlueprintStream.ts` to match Blueprint
  - [ ] **TASK-REF-05**: [REFACTOR] Extract `EditorToolbar` from `Editor.tsx` (Reduce complexity) <!-- Issue #21 -->
  - [ ] **TASK-REF-06**: [REFACTOR] Move API Route Logic to Controllers (Service Layer Pattern) <!-- Issue #22 -->
  - [x] **TASK-REF-07**: [REFACTOR] Externalize API Base URL Configuration in `apps/web` (`import.meta.env`)
  - [ ] **TASK-REF-08**: [REFACTOR] Standardize Error Response Handling in API (`apps/api`) <!-- Issue #23 -->

## ✅ Phase 2: Frontend Experience (M1/M2 - COMPLETE)

- [x] **Wizard UI (FEAT-01)**
  - [x] **TASK-005**: Implementation of Step 1: Project Details Form <!-- id: 6 -->
  - [x] **TASK-006**: Implementation of Step 2: Tech Stack Selection <!-- id: 7 -->
  - [x] **TASK-101**: Implementation of Step 3: Review & Generate <!-- id: 8 -->
  - [x] **TASK-FEAT-01**: Implementation of Step 4: Features (Additional details)
  - [x] **TASK-FEAT-02**: Implementation of Step 5: Generating (Progress state)

- [x] **Live Editor (FEAT-03)**
  - [x] **TASK-007**: Implement Split-Pane View with CodeMirror/Monaco <!-- id: 9 -->
  - [x] **TASK-008**: Markdown Rendering Component <!-- id: 10 -->

## ✅ Phase 3: Integration & Polish (M3 - COMPLETE)

- [x] **TASK-009**: "Download Zip" functionality (FEAT-04) <!-- id: 11 -->
- [x] **TASK-010**: Implement LocalStorage Persistence (FEAT-05) <!-- id: 12 -->
- [x] **TASK-011**: Connect Frontend to API Stream <!-- id: 13 -->
- [x] **TASK-INT-02**: Implement `/refine` endpoint for AI refinement
- [x] **TASK-UI-01**: Implement Template Grid for quick start
- [x] **TASK-UI-02**: Implement Editor Header with view mode toggle
- [x] **TASK-UI-03**: Implement Smart Copy & formatting utilities

---

## 🎯 Phase 4: Production & Quality (M4 - ACTIVE)

### Quality Assurance

- [ ] **TASK-QA-01**: Unit Tests for Core Components
  - [ ] Test Wizard state management
  - [ ] Test Editor components
  - [ ] Test API client utilities
  - [ ] Test export functionality

- [ ] **TASK-QA-02**: Integration Tests for API
  - [ ] Test `/generate` endpoint with streaming
  - [ ] Test `/refine` endpoint
  - [ ] Test `/tasks` endpoint
  - [ ] Test error handling

- [ ] **TASK-QA-03**: E2E Tests for Critical Flows
  - [ ] Test complete "Idea to Blueprint" flow
  - [ ] Test template selection and generation
  - [ ] Test editor and refinement flow
  - [ ] Test download/export flow

- [ ] **TASK-QA-04**: Performance Benchmarking
  - [ ] Measure bundle sizes
  - [ ] Measure time-to-first-byte (TTFB)
  - [ ] Measure generation latency
  - [ ] Optimize for performance

- [ ] **TASK-QA-05**: Accessibility Audit
  - [ ] WCAG 2.1 AA compliance check
  - [ ] Screen reader testing
  - [ ] Keyboard navigation testing
  - [ ] Color contrast validation

### Documentation

- [ ] **TASK-DOC-02**: API Documentation
  - [ ] OpenAPI/Swagger specification
  - [ ] Endpoint documentation
  - [ ] Request/response examples
  - [ ] Error codes reference

- [ ] **TASK-DOC-03**: User Documentation
  - [ ] Getting started guide
  - [ ] Feature tutorials
  - [ ] Troubleshooting guide
  - [ ] FAQ section

- [ ] **TASK-DOC-04**: Developer Documentation
  - [ ] Architecture overview
  - [ ] Component documentation
  - [ ] API development guide
  - [ ] Contributing guidelines

- [ ] **TASK-DOC-05**: Deployment Documentation
  - [ ] Cloudflare Workers deployment
  - [ ] Environment configuration
  - [ ] CI/CD pipeline documentation
  - [ ] Production setup checklist

### Code Quality

- [ ] **TASK-CODE-01**: Complete Refactoring
  - [ ] Address Issue #21: Extract EditorToolbar
  - [ ] Address Issue #22: Move API logic to controllers
  - [ ] Address Issue #23: Standardize error handling
  - [ ] Review and close all open refactoring issues

- [ ] **TASK-CODE-02**: Type Safety Audit
  - [ ] Review all `any` types
  - [ ] Add missing type definitions
  - [ ] Ensure strict TypeScript compliance
  - [ ] Fix any type errors

- [ ] **TASK-CODE-03**: Bundle Optimization
  - [ ] Analyze bundle composition
  - [ ] Implement code splitting
  - [ ] Optimize dependencies
  - [ ] Remove unused code

- [ ] **TASK-CODE-04**: Error Handling Review
  - [ ] Standardize error responses
  - [ ] Improve error messages
  - [ ] Add error boundaries in React
  - [ ] Implement retry logic for client

### Security

- [ ] **TASK-SEC-02**: Security Audit
  - [ ] Dependency vulnerability scan
  - [ ] Code security review
  - [ ] Input sanitization audit
  - [ ] Output encoding verification

- [ ] **TASK-SEC-03**: Rate Limiting
  - [ ] Implement API rate limiting
  - [ ] Configure Cloudflare rate limits
  - [ ] Add abuse detection
  - [ ] Document rate limit policy

- [ ] **TASK-SEC-04**: Input Validation
  - [ ] Review Zod schemas
  - [ ] Add validation for all inputs
  - [ ] Sanitize user content
  - [ ] Test injection attacks

- [ ] **TASK-SEC-05**: CORS & Security Headers
  - [ ] Review CORS policy
  - [ ] Optimize security headers
  - [ ] Add CSP headers
  - [ ] Test security headers

- [ ] **TASK-SEC-06**: Environment Variables
  - [ ] Document required environment variables
  - [ ] Validate environment variables at startup
  - [ ] Add default values where safe
  - [ ] Test environment variable handling

---

## 📋 Phase 5: Advanced Features (M5 - FUTURE)

### Multi-Provider AI Support

- [ ] **TASK-AI-01**: Claude Integration
  - [ ] Add Anthropic API client
  - [ ] Implement provider selection UI
  - [ ] Test Claude generation quality
  - [ ] Update documentation

- [ ] **TASK-AI-02**: Gemini Integration
  - [ ] Add Google AI client
  - [ ] Implement provider selection UI
  - [ ] Test Gemini generation quality
  - [ ] Update documentation

- [ ] **TASK-AI-03**: Local LLM Support
  - [ ] Support local Ollama instances
  - [ ] Implement provider selection
  - [ ] Test local generation
  - [ ] Add performance monitoring

### Collaboration Features

- [ ] **TASK-COLLAB-01**: Project History
  - [ ] Implement version control for projects
  - [ ] Add project list view
  - [ ] Implement project restore
  - [ ] Add project deletion

- [ ] **TASK-COLLAB-02**: Sharing & Export
  - [ ] Add share functionality
  - [ ] Implement public project links
  - [ ] Add export to GitHub
  - [ ] Add import from GitHub

### Advanced Editing

- [ ] **TASK-EDIT-01**: AI Code Suggestions
  - [ ] Implement code suggestion API
  - [ ] Add suggestion UI
  - [ ] Test suggestion quality
  - [ ] Add feedback mechanism

- [ ] **TASK-EDIT-02**: Collaborative Editing
  - [ ] Add real-time collaboration
  - [ ] Implement conflict resolution
  - [ ] Add presence indicators
  - [ ] Test multi-user scenarios

### Template Marketplace

- [ ] **TASK-TMPL-01**: Template Management
  - [ ] Add template CRUD operations
  - [ ] Implement template rating
  - [ ] Add template search
  - [ ] Implement template categories

- [ ] **TASK-TMPL-02**: Community Templates
  - [ ] Add community template submission
  - [ ] Implement template moderation
  - [ ] Add template sharing
  - [ ] Create template guidelines
