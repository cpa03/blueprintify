/**
 * @fileoverview Lazy-loading wrapper for Framer Motion's AnimatePresence.
 *
 * Performance: Defers the ~136 kB framer-motion animation chunk from the
 * critical render path. Instead of eagerly importing AnimatePresence in the
 * Wizard component (which couples framer-motion to the initial wizard load),
 * this wrapper dynamically imports it on first render.
 *
 * The lazy import is triggered when the wizard steps first mount, not on
 * initial page load. This directly addresses the Lighthouse "Reduce unused
 * JavaScript" finding by deferring framer-motion until it's actually needed
 * for step transitions.
 *
 * The Suspense fallback renders children directly (no AnimatePresence wrapper)
 * until framer-motion finishes loading. Since the wizard shows one step at a
 * time without transitions on first paint, the missing AnimatePresence is
 * imperceptible to users.
 *
 * @module components/StepTransition
 */

import { lazy, Suspense, type ReactNode } from "react";

const AnimatePresence = lazy(() =>
  import("framer-motion").then((m) => ({ default: m.AnimatePresence }))
);

interface StepTransitionProps {
  readonly children: ReactNode;
  readonly mode?: "wait" | "sync" | "popLayout";
}

/**
 * Lazy AnimatePresence wrapper that defers framer-motion loading.
 * Shows children directly (no animation wrapper) until the library loads,
 * then seamlessly enables AnimatePresence with the specified mode.
 */
export function StepTransition({ children, mode = "wait" }: StepTransitionProps): JSX.Element {
  return (
    <Suspense fallback={<>{children}</>}>
      <AnimatePresence mode={mode}>{children}</AnimatePresence>
    </Suspense>
  );
}
