/**
 * @fileoverview "— or start from scratch —" divider button below the template grid.
 *
 * Activates the wizard panel without selecting a template, giving first-time
 * visitors a working path into the Project Info step (issue #3617: the divider
 * was previously a plain <div>, so the wizard only mounted on template select).
 *
 * @module components/StartFromScratchButton
 */

import { useCallback, useState } from "react";
import {
  DATA_BOOLEAN_VALUES,
  DIVIDER_BUTTON_STATE_VALUES,
  HTML_CONTROL_TYPES,
} from "@blueprint/shared";
import { LAYOUT } from "../config/styles";
import { UI_CONTENT } from "../config/constants/content";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface StartFromScratchButtonProps {
  /** Called when the user activates the button (click, Enter, or Space). */
  onStart: () => void;
}

/**
 * Interactive divider that starts a blank project.
 * A native <button> provides keyboard activation (Enter/Space) and focus
 * semantics for free (WCAG 2.1.1); styled to match the previous divider.
 */
export function StartFromScratchButton({ onStart }: StartFromScratchButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = useCallback(() => {
    onStart();
  }, [onStart]);

  const currentState = isFocused
    ? DIVIDER_BUTTON_STATE_VALUES.FOCUSED
    : isHovered
      ? DIVIDER_BUTTON_STATE_VALUES.HOVERED
      : DIVIDER_BUTTON_STATE_VALUES.IDLE;

  return (
    <button
      type={HTML_CONTROL_TYPES.BUTTON}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      aria-label={UI_CONTENT.TEMPLATES_DIVIDER}
      data-state={currentState}
      data-hovered={isHovered ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
      data-focused={isFocused ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE}
      data-reduced-motion={
        prefersReducedMotion ? DATA_BOOLEAN_VALUES.TRUE : DATA_BOOLEAN_VALUES.FALSE
      }
      className={`block w-full ${LAYOUT.TEMPLATES_DIVIDER} cursor-pointer rounded
                 transition-colors duration-200 hover:text-dark-300
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-primary-500/50`}
    >
      {UI_CONTENT.TEMPLATES_DIVIDER}
    </button>
  );
}

export default StartFromScratchButton;
