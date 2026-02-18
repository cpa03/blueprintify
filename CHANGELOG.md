# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- AI Agent System with 25+ specialized roles
- OpenCode integration for automated development workflows
- Comprehensive documentation structure

### Changed

- Improved error handling with structured error responses and requestId tracking
- Enhanced API documentation with comprehensive examples and error scenarios

### Fixed

- Resolved recursive trigger bug in database schema (timestamp update triggers)
- Added safety wrapper for JSON parsing in deserializeJSON utility

## [1.0.0] - 2026-02-18

### Added

- **Core Features**
  - Wizard interface for step-by-step project configuration
  - Template library with pre-configured templates
  - Real-time streaming via Server-Sent Events (SSE)
  - Split-pane editor with CodeMirror and live markdown preview
  - One-click export as ZIP, JSON, or Markdown
  - Auto-save with localStorage persistence
  - Dark mode with glassmorphism effects

- **M2 Architecture Enhancements**
  - Split-Pane Editor: CodeMirror integration with live markdown preview
  - LocalStorage Persistence: 5MB storage with intelligent quota management
  - Refinement Engine: Section-based AI content refinement
  - Export/Import System: Multi-format data portability
  - Security Layer: DOMPurify-based XSS protection and input validation

- **Backend Extensions**
  - `/generate` - Generate blueprint (SSE stream)
  - `/tasks` - Generate tasks from blueprint (SSE stream)
  - `/refine` - Refine content section (SSE stream)
  - `/export` - Export project as ZIP/JSON/Markdown
  - `/import` - Import project with validation
  - `/storage/quota` - Check localStorage usage
  - `/storage/clear` - Clear stored data
  - `/share` - Create shareable blueprint link

- **Tech Stack**
  - Backend: Hono, Cloudflare Workers, Zod, OpenAI SDK, Vitest
  - Frontend: React 18, Vite, Tailwind CSS, Zustand, CodeMirror, Framer Motion
  - Development: TypeScript, ESLint, Concurrently, Wrangler

### Documentation

- User Guide for blueprint generation workflow
- API Documentation with comprehensive reference
- Development Workflow guide
- Code Style Guidelines
- Testing Procedures
- AI Agent Usage Guide
- M2 Technical Approach documentation

[Unreleased]: https://github.com/cpa03/blueprintify/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/cpa03/blueprintify/releases/tag/v1.0.0
