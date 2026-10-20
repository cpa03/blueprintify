/**
 * ShowEditorButton - FAB button shown when editor panel is hidden.
 * Lazy-loaded to keep it out of the main bundle since it's conditionally rendered.
 *
 * Features:
 * - CSS slide-up entrance with fade-in for delightful reveal
 * - Hover scale for tactile feedback (CSS transition)
 * - Tap press for responsive feel (CSS transition)
 * - Keyboard shortcut tooltip (Ctrl/Cmd+E)
 * - Subtle pulsing glow when generated content exists but editor is hidden,
 *   drawing the user's eye back to the "show editor" action so they don't
 *   forget their blueprint is ready to view.
 *
 * Performance: Uses CSS animations instead of framer-motion to avoid
 * pulling the animation chunk into the critical path. This component
 * is shown on initial page render (when editor is hidden), so keeping
 * framer-motion out of its import tree prevents the 45 KiB animation
 * chunk from loading before user interaction.
 */
import { memo, useState, useEffect, useRef } from "react";
import {
  ANIMATION_ENTRANCE_DELAYS,
  ARIA_HIDDEN_VALUES,
  ARIA_LIVE_VALUES,
  BUTTON_TRANSITION_DEFAULTS,
  EDITOR_BUTTON_STATE_VALUES,
  ENTRANCE_STAGGER_DEFAULTS,
  ICON_PATHS,
  MODIFIER_KEYS,
  SVG_ICON_DEFAULTS,
  UI_TIMEOUTS,
  UI_TIMING,
} from "@blueprint/shared/config";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { KeyboardShortcutTooltip } from "./SmartTooltip";
import { RippleButton } from "./RippleButton";
import { BUTTON, ICON } from "../config/styles";
import {
  UI_CONTENT,
  SHORTCUT_DESCRIPTIONS,
  CSS_CLASSES,
  DOM_ELEMENT_IDS,
  EDITOR_ANNOUNCER,
} from "../config/constants";
import { KEYBOARD_SHORTCUTS } from "../config/constants/keyboard";
import { getModifierLabel, getAriaShortcutKey } from "../lib/platform";

interface ShowEditorButtonProps {
  onClick: () => void;
  /** Whether generated blueprint/tasks content exists in the editor */
  hasContent?: boolean;
  /** Whether generation is currently in progress */
  isGenerating?: boolean;
}

