# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- AI Agent System with 27+ specialized roles
- OpenCode integration for automated development workflows
- Comprehensive documentation structure
- `getTemplatesByCreator` method to DatabaseService for "My Templates" feature support
- ErrorBoundary component for graceful error handling in React frontend
- Comprehensive database service test coverage (49 tests)
- Warning log when rate limiter is not configured for improved observability
- `countPublicTemplatesByCategory` method to DatabaseService for template analytics

### Changed

- Enhanced API documentation with JSDoc comments for secureLog utility functions ([#629](https://github.com/cpa03/blueprintify/pull/629))
- Standardized CMZ agent definition with mandatory planning section
- Fixed default value handling in MockDatabaseService (version, usage_count)
- Improved request logger middleware to handle undefined header values
- Replaced generic `Error` throws with typed `NotFoundError` in MockDatabaseService for better error discrimination
- JSDoc documentation added to Wizard.tsx and Header.tsx components ([#816](https://github.com/cpa03/blueprintify/pull/816))
- Improved StepIndicator accessibility for mobile screen readers ([#818](https://github.com/cpa03/blueprintify/pull/818))

### Security

- Fixed auth bypass vulnerability when API_KEY is not configured - requests are now rejected with 503 instead of bypassing authentication ([#945](https://github.com/cpa03/blueprintify/issues/945), [#976](https://github.com/cpa03/blueprintify/pull/976))
- Comprehensive reliability audit verified all patterns implemented correctly (Error Boundaries, JSON Safety, Timeout Handling, Circuit Breaker, Rate Limiting, Input Validation, Storage Recovery, XSS Protection, Error Classes, Retry Logic)
- Added `.dev.vars` to `.gitignore` to prevent credential commits ([#819](https://github.com/cpa03/blueprintify/pull/819))

### Fixed

- Recursive trigger bug in schema.sql that caused infinite loops
- `deserializeJSON` safety with proper error handling
- Share endpoint validation consistency using SHARE_CONFIG.ID_LENGTH constant
- Updated bugs.md - marked BUG-009 resolved, added BUG-010 for issue #743 ([#815](https://github.com/cpa03/blueprintify/pull/815))

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
  - `/share` - Create shareable blueprint link (POST)
  - `/share/:id` - Retrieve shared blueprint (GET)
  - `/share/:id` - Delete shared blueprint (DELETE)

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
