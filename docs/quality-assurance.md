# Quality Assurance Agent

## Overview

This document serves as the long-term memory for the Quality Assurance agent.

## Current Test Coverage (Updated 2026-02-27)

| Workspace       | Test Files | Tests   |
| --------------- | ---------- | ------- |
| apps/web        | 28         | 471     |
| apps/api        | 22         | 279     |
| packages/shared | 4          | 107     |
| **Total**       | **54**     | **857** |

## Test Files Added (2026-02-27)

1. **apps/web/src/components/MarkdownRenderer.test.tsx** - Tests for markdown rendering component
   - Basic rendering: content, paragraphs, className
   - Heading elements: h1 through h6
   - Text formatting: inline code
   - Links and images: proper attributes, lazy loading
   - Tables: rendering with headers and cells
   - Blockquotes: rendering
   - Security: XSS protection (malicious content handling)
   - Memoization: re-render behavior
   - 20 tests total

2. **apps/web/src/utils/motion.test.ts** - Tests for Framer Motion animation variants
   - transitions: fast, normal, slow, spring transitions
   - fadeInUp, staggerContainer, fadeIn, scaleIn variants
   - slideInRight, slideInLeft variants
   - floatingAnimation, pulseAnimation, pageTransition
   - createStaggerContainer, createFadeInUp factory functions
   - 28 tests total

3. **apps/web/src/config/theme.test.ts** - Tests for design tokens
   - COLORS: primary, dark, accent, semantic, gradients
   - ANIMATION_TIMING: durations, easing, stagger
   - SPACING: scale, container, radius
   - TYPOGRAPHY: font family, sizes, weights, line heights
   - SHADOWS: glow, box shadows
   - OPACITY: numeric and semantic values
   - Z_INDEX, BREAKPOINTS
   - tailwindTheme export
   - Type exports verification
   - 36 tests total

4. **apps/web/src/components/ErrorBoundary.test.tsx** - Tests for error boundary component
   - Renders children when no error occurs
   - Accepts onError callback prop
   - Passes error and errorInfo to callback
   - Accepts custom fallback prop
   - Renders default fallback UI
   - Handles nested component errors
   - Handles non-Error thrown values
   - 9 tests total

5. **apps/web/src/store/persistence.test.ts** - Tests for persistence utilities
   - loadState: loads from storage, handles null, handles errors
   - saveState: saves data using getPersistData, handles errors
   - debouncedSave: delay mechanism, clears previous timeout
   - flushSave: cancels pending saves
   - cancelSave: clears pending saves
   - Full integration load-save cycle

- 11 tests total

## Testing Gaps Identified

### packages/shared (FULLY TESTED - 2026-02-27)

The shared package now has comprehensive test coverage:

| File                | Tests              | Status      |
| ------------------- | ------------------ | ----------- |
| `config.ts`         | 43 tests           | ✅ Complete |
| `schema.ts`         | 25 tests           | ✅ Complete |
| `templates.ts`      | 19 tests           | ✅ Complete |
| `types.ts`          | 20 tests           | ✅ Complete |
| `utils/debounce.ts` | Tested via web app | ✅ Complete |

**Total: 107 tests** for the shared package.

### apps/web/src/lib (PARTIALLY TESTED)

- `api.ts` - TESTED
- `clipboard.ts` - TESTED
- `security.ts` - TESTED
- `export.ts` - TESTED
- `storage.ts` - TESTED
- `storageAdapter.ts` - TESTED

### apps/web/src/components (PARTIALLY TESTED)

Components with tests:

- Editor.test.tsx
- ErrorBoundary.test.tsx
- Wizard.test.tsx
- StepIndicator.test.tsx
- Header.test.tsx
- MarkdownRenderer.test.tsx (NEW)

Components without tests (opportunity for expansion):

- AnimatedInput.tsx
- Toast.tsx
- TemplateGrid.tsx
- ScrollProgress.tsx
- And more...

### apps/web/src/hooks

Most hooks have tests, but coverage could be expanded.

## Known Issues

### Existing Test Failures

All tests currently passing (2026-02-27):

- web: 471 tests ✅
- api: 279 tests ✅
- shared: 107 tests ✅

## Best Practices

1. Always add tests for new utilities in shared packages
2. Use vitest with fake timers for debounce/throttle utilities
3. Mock browser APIs (clipboard, fetch) when testing browser-specific code
4. Tests should be deterministic and not depend on external services
5. Add tests for critical UI components that handle user input
