/**
 * @fileoverview Focus management when the starter-template block unmounts.
 *
 * Picking a starter template advances the wizard to the review step, which
 * removes the hero/template grid from the DOM. The <button> the user just
 * activated goes with it, dropping keyboard/screen-reader focus onto <body>
 * and stranding the visitor at the top of the document (WCAG 2.4.3 Focus
 * Order). This hook hands focus to the wizard panel in that situation —
 * the exact mirror of useEditorPanelFocus, which does the same for the
 * editor panel.
 *
 * Focus is only moved when it was genuinely lost (active element fell back
 * to <body>); if focus already landed somewhere meaningful — e.g. the
 * step-change handler put it on the next step's first control, or the block
 * leaves while the user is typing — it is left untouched.
 *
 * @module useTemplatesExitFocus
 */

import { useEffect, useRef, type RefObject } from "react";
import { FOCUSABLE_SELECTOR_STRING } from "../config/constants";

/**
 * Restores focus into the wizard panel once the template block has left.
 *
 * On the visible → hidden transition, defers one animation frame so the
 * block has unmounted, then — only if focus fell back to `<body>` — moves it
 * onto the first focusable control inside the panel, falling back to the
 * panel container itself (given `tabIndex={-1}`) when the wizard has not
 * finished mounting yet, so focus still has a home inside the panel.
 *
 * Initial mount is skipped: a page load that already has the block hidden
 * (restored session, deep link) must never steal focus from the top of the
 * document.
 *
 * @param templatesActive - Whether the hero/template block is still present,
 *   either visible or mid exit-animation
 * @param panelRef - Ref to the wizard panel container that receives focus
 *
 * @example
 * ```tsx
 * function App() {
 *   const wizardPanelRef = useRef<HTMLDivElement>(null);
 *   useTemplatesExitFocus(showTemplates || templatesExiting, wizardPanelRef);
 *
 *   return <div ref={wizardPanelRef} tabIndex={-1}>{/* wizard *&#47;}</div>;
 * }
 * ```
 */
export function useTemplatesExitFocus(
  templatesActive: boolean,
  panelRef: RefObject<HTMLElement | null>
): void {
  const wasActiveRef = useRef(templatesActive);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      wasActiveRef.current = templatesActive;
      return;
    }

    const wasActive = wasActiveRef.current;
    wasActiveRef.current = templatesActive;

    // Only act on a genuine visible → hidden transition.
    if (templatesActive || !wasActive) return;

    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      const focusLost = !active || active === document.body || active === document.documentElement;
      if (!focusLost) return;

      const panel = panelRef.current;
      if (!panel) return;

      const firstFocusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR_STRING);
      (firstFocusable ?? panel).focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [templatesActive, panelRef]);
}
