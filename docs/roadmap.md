# Strategic Roadmap

**Status**: Active
**Last Updated**: 2026-01-08

## Vision

To provide a friction-less "Day 1" experience for autonomous software development, acting as the intelligent bridge between idea and execution.

## Current Milestone: M4 - Production & Quality

**Goal**: Prepare for production deployment with comprehensive testing, documentation, and code quality improvements.

### M4 Objectives

- [ ] Comprehensive Test Coverage (Vitest)
- [ ] API Documentation & OpenAPI Spec
- [ ] Performance Optimization & Monitoring
- [ ] Security Audit & Hardening
- [ ] User Documentation & Tutorials
- [ ] CI/CD Pipeline Enhancement

### M4 Tasks

**Quality Assurance**

- [ ] Unit tests for all core components
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Performance benchmarking
- [ ] Accessibility audit (WCAG 2.1 AA)

**Documentation**

- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide and tutorials
- [ ] Developer documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide

**Code Quality**

- [ ] Code review for all open issues
- [ ] Refactor identified technical debt (Issues #21, #22, #23)
- [ ] Type safety audit
- [ ] Bundle size optimization
- [ ] Error handling standardization

**Security**

- [ ] Security audit
- [ ] Rate limiting implementation
- [ ] Input sanitization review
- [ ] CORS policy review
- [ ] Environment variable validation

## Upcoming Milestones

### M5 - Advanced Features (Future)

**Goal**: Enhance with advanced AI capabilities and integrations.

- [ ] Multiple AI Provider Support (Claude, Gemini, Local)
- [ ] Project History & Version Control
- [ ] Collaborative Editing
- [ ] AI-Powered Code Suggestions
- [ ] Template Marketplace

## Completed Milestones

### ✅ M3 - Polish & Export (COMPLETE)

**Goal**: Actionable "Eject" to local file system.

**Completed**:

- [x] Zip Download (JSZip integration)
- [x] Template Library (TemplateGrid component)
- [x] "Smart Copy" formatting (clipboard utilities)
- [x] Download .docs folder functionality
- [x] Project README generation

### ✅ M2 - Refinement & Persistence (COMPLETE)

**Goal**: Allow users to tweak the result and save their progress.

**Completed**:

- [x] Split-Pane Editor (Wizard + Editor layout)
- [x] LocalStorage Persistence (auto-save/restore)
- [x] "Refine Selection" AI command (/refine endpoint)
- [x] Editor with syntax highlighting
- [x] View mode toggle (Preview/Edit)

### ✅ M1 - Foundation & Core Loop (COMPLETE)

**Goal**: Complete "Zero-to-One" flow: Input -> Generate -> View.

**Completed**:

- [x] Monorepo Structure (apps/, packages/)
- [x] Blueprint Definition (blueprint.md)
- [x] Shared Schemas (Zod validation)
- [x] API Streaming Endpoint (SSE implementation)
- [x] Basic Wizard UI (5-step wizard)
  - [x] Step 1: Project Details (Info)
  - [x] Step 2: Tech Stack Selection (Stack)
  - [x] Step 3: Features (Features)
  - [x] Step 4: Review (Review)
  - [x] Step 5: Generation (Generating)
- [x] Real-time Markdown Rendering (Editor component)
- [x] Template Grid for quick start

### ✅ M0 - Inception (COMPLETE)

**Completed**:

- [x] Initial Planning & Architecture Design
- [x] Technology Stack Selection
- [x] Monorepo Setup
- [x] CI/CD Configuration
