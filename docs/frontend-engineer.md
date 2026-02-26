# Frontend Engineer Agent - Long-term Memory

## Overview

This document serves as the long-term memory for the frontend-engineer agent, tracking patterns, lessons learned, and process improvements.

## Process

### Ultrawork Loop Phases

1. **INITIATE**: Check for existing PRs with frontend-engineer label, look for issues
2. **PLAN**: Create work plan for the task
3. **IMPLEMENT**: Make the code changes
4. **VERIFY**: Run TypeScript check and tests
5. **SELF-REVIEW**: Review the changes
6. **SELF-EVOLVE**: Update this document with lessons learned
7. **DELIVER**: Create PR with proper labels

## Project Context

### Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- Framer Motion for animations
- Radix UI for accessible primitives

### Key Files

- `apps/web/src/components/` - React components
- `apps/web/src/hooks/` - Custom React hooks
- `apps/web/src/store/` - Zustand stores
- `apps/web/src/lib/` - Utility libraries

## Patterns & Conventions

### React.memo Usage

Components that benefit from React.memo:

- Pure presentational components
- Components with stable props
- Components that re-render frequently

Currently memoized:

- `Wizard.tsx`
- `LastSavedIndicator.tsx`
- `Editor.tsx`
- `EditorHeader.tsx`
- `EditorToolbar.tsx`
- `TemplateGrid.tsx`
- `ScrollProgress.tsx`
- `Tooltip.tsx`
- `SmartTooltip.tsx`
- `AnimatedNumber.tsx`
- `TypeIndicator.tsx`
- `RippleButton.tsx`

Components NOT memoized (could benefit):

- `SkipLink.tsx`
- `ScrollToTop.tsx`
- `EditorEmptyState.tsx`
- `MotionConfigWrapper.tsx`

### Accessibility Patterns

- Use `aria-live` for dynamic content
- Use `aria-busy` for loading states
- Use `role="progressbar"` for progress indicators
- SkipLink component for keyboard navigation (WCAG 2.4.1)

### Build & Test Commands

```bash
# Build
npm run build

# TypeScript check
npm run typecheck

# Tests
npm run test

# Run with coverage
npm run test:coverage
```

## Lessons Learned

### 2026-02-26

- **Initial Setup**: Created frontend-engineer.md memory document
- **Analysis**: Scanned codebase for React.memo usage patterns
- **Build Status**: Passes (with chunk size warning for codemirror ~610KB)
- **TypeScript**: Passes with no errors
- **Tests**: All 340 tests pass
- **Previous PR**: Closed PR #1044/#1052 (React.memo consistency) was already merged to main

### Edit Tool Usage

When making changes to React components:

- Use edit tool for small changes (adding imports, wrapping functions)
- Use write tool for complete rewrites
- Always backup/restore from git when edits cause corruption
- Test build after each change to catch issues early

### Quick Wins Identified

1. Add React.memo to remaining components:
   - SkipLink.tsx
   - ScrollToTop.tsx
   - EditorEmptyState.tsx
   - MotionConfigWrapper.tsx

2. Potential accessibility improvements:
   - Ensure all interactive elements have focus styles
   - Verify color contrast ratios

3. Performance improvements:
   - The codemirror chunk is ~610KB (warning)
   - Could benefit from code splitting

## Future Improvements

- Continue adding React.memo to remaining components
- Consider lazy loading for large dependencies
- Add more integration tests for critical user flows
- Document component prop patterns


### 2026-02-26 (continued)

- **Issue Addressed**: #1052 - ErrorBoundary Class Component Modernization
- **Finding**: React 18 requires class components for error boundaries - there is NO functional alternative
- **Solution**: Added comprehensive documentation explaining this React limitation while maintaining class implementation
- **PR Created**: #1123
- **Build**: Passes
- **Tests**: All 340 frontend tests pass
- **Lint**: No errors