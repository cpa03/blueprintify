/**
 * @fileoverview Type indicator component and hook for showing typing state.
 *
 * This module provides:
 * - TypeIndicator component: Animated dots showing typing/loading state
 * - useTypingIndicator hook: Manages typing state with timeout handling
 *
 * @module components/TypeIndicator
 */

import { useState, useCallback, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIMATION, ANIMATION_MS } from "../config/constants";
import { ANIMATION_TIMING } from "../config/theme";
import { TYPING } from "../config/styles";

/**
 * Props for the TypeIndicator component.
 */

interface TypeIndicatorProps {
  isTyping: boolean;
  position?: "left" | "right";
  className?: string;
}

/**
 * Animated typing indicator showing three bouncing dots.
 * Used to indicate that AI is generating content.
 *
 * @param props - Component props
 * @param props.isTyping - Whether the typing indicator should be visible
 * @param props.position - Position relative to adjacent content (default: "right")
 * @param props.className - Additional CSS classes
 * @returns The rendered typing indicator animation
 *
 * @example
 * // Basic usage
 * <TypeIndicator isTyping={isGenerating} />
 *
 * @example
 * // With custom position
 * <TypeIndicator isTyping={true} position="left" />
 */

export const TypeIndicator = memo(function TypeIndicator({
  isTyping,
  position = "right",
  className = "",
}: TypeIndicatorProps) {
  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: ANIMATION.NORMAL,
            ease: ANIMATION_TIMING.easing.easeOut,
          }}
          className={`inline-flex items-center gap-1 ${
            position === "left" ? "mr-2" : "ml-2"
          } ${className}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={TYPING.SR_ONLY}>Typing</span>
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className={TYPING.DOT}
              animate={{
                y: [0, -4, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: ANIMATION.SLOW,
                repeat: Infinity,
                delay: index * ANIMATION.STAGGER,
                ease: ANIMATION_TIMING.easing.easeInOut,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/**
 * Options for the useTypingIndicator hook.
 */

interface UseTypingIndicatorOptions {
  delay?: number;
  minInputLength?: number;
}

/**
 * Hook for managing typing indicator state with automatic timeout.
 * Tracks input changes and shows typing state for a configurable duration.
 *
 * @param options - Configuration options
 * @param options.delay - Duration to show typing state in ms (default: from constants)
 * @param options.minInputLength - Minimum input length to trigger typing state (default: 0)
 * @returns Object containing isTyping state and event handlers
 *
 * @example
 * const { isTyping, handleTyping, handleBlur } = useTypingIndicator({ delay: 2000 });
 *
 * // Use in input handler
 * <input onChange={(e) => handleTyping(e.target.value)} onBlur={handleBlur} />
 */

export function useTypingIndicator(options: UseTypingIndicatorOptions = {}) {
  const { delay = ANIMATION_MS.TYPING_INDICATOR_TIMEOUT, minInputLength = 0 } = options;
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef<string>("");

  const handleTyping = useCallback(
    (value: string) => {
      if (value.length >= minInputLength && value !== lastValueRef.current) {
        setIsTyping(true);
        lastValueRef.current = value;

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, delay);
      }
    },
    [delay, minInputLength]
  );

  const handleBlur = useCallback(() => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isTyping,
    handleTyping,
    handleBlur,
  };
}

export default TypeIndicator;
