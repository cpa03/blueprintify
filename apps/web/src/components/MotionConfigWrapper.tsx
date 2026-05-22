/**
 * @fileoverview Motion configuration wrapper component for accessibility.
 *
 * This component provides:
 * - Reduced motion preference handling
 * - Framer Motion configuration
 * - Optional mount callback
 *
 * @module components/MotionConfigWrapper
 */

import { MotionConfig } from "framer-motion";
import { useReducedMotionContext } from "../context/ReducedMotionContext";
import { useEffect, ReactNode } from "react";

/**
 * Props for the MotionConfigWrapper component.
 */

interface MotionConfigWrapperProps {
  children: ReactNode;
  onMount?: () => void;
}

/**
 * Wrapper component that configures Framer Motion based on user accessibility preferences.
 * Automatically enables or disables animations based on the system's reduced motion setting.
 *
 * @param props - Component props
 * @param props.children - Child components to render within the motion context
 * @param props.onMount - Optional callback fired when component mounts
 * @returns The rendered component with motion configuration
 *
 * @example
 * // Basic usage
 * <MotionConfigWrapper>
 *   <AnimatedComponent />
 * </MotionConfigWrapper>
 *
 * @example
 * // With mount callback
 * <MotionConfigWrapper onMount={() => console.log('mounted')}>
 *   <Content />
 * </MotionConfigWrapper>
 */

export function MotionConfigWrapper({ children, onMount }: MotionConfigWrapperProps): JSX.Element {
  const { prefersReducedMotion } = useReducedMotionContext();

  useEffect(() => {
    onMount?.();
  }, [onMount]);

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
