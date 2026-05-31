/**
 * @fileoverview Motion configuration wrapper component for accessibility.
 *
 * This component provides:
 * - Reduced motion preference handling (via CSS, framer-motion natively respects
 *   prefers-reduced-motion so we don't need to import their MotionConfig)
 * - Optional mount callback
 *
 * Performance note: framer-motion's MotionConfig was previously imported here,
 * which forced the entire 127 KB animation chunk onto the critical path. Since
 * framer-motion already respects the prefers-reduced-motion media query by
 * default, we can omit MotionConfig entirely and handle reduced motion purely
 * via CSS (ReducedMotionContext).
 *
 * @module components/MotionConfigWrapper
 */

import { memo, useEffect, type ReactNode } from "react";

/**
 * Props for the MotionConfigWrapper component.
 */

interface MotionConfigWrapperProps {
  children: ReactNode;
  onMount?: () => void;
}

/**
 * Wrapper component for app content.
 * Previously configured Framer Motion for accessibility. Since framer-motion
 * natively respects the prefers-reduced-motion media query, this wrapper now
 * just handles the mount callback.
 *
 * @param props - Component props
 * @param props.children - Child components to render
 * @param props.onMount - Optional callback fired when component mounts
 * @returns The rendered component
 *
 * @example
 * // Basic usage
 * <MotionConfigWrapper>
 *   <AnimatedComponent />
 * </MotionConfigWrapper>
 */

export const MotionConfigWrapper = memo(function MotionConfigWrapper({
  children,
  onMount,
}: MotionConfigWrapperProps): JSX.Element {
  useEffect(() => {
    onMount?.();
  }, [onMount]);

  return <>{children}</>;
});
