# Flexy Iteration 10: Eliminate Hardcoded Animation Durations

> **Goal:** Replace all remaining hardcoded framer-motion `duration` values in components with references to the centralized `ANIMATION` constants in `apps/web/src/config/constants/ui.ts`.

**Architecture:** The `ANIMATION` object in `ui.ts` is the single source of truth for animation durations. Some values (0.6s for pulse) need to be added, then 22 occurrences in 9 component files need to reference the constants instead of hardcoded numbers.

**Tech Stack:** React, Framer Motion, TypeScript

---

### Changes Summary

| File                                                | Change                                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/config/constants/ui.ts`               | Add `ANIMATION.PULSE = 0.6` for pulse/loop animations                                                                      |
| `apps/web/src/components/editor/EditorHeader.tsx`   | `0.1` → `ANIMATION.QUICK_FADE` (3 occurrences)                                                                             |
| `apps/web/src/components/Tooltip.tsx`               | `0.15` → `ANIMATION.FAST`                                                                                                  |
| `apps/web/src/components/LastSavedIndicator.tsx`    | `0.2` → `ANIMATION.NORMAL`, `0.1` → `ANIMATION.QUICK_FADE`                                                                 |
| `apps/web/src/components/CharacterCounter.tsx`      | `0.6` → `ANIMATION.PULSE`                                                                                                  |
| `apps/web/src/components/AnimatedNumber.tsx`        | `0.3` → `ANIMATION.MEDIUM`, `0.4` → `ANIMATION.MEDIUM_SLOW`, `0.6` → `ANIMATION.PULSE`                                     |
| `apps/web/src/components/ScrollProgress.tsx`        | `0.3` → `ANIMATION.SUBTLE_MOVE`                                                                                            |
| `apps/web/src/components/wizard/StepGenerating.tsx` | `0.4` → `ANIMATION.MEDIUM_SLOW` (2 occurrences)                                                                            |
| `apps/web/src/components/wizard/StepFeatures.tsx`   | `0.2` → `ANIMATION.NORMAL`, `0.35` → `ANIMATION.SEMI_SLOW`, `0.4` → `ANIMATION.MEDIUM_SLOW` (2x), `0.5` → `ANIMATION.SLOW` |
| `apps/web/src/components/wizard/StepInfo.tsx`       | `0.2` → `ANIMATION.NORMAL` (3 occurrences)                                                                                 |

### Verification

- `npm run typecheck` — clean
- `npm run lint` — zero warnings
- `npm run test:all` — all tests passing
