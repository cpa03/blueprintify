import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { ANIMATION, TEXTAREA_CONFIG } from "../config/constants";

interface UseAutoResizeTextareaOptions {
  minHeight?: number;
  maxHeight?: number;
  animate?: boolean;
  extraPadding?: number;
}

interface UseAutoResizeTextareaReturn {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  height: number;
  resize: () => void;
}

/**
 * useAutoResizeTextarea - A delightful auto-resizing textarea hook
 *
 * Features:
 * - Automatically adjusts height based on content
 * - Respects min/max height constraints
 * - Smooth height transitions (respects reduced motion preferences)
 * - Handles window resize and initial mount
 * - Accessible - maintains focus and cursor position
 */
export function useAutoResizeTextarea(
  options: UseAutoResizeTextareaOptions = {}
): UseAutoResizeTextareaReturn {
  const {
    minHeight = TEXTAREA_CONFIG.DEFAULT_MIN_HEIGHT_PX,
    maxHeight = TEXTAREA_CONFIG.DEFAULT_MAX_HEIGHT_PX,
    animate = true,
    extraPadding = TEXTAREA_CONFIG.DEFAULT_EXTRA_PADDING_PX,
  } = options;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState(minHeight);
  const prefersReducedMotion = useReducedMotion();
  const previousValueRef = useRef<string>("");
  const isInitializedRef = useRef(false);

  const calculateAndApplyHeight = useCallback(
    (textarea: HTMLTextAreaElement) => {
      const scrollTop = window.scrollY;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;

      const previousHeight = textarea.style.height;
      textarea.style.height = "auto";

      const scrollHeight = textarea.scrollHeight + extraPadding;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = previousHeight;

      if (animate && !prefersReducedMotion) {
        textarea.style.transition = `height ${ANIMATION.NORMAL}s ease-out`;
      } else {
        textarea.style.transition = "none";
      }

      textarea.style.height = `${newHeight}px`;
      textarea.setSelectionRange(selectionStart, selectionEnd);
      window.scrollTo({ top: scrollTop, behavior: "auto" });

      return newHeight;
    },
    [minHeight, maxHeight, extraPadding, animate, prefersReducedMotion]
  );

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newHeight = calculateAndApplyHeight(textarea);
    setHeight(newHeight);
  }, [calculateAndApplyHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      if (textarea.value !== previousValueRef.current) {
        previousValueRef.current = textarea.value;
        const newHeight = calculateAndApplyHeight(textarea);
        setHeight(newHeight);
      }
    };

    textarea.addEventListener("input", handleInput);
    return () => textarea.removeEventListener("input", handleInput);
  }, [calculateAndApplyHeight]);

  useEffect(() => {
    const handleWindowResize = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      requestAnimationFrame(() => {
        const newHeight = calculateAndApplyHeight(textarea);
        setHeight(newHeight);
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [calculateAndApplyHeight]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || isInitializedRef.current) return;

    isInitializedRef.current = true;
    const newHeight = calculateAndApplyHeight(textarea);
    setHeight(newHeight);
  }, [calculateAndApplyHeight]);

  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  return {
    textareaRef,
    height,
    resize,
  };
}

export type { UseAutoResizeTextareaOptions, UseAutoResizeTextareaReturn };
