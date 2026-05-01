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

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
}

export function getAnimationDuration(
  shouldReduceMotion: boolean,
  duration: number,
): number {
  return shouldReduceMotion ? 0 : duration;
}

export function getSpringConfig(
  shouldReduceMotion: boolean,
  springConfig: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } = {},
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

export function useAccessibleAnimation<T extends Record<string, unknown>>(
  animationProps: T,
  reducedMotionProps?: Partial<T>,
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

export function useAccessibilityPreferences(): {
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
} {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const prefersHighContrast = useSyncExternalStore(
    subscribeToHighContrast,
    getHighContrastSnapshot,
    getHighContrastServerSnapshot,
  );

  return useMemo(
    () => ({
      prefersReducedMotion,
      prefersHighContrast,
    }),
    [prefersReducedMotion, prefersHighContrast],
  );
}