function ShowEditorButtonComponent({
  onClick,
  hasContent = false,
  isGenerating = false,
}: ShowEditorButtonProps): JSX.Element {
  const modifierKey = getModifierLabel();
  const prefersReducedMotion = useReducedMotion();

  const [showArrival, setShowArrival] = useState(false);
  const prevIsGenerating = useRef(isGenerating);

  useEffect(() => {
    if (prevIsGenerating.current && !isGenerating && hasContent) {
      setShowArrival(true);
      const timer = setTimeout(() => setShowArrival(false), UI_TIMING.ARRIVAL_POP_DISPLAY_MS);
      prevIsGenerating.current = isGenerating;
      return () => clearTimeout(timer);
    }
    prevIsGenerating.current = isGenerating;
  }, [isGenerating, hasContent]);

  // Timed glow: pulse is attention-seeking, not perpetual.
  // Active generation keeps the glow on. When content exists but generation is
  // idle, the glow auto-fades after GLOW_DURATION_MS to avoid distraction.
  const [showGlow, setShowGlow] = useState(false);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const clearTimer = () => {
      if (glowTimerRef.current !== null) {
        clearTimeout(glowTimerRef.current);
        glowTimerRef.current = null;
      }
    };

    if (isGenerating) {
      clearTimer();
      setShowGlow(true);
      return clearTimer;
    }

    if (hasContent) {
      setShowGlow(true);
      glowTimerRef.current = setTimeout(() => {
        setShowGlow(false);
      }, UI_TIMEOUTS.GLOW_DURATION_MS);
    } else {
      clearTimer();
      setShowGlow(false);
    }

    return clearTimer;
  }, [hasContent, isGenerating]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const buttonTitle = hasContent
    ? UI_CONTENT.EDITOR.VIEW_BLUEPRINT_BUTTON
    : UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON;

  // WCAG 2.5.3 Label in Name: the accessible name must contain the visible
  // text verbatim ("Show Editor Ctrl+E"), so mirror the kbd hint exactly.
  const ariaLabel = `${buttonTitle} ${modifierKey}+E`;

  return (
    <KeyboardShortcutTooltip
      shortcut={KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY}
      description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
      position="left"
    >
      <div
        className={`group ${prefersReducedMotion ? "" : "animate-slide-up "}will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95${showArrival ? ` ${CSS_CLASSES.ARRIVAL_POP}` : ""}`}
      >
        <RippleButton
          onClick={onClick}
          className={`${BUTTON.SHOW_EDITOR_FAB} ${showGlow ? "glow-pulse" : ""}`}
          aria-keyshortcuts={getAriaShortcutKey(
            KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY,
            MODIFIER_KEYS.CMD
          )}
          aria-label={ariaLabel}
          title={buttonTitle}
          data-editor-toggle="true"
          data-has-content={hasContent}
          data-state={
            hasContent ? EDITOR_BUTTON_STATE_VALUES.CONTENT_READY : EDITOR_BUTTON_STATE_VALUES.IDLE
          }
          data-glow-active={showGlow}
          data-is-generating={isGenerating}
          data-reduced-motion={String(prefersReducedMotion)}
          aria-expanded={false}
          aria-controls={DOM_ELEMENT_IDS.EDITOR_PANEL}
        >
          <span className="flex items-center">
            <svg
              className={`${ICON.LG} mr-2`}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.EDIT}
              />
            </svg>
            {hasContent
              ? UI_CONTENT.EDITOR.VIEW_BLUEPRINT_BUTTON
              : UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON}
            {/* Direction arrow — subtle chevron that glides right on hover,
                visually hinting that clicking reveals the editor panel from
                the right side of the layout. */}
            <svg
              className="w-4 h-4 ml-1.5 -mr-1 transition-transform motion-safe:group-hover:translate-x-0.5 opacity-60 group-hover:opacity-100"
              style={{ transitionDuration: `${BUTTON_TRANSITION_DEFAULTS.CHEVRON_DURATION_MS}ms` }}
              fill={SVG_ICON_DEFAULTS.FILL_NONE}
              stroke={SVG_ICON_DEFAULTS.STROKE_CURRENT}
              viewBox={SVG_ICON_DEFAULTS.VIEW_BOX}
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
            >
              <path
                strokeLinecap={SVG_ICON_DEFAULTS.STROKE_LINECAP_ROUND}
                strokeLinejoin={SVG_ICON_DEFAULTS.STROKE_LINEJOIN_ROUND}
                strokeWidth={SVG_ICON_DEFAULTS.STROKE_WIDTH_DEFAULT}
                d={ICON_PATHS.CHEVRON_RIGHT}
              />
            </svg>
            {isGenerating && (
              <>
                <span
                  className="ml-1.5 w-2 h-2 rounded-full bg-accent-emerald motion-safe:animate-pulse"
                  aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
                />
                <span className={CSS_CLASSES.SR_ONLY} aria-live={ARIA_LIVE_VALUES.POLITE}>
                  {EDITOR_ANNOUNCER.GENERATING_IN_BACKGROUND}
                </span>
              </>
            )}
            {hasContent && !isGenerating && (
              <span className={CSS_CLASSES.SR_ONLY} aria-live={ARIA_LIVE_VALUES.POLITE}>
                {EDITOR_ANNOUNCER.CONTENT_READY}
              </span>
            )}
            <kbd
              aria-hidden={ARIA_HIDDEN_VALUES.TRUE}
              className={`ml-2 ${CSS_CLASSES.KBD_SHORTCUT} animate-fade-in`}
              style={{
                animationDelay: `${ANIMATION_ENTRANCE_DELAYS.NEARLY_HALF}s`,
                animationFillMode: ENTRANCE_STAGGER_DEFAULTS.FILL_MODE,
              }}
            >
              {modifierKey}+E
            </kbd>
          </span>
        </RippleButton>
      </div>
    </KeyboardShortcutTooltip>
  );
}

export const ShowEditorButton = memo(ShowEditorButtonComponent);
