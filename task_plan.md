# Task Plan: Palette Micro-UX Improvement

## Goal

Add one micro-UX improvement that makes the interface more delightful: a brief "completion pulse" animation on the step indicator's CircularProgress ring when navigating forward through wizard steps.

## Phases

- [x] Phase 1: Research & codebase exploration
- [ ] Phase 2: Implement the micro-UX change
- [ ] Phase 3: Verify with build/lint
- [ ] Phase 4: Create PR

## The Change

In `StepIndicator.tsx`, add a one-shot bounce/pulse animation on the progress number inside the CircularProgress ring when a step is completed (i.e., when navigating forward). This gives a "level up" feeling and confirms the user's action succeeded.

Specifically:

- Track the previous step index
- On forward navigation (index increases), animate a brief scale pulse on the number inside the ring
- Clean up any old animation state

## Key Questions

1. Is the change simple enough? Yes - it's a few lines in one file.
2. Does it follow existing patterns? Yes - uses framer-motion `animate` prop with spring config.
3. Will build/lint pass? Must verify.

## Status

**Currently in Phase 2** - Implementing the change
