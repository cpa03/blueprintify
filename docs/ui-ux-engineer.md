# UI/UX Engineer Memory

> Long-term memory for UI/UX improvements and learnings

## Project: Blueprintify

**Last Updated:** 2026-02-26

---

## UI Standards (from frontend.md)

- Use functional components with React.memo for expensive renders
- Use Tailwind CSS for styling with theme tokens (no hardcoded hex values)
- Ensure accessibility (WCAG AA compliance)
- Use framer-motion for animations
- Wrap callbacks with useCallback, computed values with useMemo

## Component Patterns

### Accessibility

- SkipLink component for keyboard navigation (WCAG 2.4.1) ✅ Implemented
- ARIA labels on interactive elements ✅ Implemented
- Focus-visible states for keyboard navigation ✅ Implemented
- Role attributes for semantic structure ✅ Implemented
- StepIndicator now uses `<nav>` with aria-label for better screen reader support ✅ Added 2026-02-26

### Styling

- Glass card effect: `glass-card` class ✅ Defined
- Gradient borders: `gradient-border` class ✅ Defined
- Button variants: `btn-primary`, `btn-secondary`, `btn-ghost` ✅ Defined
- Input fields: `input-field`, `textarea-field` ✅ Defined
- Tech chips: `tech-chip` with `.selected` state ✅ Defined

### Animation

- Use framer-motion for all animations ✅ Implemented
- AnimatePresence for enter/exit animations ✅ Implemented
- Spring animations for natural feel ✅ Implemented
- Respect prefers-reduced-motion ✅ Implemented

---

## Changelog

- **2026-02-25**: Replaced hardcoded RGB values with theme tokens (ScrollProgress, MarkdownRenderer)
- **2026-02-25**: Added focus-visible for AnimatedInput components
- **2026-02-25**: Replaced hardcoded colors in index.css with CSS custom properties (theme tokens)
- **2026-02-26**: Replaced hardcoded RGB values in ScrollProgress.tsx with CSS variables
- **2026-02-26**: Replaced hardcoded RGB values in StepIndicator.tsx with CSS variables
- **2026-02-26**: Added role="navigation" and aria-label to StepIndicator for better screen reader support

---

## Key Components Inspected

| Component        | Status  | Notes                                 |
| ---------------- | ------- | ------------------------------------- |
| Header           | ✅ Good | Proper ARIA labels, focus states      |
| Wizard           | ✅ Good | Accessibility hooks implemented       |
| Editor           | ✅ Good | Proper accessibility, lazy loading    |
| EditorToolbar    | ✅ Good | aria-label on all buttons             |
| SkipLink         | ✅ Good | WCAG 2.1 compliant                    |
| Toast            | ✅ Good | Progress ring, pause on hover, ARIA   |
| TemplateGrid     | ✅ Good | Keyboard nav, aria-busy, focus states |
| AnimatedInput    | ✅ Good | focus-visible recently added          |
| ScrollProgress   | ✅ Good | Theme tokens recently added           |
| MarkdownRenderer | ✅ Good | Theme tokens recently added           |
| StepIndicator    | ✅ Good | Theme tokens + navigation role added  |

---

## Color Palette (Tailwind Theme)

```
dark: { 50: "#f7f7f8", 100: "#ececee", ... 950: "#0d0d0f" }
primary: { 50: "#eef2ff", ... 950: "#1e1b4b" }
accent: { cyan: "#06b6d4", purple: "#8b5cf6", pink: "#ec4899", emerald: "#10b981" }
```

---

## Build Verification

```
✅ TypeScript: No errors
✅ ESLint: No errors (14 pre-existing warnings)
✅ Web Tests: 340 passed (21 test files)
✅ Build: Successful
```

---

## Observations

1. **Accessibility**: Excellent coverage with SkipLink, focus-visible states, ARIA labels throughout
2. **Styling**: Consistent use of Tailwind theme tokens, recent fixes for hardcoded RGB values
3. **Animations**: Framer-motion used throughout with prefers-reduced-motion respected
4. **Component Structure**: Well-organized with proper React.memo usage
5. **index.html**: Critical CSS uses inline hardcoded colors for LCP optimization (intentional)

---

## Session 2026-02-26 (Evening)

- **2026-02-26**: Added role="navigation" and aria-label to StepIndicator for improved screen reader semantics
- **2026-02-26**: Build successful, 340 web tests passed
- **Finding**: Accessibility is production-ready with comprehensive ARIA labels, focus-visible states, and semantic HTML

---

## Verified Files

- `apps/web/tailwind.config.js` - Theme tokens defined properly
- `apps/web/src/index.css` - Component classes defined, reduced-motion support
- `apps/web/src/components/Header.tsx` - Accessibility good
- `apps/web/src/components/SkipLink.tsx` - WCAG compliant
- `apps/web/src/components/Editor.tsx` - Proper accessibility
- `apps/web/src/components/editor/EditorToolbar.tsx` - Proper ARIA labels
- `apps/web/src/components/Toast.tsx` - Progress ring, accessibility good
- `apps/web/src/components/TemplateGrid.tsx` - Keyboard navigation, aria-busy
- `apps/web/src/components/AnimatedInput.tsx` - focus-visible added
- `apps/web/src/components/ScrollProgress.tsx` - Theme tokens recently added
- `apps/web/src/components/StepIndicator.tsx` - Theme tokens + nav role added
- `apps/web/src/components/MarkdownRenderer.tsx` - Theme tokens recently added
- `apps/web/src/components/AnimatedNumber.tsx` - Theme tokens added
- `apps/web/src/components/CircularProgress.tsx` - Theme tokens added
- `apps/web/src/components/wizard/StepGenerating.tsx` - Theme tokens added
