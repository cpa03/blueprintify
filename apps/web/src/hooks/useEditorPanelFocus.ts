/**
 * @fileoverview Focus management for the editor side panel.
 *
 * The "Show Editor" FAB unmounts the moment the panel opens, which drops
 * keyboard/screen-reader focus onto <body> and strands the user mid-page.
 * This hook mirrors the existing hide-path restoration in App.tsx (which
 * refocuses the FAB after the panel closes) so focus has a sensible home in
 * both directions (WCAG 2.4.3 Focus Order).
 *
 * Focus is only moved when it was actually lost (active element fell back to
 * <body>); if the user was typing in the wizard when the panel opened — e.g.
 * via Ctrl/Cmd+E or the auto-open on generation start — their focus is left
 * untouched so the shortcut never yanks the caret out of an input.
 *
 * @module useEditorPanelFocus
 */

import { useEffect, useRef } from "react";
import { DOM_ELEMENT_IDS } from "../config/constants";

/**
 * Keeps focus sensible when the editor panel opens.
 *
 * On the closed → open transition, defers one animation frame (so the panel
 * has committed to the DOM, matching the hide-path's requestAnimationFrame
 * pattern) and, if focus was lost to `<body>`, moves it onto the panel
 * container. The panel is given `tabIndex={-1}` so it can receive focus
 * without entering the tab order; the next Tab then lands on the first
 * control inside the panel.
 *
 * Initial mount is skipped: a session restored with the panel already open
 * must not steal focus from the top of the page on load.
 *
 * @param isOpen - Whether the editor panel is currently shown
 *
 * @example
 * ```tsx
 * function App() {
 *   const [showEditor, setShowEditor] = useState(false);
 *   useEditorPanelFocus(showEditor);
 *
 *   return showEditor ? (
 *     <div id="editor-panel" role="region" aria-label="Editor panel" tabIndex={-1}>
 *       {/* editor content *&#47;}
 *     </div>
 *   ) : null;
 * }
 * ```
 */
export function useEditorPanelFocus(isOpen: boolean): void {
  const wasOpenRef = useRef(isOpen);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      wasOpenRef.current = isOpen;
      return;
    }

    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    // Only act on a genuine closed → open transition.
    if (!isOpen || wasOpen) return;

    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const focusLost = !active || active === document.body;
      if (!focusLost) return;

      document.getElementById(DOM_ELEMENT_IDS.EDITOR_PANEL)?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);
}
