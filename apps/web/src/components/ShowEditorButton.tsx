/**
 * ShowEditorButton - FAB button shown when editor panel is hidden.
 * Lazy-loaded to keep it out of the main bundle since it's conditionally rendered.
 *
 * Features:
 * - CSS slide-up entrance with fade-in for delightful reveal
 * - Hover scale for tactile feedback (CSS transition)
 * - Tap press for responsive feel (CSS transition)
 * - Keyboard shortcut tooltip (Ctrl/Cmd+E)
 *
 * Performance: Uses CSS animations instead of framer-motion to avoid
 * pulling the animation chunk into the critical path. This component
 * is shown on initial page render (when editor is hidden), so keeping
 * framer-motion out of its import tree prevents the 45 KiB animation
 * chunk from loading before user interaction.
 */
import { useMemo, memo } from "react";
import { KeyboardShortcutTooltip } from "./SmartTooltip";
import { RippleButton } from "./RippleButton";
import { BUTTON, ICON } from "../config/styles";
import { UI_CONTENT } from "../config/constants";

interface ShowEditorButtonProps {
  onClick: () => void;
}

function ShowEditorButtonComponent({ onClick }: ShowEditorButtonProps): JSX.Element {
  const modifierKey = useMemo(() => {
    const isMac =
      typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    return isMac ? "\u2318" : "Ctrl";
  }, []);

  return (
    <KeyboardShortcutTooltip shortcut="e" description="Toggle editor" position="left">
      <div className="animate-slide-up will-change-transform motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-105 motion-safe:active:scale-95">
        <RippleButton
          onClick={onClick}
          className={BUTTON.SHOW_EDITOR_FAB}
          ariaLabel={UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON}
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
            {UI_CONTENT.EDITOR.SHOW_EDITOR_BUTTON}
            <kbd
              className="ml-2 px-1.5 py-0.5 bg-dark-700/80 rounded text-[11px] font-mono text-dark-200 border border-dark-600/50 shadow-inner leading-none"
              aria-hidden="true"
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
