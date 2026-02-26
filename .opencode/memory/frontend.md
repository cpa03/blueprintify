# Frontend Patterns & Conventions

## UI Standards

- Use functional components with React.memo for expensive renders
- Use Tailwind CSS for styling with theme tokens (no hardcoded hex values)
- Ensure accessibility (WCAG AA compliance)
- Use framer-motion for animations
- Wrap callbacks with useCallback, computed values with useMemo
- Always verify lint passes with zero warnings before submitting PRs

## Component Patterns

### Accessibility

- SkipLink component for keyboard navigation (WCAG 2.4.1)
- ARIA labels on interactive elements
- Focus-visible states for keyboard navigation
- Role attributes for semantic structure

### Styling

- Glass card effect: `glass-card` class
- Gradient borders: `gradient-border` class
- Button variants: `btn-primary`, `btn-secondary`, `btn-ghost`
- Input fields: `input-field`, `textarea-field`
- Tech chips: `tech-chip` with `.selected` state

### Animation

- Use framer-motion for all animations
- AnimatePresence for enter/exit animations
- Spring animations for natural feel
- Respect prefers-reduced-motion

## Lessons Learned

- SkipLink improves keyboard navigation accessibility
- Focus ring consistency across all interactive elements
- Color contrast must meet WCAG AA standards
- Always run lint before submitting - unused destructured variables cause PR warnings
- ESLint rule `@typescript-eslint/no-unused-vars` catches unused variables in destructuring
XS|- Test files must pass lint checks just like production code
#QT|- React.memo must be imported from React, NOT from framer-motion
#NR|- ErrorBoundary must remain a class component in React 18 (no functional equivalent)
- Test files must pass lint checks just like production code
