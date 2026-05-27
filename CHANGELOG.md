# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Animate-glow CSS class for primary CTA button breathing effect (pulsing box-shadow animation, respects prefers-reduced-motion)
- Shimmer completion animation on StepInfo progress bar for progress celebration feedback
- Character counter for constraints textarea in StepInfo for real-time input awareness
- 'View in Editor' primary CTA button after generation completes for immediate navigation to split-pane editor
- Issue management report (`docs/issue-management-2026-05-27.md`) and CI Node.js version fix script
- `secureLogInfo` and `secureLogDebug` utility functions for structured debug logging
- `llms.txt` file for LLM crawl guidance and Lighthouse agentic-browsing audit
- Spring animations on editor panel close buttons for visual delight
- Documentation for missing keyboard shortcuts (Ctrl+N, Home) in shortcuts modal
- Spring wobble animation on ConfirmDialog warning icon for visual emphasis ([#1387](https://github.com/cpa03/blueprintify/pull/1387))
- Auto-scroll preview pane to top on tab switch for consistent viewing ([#1387](https://github.com/cpa03/blueprintify/pull/1387))
- Comprehensive SSE stream utility tests for API request validation and stream reliability
- Enhanced ShowEditorButton with spring pop-in entrance animation for visual delight
- Spring hover/tap animations on StepFeatures suggestion buttons for tactile interaction feedback
- Animated SVG icon replacing emoji on New Project button for consistent visual identity ([#1330](https://github.com/cpa03/blueprintify/pull/1330))
- Comprehensive body limit middleware tests for API request validation
- Focus first invalid field on StepInfo form submit for better UX
- Scroll-triggered shadow on header for depth feedback ([#1314](https://github.com/cpa03/blueprintify/pull/1314))
- AI Agent System with 27+ specialized roles
- OpenCode integration for automated development workflows
- Comprehensive documentation structure
- `getTemplatesByCreator` method to DatabaseService for "My Templates" feature support
- ErrorBoundary component for graceful error handling in React frontend
- Comprehensive database service test coverage (49 tests)
- Warning log when rate limiter is not configured for improved observability
- `countPublicTemplatesByCategory` method to DatabaseService for template analytics
- Success animation on export button for visual completion feedback
- Spring dismiss animation on toast notification button
- Smooth cross-fade transition between editor empty and content states ([#1297](https://github.com/cpa03/blueprintify/pull/1297))
- Confirmation dialog before New Project to prevent accidental data loss

### Changed

- Eliminated hardcoded API URLs across codebase with shared defaults in `@blueprint/shared` package for single-source-of-truth configuration
- Eliminated hardcoded HTTP header strings (Content-Type, Connection) into `API_HEADERS` config constants across API utilities and DI container
- Consolidated 8x `new Date().toISOString()` calls into centralized `timestamp()` utility from errors.ts in secureLog, logger, and index
- Extracted hardcoded aria-labels from Header, MarkdownRenderer, and Toast components into `ACCESSIBILITY_LABELS` config constant
- Aligned `.nvmrc` and `package.json` engines with Cloudflare Node 22 requirement (`.node-version` 20→22)
- Replaced hardcoded config values with config constants across API and web apps ([#1316](https://github.com/cpa03/blueprintify/pull/1316))
- Removed `engine-strict=true` from `.npmrc` to allow `npm install` on node 20 without `--force` (project targets node 20 but some deps require >=22)
- Updated `prepare` script from `husky install` (deprecated) to `husky` in package.json for compatibility with husky v9
- Enhanced API documentation with JSDoc comments for secureLog utility functions ([#629](https://github.com/cpa03/blueprintify/pull/629))
- Standardized CMZ agent definition with mandatory planning section
- Fixed default value handling in MockDatabaseService (version, usage_count)
- Improved request logger middleware to handle undefined header values
- Replaced generic `Error` throws with typed `NotFoundError` in MockDatabaseService for better error discrimination
- JSDoc documentation added to Wizard.tsx and Header.tsx components ([#816](https://github.com/cpa03/blueprintify/pull/816))
- Improved StepIndicator accessibility for mobile screen readers ([#818](https://github.com/cpa03/blueprintify/pull/818))
- Removed unused `rollup-plugin-visualizer` dependency from root package.json ([#1256](https://github.com/cpa03/blueprintify/pull/1256))
- BroCula audit: improved a11y, preconnect hints, and LCP optimization for faster page loads ([#1259](https://github.com/cpa03/blueprintify/pull/1259))
- Modularized hardcoded configuration values into constants across API and web apps ([#1289](https://github.com/cpa03/blueprintify/pull/1289))
- Extracted route handler factory to eliminate handler duplication across routes ([#1288](https://github.com/cpa03/blueprintify/pull/1288))
- Removed unused `MockDatabaseService` per cleanup task ([#1042](https://github.com/cpa03/blueprintify/pull/1042))
- Replaced `as any` casts with typed alternatives across test files for improved type safety
- Added `engines` field to root `package.json` for Node version specification

### Fixed

- Prevent Zustand store action functions being replaced by persisted data (`loadState` used replace mode which stripped `setProjectName`, `nextStep`, etc.) — changed to merge mode to preserve action functions
- Use `FEATURE.MAX_COUNT` (20) instead of `FEATURE.MAX` (100) for features array max length in shared schema
- Cold start awareness: eagerly initialize circuit breaker in API warmup path and openai service init
- BugFixer cycle 3: fixed BUG-014 stale doc refs in main.yml (3rd fix attempt)
- BugFixer cycle 4: fixed stale Node.js 18+ references to 22+ across 5 documentation files
- RepoKeeper cycle 16: aligned `.node-version` with `.nvmrc` (20→22), pruned triage file, updated docs
- BroCula hunt: removed rehype-highlight, replaced framer-motion with CSS for performance
- Removed unused eslint-disable comment for no-console from secureLog.ts
- Aligned `.nvmrc` and `package.json` engines with Cloudflare Node 22 requirement
- Eagerly initialize circuit breaker to mitigate cold start gap in API ([#?](https://github.com/cpa03/blueprintify/pull/?))
- Smooth toast progress ring animation on hover-resume in web frontend
- Upgraded react to v19 to resolve version mismatch with react-dom
- Resolved dependency inconsistencies and type conflicts
- Locked `@cloudflare/vitest-pool-workers` to 0.12.21 to resolve peer dep conflict
- Removed dead code, unused barrel file, and pruned fraction.js dependency
- Downgraded `@cloudflare/vitest-pool-workers` to 0.12.21 for vitest 3.x compatibility
- Resolved Prettier formatting issue in `apps/web/index.html` ([#1313](https://github.com/cpa03/blueprintify/pull/1313))
- Added `/warmup` endpoint to pre-initialize circuit breaker on cold start ([#1312](https://github.com/cpa03/blueprintify/pull/1312))
- Recursive trigger bug in schema.sql that caused infinite loops
- `deserializeJSON` safety with proper error handling
- Share endpoint validation consistency using SHARE_CONFIG.ID_LENGTH constant
- Updated bugs.md - marked BUG-009 resolved, added BUG-010 for issue #743 ([#815](https://github.com/cpa03/blueprintify/pull/815))
- Resolved ZodError deprecation warnings and npm audit vulnerabilities in dependency tree ([#1258](https://github.com/cpa03/blueprintify/pull/1258))
- Standardized share route success response format for consistent API responses ([#1257](https://github.com/cpa03/blueprintify/pull/1257))
- Expanded HTTP status type assertion in error handler for complete status code coverage
- Global unhandled rejection and error handlers in frontend for improved resilience ([#1164](https://github.com/cpa03/blueprintify/pull/1164))
- Pinned wrangler to v4.86.0 for Node.js v20 compatibility ([#1299](https://github.com/cpa03/blueprintify/pull/1299))
- Restored accidentally removed `lsp` config section in `oh-my-openagent.json`
- Corrected Prettier formatting across multiple files (workflows, index.html)

### Performance

- BroCula hunt: removed rehype-highlight (~200KB), replaced framer-motion with CSS for lighter animations
- BroCula hunt cycle 4: replaced eager framer-motion with CSS animations, lazy-loaded MotionConfigWrapper for further bundle reduction
- Removed animation modulepreload hint for 100 Lighthouse performance score
- Async CSS loading and fetchpriority optimizations for faster page loads
- Replaced O(n) localStorage quota serialization with incremental estimate for non-blocking performance ([#1329](https://github.com/cpa03/blueprintify/pull/1329))
- Reduced CLS from 0.995 to 0.077, improving Lighthouse Performance to 95/100
- Lazy-loaded TemplateGrid, VercelAnalytics, and ToastContainer to reduce initial bundle ([#1317](https://github.com/cpa03/blueprintify/pull/1317))
- Lazy-loaded DOMPurify to reduce main bundle by ~25KB
- Reduced CLS from 0.891 to 0.153, improving Lighthouse performance score to 93
- Reduced CLS from 0.903 to 0.162 via skeleton layout match ([#1300](https://github.com/cpa03/blueprintify/pull/1300))
- Cached localStorage quota calculation to avoid blocking main thread ([#1307](https://github.com/cpa03/blueprintify/pull/1307))
- Lazy-loaded Wizard, StepIndicator, ShowEditorButton - Lighthouse score 74→98
- Optimized font loading and critical CSS rendering for Lighthouse performance
- Fixed CLS by giving lazy-loaded TemplateGrid a min-height fallback ([#1290](https://github.com/cpa03/blueprintify/pull/1290))

### Security

- Fixed auth bypass vulnerability when API_KEY is not configured - requests are now rejected with 503 instead of bypassing authentication ([#945](https://github.com/cpa03/blueprintify/issues/945), [#976](https://github.com/cpa03/blueprintify/pull/976))
- Comprehensive reliability audit verified all patterns implemented correctly (Error Boundaries, JSON Safety, Timeout Handling, Circuit Breaker, Rate Limiting, Input Validation, Storage Recovery, XSS Protection, Error Classes, Retry Logic)
- Added `.dev.vars` to `.gitignore` to prevent credential commits ([#819](https://github.com/cpa03/blueprintify/pull/819))

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
  - Frontend: React 19, Vite, Tailwind CSS, Zustand, CodeMirror, Framer Motion
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
