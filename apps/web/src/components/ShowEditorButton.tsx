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
import { UI_TIMING, ANIMATION_ENTRANCE_DELAYS, ENTRANCE_STAGGER_DEFAULTS } from "@blueprint/shared";
import { KeyboardShortcutTooltip } from "./SmartTooltip";
import { RippleButton } from "./RippleButton";
import { BUTTON, ICON } from "../config/styles";
import { UI_CONTENT, SHORTCUT_DESCRIPTIONS } from "../config/constants";
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

  const buttonTitle = hasContent
    ? UI_CONTENT.EDITOR.VIEW_BLUEPRINT_BUTTON
    : UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON;

  return (
    <KeyboardShortcutTooltip
      shortcut="e"
      description={SHORTCUT_DESCRIPTIONS.TOGGLE_EDITOR}
      position="left"
    >
      <div
        className={`group animate-slide-up will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95${showArrival ? " arrival-pop" : ""}`}
      >
        <RippleButton
          onClick={onClick}
          className={`${BUTTON.SHOW_EDITOR_FAB} ${hasContent || isGenerating ? "glow-pulse" : ""}`}
          aria-keyshortcuts={getAriaShortcutKey("e", "cmd")}
          title={buttonTitle}
        >
          <span className="flex items-center">
            <svg
              className={`${ICON.LG} mr-2`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {hasContent
              ? UI_CONTENT.EDITOR.VIEW_BLUEPRINT_BUTTON
              : UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON}
            {/* Direction arrow — subtle chevron that glides right on hover,
                visually hinting that clicking reveals the editor panel from
                the right side of the layout. */}
            <svg
              className="w-4 h-4 ml-1.5 -mr-1 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 opacity-60 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {isGenerating && (
              <span
                className="ml-1.5 w-2 h-2 rounded-full bg-accent-emerald motion-safe:animate-pulse"
                aria-hidden="true"
              />
            )}
            <kbd
              className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-[11px] font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none animate-fade-in"
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
