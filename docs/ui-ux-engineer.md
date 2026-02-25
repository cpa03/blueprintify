# UI/UX Engineer Agent - Memory & Guidelines

## Domain

UI/UX Engineering - Design system, accessibility, user flow, micro-interactions

## Responsibilities

- Maintain global CSS variables and Tailwind config
- Optimize user flow for goal completion
- Add subtle animations (framer-motion) for feedback
- Ensure WCAG AA compliance for color contrast

## Current Branch

`agent/ui-ux-engineer`

## Active PR

- **#90X**: style: add aria-hidden to decorative SVG icons
  - Status: OPEN
  - Changes: Added `aria-hidden="true"` to decorative SVG icons for accessibility
  - Files: `Header.tsx`, `TemplateGrid.tsx`, `Toast.tsx`, `KeyboardShortcutsModal.tsx`, `StepInfo.tsx`, `StepFeatures.tsx`, `StepStack.tsx`, `StepGenerating.tsx`

## Previous PR

- **#901**: style: standardize focus-visible ring opacity across components
  - Status: CLOSED
  - Changes: Standardized focus-visible ring opacity from `/60` to `/50`
  - Files: `TemplateGrid.tsx`, `StepStack.tsx`

## Verified Patterns

### Focus Ring Standards

- Use `ring-primary-500/50` for focus-visible rings
- Pattern: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950`

### CSS Custom Properties

- Use CSS custom properties for inline styles in Framer Motion
- Pattern: `var(--color-primary-500)` instead of hardcoded hex values

### SVG Accessibility

- Add `aria-hidden="true"` to decorative SVG icons
- Decorative icons are those that don't convey meaning on their own
- Icons inside buttons with aria-label should have aria-hidden
- Pattern: `<svg ... aria-hidden="true">`

## QA Checklist

- [x] Build passes
- [x] TypeScript compiles without errors
- [x] Tests pass (251 tests)
- [x] No lint errors
- [x] Focus indicators meet WCAG AA
- [x] Consistent color usage via theme tokens

## Workflow

1. Check for open PRs with `ui-ux-engineer` label
2. Review and ensure branch is up to date with main
3. Verify build/lint/test pass
4. Comment review results on PR
5. Create/update docs/ui-ux-engineer.md for memory

## Communication

- Label PRs with `ui-ux-engineer`
- Keep changes atomic and small
- Focus on measurable improvements
