# Frontend Patterns & Conventions

## UI Standards

- Use functional components with React.memo for expensive renders
- Use Tailwind CSS for styling with theme tokens (no hardcoded hex values)
- Ensure accessibility (WCAG AA compliance)
- Use framer-motion for animations
- Wrap callbacks with useCallback, computed values with useMemo

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
