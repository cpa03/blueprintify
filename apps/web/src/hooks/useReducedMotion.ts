import { useSyncExternalStore, useMemo } from "react";
import { SPRING_CONFIG } from "../config/constants";

function subscribeToReducedMotion(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  } else {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * useReducedMotion - Hook to detect user's reduced motion preference
 *
 * This hook detects the `prefers-reduced-motion` media query and provides
 * a boolean indicating whether the user prefers reduced motion animations.
 *
 * Features:
 * - Respects system-level accessibility settings
 * - Updates automatically when user changes preferences
 * - SSR-safe (defaults to false on server)
 * - Provides helper functions for conditional animations
 *
 * @example
 * ```tsx
 * const shouldReduceMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={shouldReduceMotion ? {} : { opacity: 1 }}
 *   transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
 * />
 * ```
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * Get animation configuration based on reduced motion preference
 *
 * @param shouldReduceMotion - Whether to reduce motion
 * @param duration - Normal animation duration
 * @returns Animation duration (0 if reduced motion, otherwise original duration)
 */
export function getAnimationDuration(shouldReduceMotion: boolean, duration: number): number {
  return shouldReduceMotion ? 0 : duration;
}

/**
 * Get spring configuration based on reduced motion preference
 *
 * @param shouldReduceMotion - Whether to reduce motion
 * @param springConfig - Normal spring configuration
 * @returns Spring configuration (stiff spring if reduced motion)
 */
export function getSpringConfig(
  shouldReduceMotion: boolean,
  springConfig: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } = {}
): { stiffness: number; damping: number; mass: number } {
  if (shouldReduceMotion) {
    return SPRING_CONFIG.REDUCED_MOTION;
  }

  return {
    stiffness: springConfig.stiffness ?? SPRING_CONFIG.DEFAULT.stiffness,
    damping: springConfig.damping ?? SPRING_CONFIG.DEFAULT.damping,
    mass: springConfig.mass ?? SPRING_CONFIG.DEFAULT.mass,
  };
}

/**
 * Hook for creating animation props that respect reduced motion
 *
 * @param animationProps - Normal animation properties
 * @param reducedMotionProps - Animation properties when reduced motion is preferred
 * @returns Animation properties based on user's preference
 */
export function useAccessibleAnimation<T extends Record<string, unknown>>(
  animationProps: T,
  reducedMotionProps?: Partial<T>
): T | Partial<T> {
  const shouldReduceMotion = useReducedMotion();

  return useMemo(() => {
    if (shouldReduceMotion) {
      return reducedMotionProps ?? {};
    }
    return animationProps;
  }, [shouldReduceMotion, animationProps, reducedMotionProps]);
}

function subscribeToHighContrast(callback: () => void): () => void {
  const mediaQuery = window.matchMedia("(prefers-contrast: more)");

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", callback);
    return () => mediaQuery.removeEventListener("change", callback);
  } else {
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }
}

function getHighContrastSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

function getHighContrastServerSnapshot(): boolean {
  return false;
}

/**
 * Check if the user has enabled any accessibility settings that might
 * affect animations (including reduced motion, high contrast, etc.)
 *
 * @returns Object with various accessibility preferences
 */
export function useAccessibilityPreferences(): {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
} {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const prefersHighContrast = useSyncExternalStore(
    subscribeToHighContrast,
    getHighContrastSnapshot,
    getHighContrastServerSnapshot
  );

  return useMemo(
    () => ({
      prefersReducedMotion,
      prefersHighContrast,
    }),
    [prefersReducedMotion, prefersHighContrast]
  );
}

export default useReducedMotion;
