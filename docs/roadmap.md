# Strategic Roadmap

> Defines project phases, milestones, and strategic deliverables.

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Active

---

## Overview

Blueprintify follows a three-phase roadmap focused on delivering a complete blueprint generation experience.

---

## Phase M1: Foundation & Core Loop

**Status**: 🟡 In Progress (60% Complete)
**Estimated Completion**: 2-3 days

### Objectives

- Complete the monorepo structure
- Implement the core "Input → Generate → View" user flow
- Establish API streaming capability
- Deliver minimal viable product (MVP)

### Deliverables

#### ✅ Complete

1. Monorepo Structure (apps/api, apps/web, packages/shared)
2. Blueprint Definition (`docs/blueprint.md`)
3. Shared Schemas (Zod validation schemas)
4. API Streaming Endpoint (SSE implementation)
5. Basic Wizard UI (Step 1: Project Description Input)

#### ⚠️ In Progress

6. **Tech Stack Selection Form** (Wizard Step 2)
   - Form component with validation
   - Tech stack options from shared schemas
   - State management for selection

7. **Review & Generate Form** (Wizard Step 3)
   - Summary display of inputs
   - Generate button with loading state
   - Error handling and feedback

8. **Markdown Rendering Component**
   - Real-time markdown rendering
   - Syntax highlighting for code blocks
   - Scroll sync between editor and preview

9. **API Streaming Integration**
   - Connect frontend to API SSE endpoint
   - Handle streaming data chunks
   - Display generation progress

#### ❌ Not Started

10. **Split-Pane Editor View**
    - Left pane: Generated content
    - Right pane: Live preview
    - Editable mode with live updates

### Success Criteria

- [ ] User can complete full wizard flow (3 steps)
- [ ] API successfully streams generated content
- [ ] User can view generated markdown with syntax highlighting
- [ ] Generation completes with no errors
- [ ] Total flow time < 30 seconds

---

## Phase M2: Refinement & Persistence

**Status**: ⚪ Not Started
**Estimated Start**: After M1 completion
**Estimated Duration**: 1-2 weeks

### Objectives

- Add user account and project persistence
- Implement refinement workflow
- Enhance generation quality

### Deliverables

1. **User Authentication**
   - OAuth integration (GitHub preferred)
   - User session management
   - Protected routes

2. **Project Persistence**
   - Database schema (D1 or similar)
   - CRUD operations for projects
   - Auto-save during generation

3. **Refinement Workflow**
   - Edit generated content
   - Re-generate specific sections
   - Prompt-based refinement

4. **History & Versions**
   - Track project versions
   - Compare changes
   - Restore previous versions

5. **Export Functionality**
   - Export to markdown
   - Export to PDF
   - Copy to clipboard

### Success Criteria

- [ ] Users can create accounts and log in
- [ ] Projects are saved and persist across sessions
- [ ] Users can edit and regenerate sections
- [ ] Export functionality works for all formats
- [ ] Version history is trackable

---

## Phase M3: Polish & Scale

**Status**: ⚪ Not Started
**Estimated Start**: After M2 completion
**Estimated Duration**: 2-3 weeks

### Objectives

- Optimize performance
- Enhance UX with advanced features
- Scale infrastructure

### Deliverables

1. **Performance Optimization**
   - Bundle size optimization
   - Code splitting
   - Image optimization
   - Caching strategies

2. **Advanced Features**
   - Template library
   - Custom tech stack definitions
   - Collaborative editing (real-time)
   - Dark mode

3. **Analytics & Monitoring**
   - Usage analytics
   - Error tracking (Sentry)
   - Performance monitoring

4. **Infrastructure Scaling**
   - Rate limiting
   - CDN optimization
   - Database scaling

5. **Documentation & Launch**
   - User documentation
   - API documentation
   - Public launch

### Success Criteria

- [ ] Time to interactive < 2 seconds
- [ ] Bundle size < 500KB (gzipped)
- [ ] 99.9% uptime achieved
- [ ] Full documentation published
- [ ] Public launch completed

---

## Timeline Summary

```
M1: Foundation & Core Loop     ████████░░░░░░░░  60%
M2: Refinement & Persistence   ░░░░░░░░░░░░░░░░   0%
M3: Polish & Scale             ░░░░░░░░░░░░░░░░   0%
```

---

## Risk Factors

| Risk                   | Impact | Mitigation                                 |
| ---------------------- | ------ | ------------------------------------------ |
| API rate limits        | High   | Implement caching, streaming with backoff  |
| Browser compatibility  | Medium | Progressive enhancement, polyfills         |
| Database scaling       | Medium | Use managed service, monitor usage         |
| Code complexity growth | High   | Refactor regularly, maintain documentation |

---

## Version History

| Version | Date       | Changes                    |
| ------- | ---------- | -------------------------- |
| 1.0.0   | 2026-01-08 | Initial roadmap definition |

---

**End of Roadmap**
