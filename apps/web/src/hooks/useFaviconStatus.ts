import { useEffect } from "react";
import { useEditorStore } from "../store";
import { FAVICON_CONFIG, GENERATION_MESSAGES } from "../config/constants";

/**
 * Generation states mirrored by the favicon. Deriving this inside the selector
 * keeps the effect dependency to a single primitive, so the favicon only swaps
 * on genuine state transitions instead of on every streaming progress update.
 */
export type FaviconStatus = "idle" | "generating" | "complete";

function getFaviconStatus(isGenerating: boolean, generationProgress: string): FaviconStatus {
  if (isGenerating) return "generating";
  if (generationProgress === GENERATION_MESSAGES.COMPLETE) return "complete";
  return "idle";
}

/**
 * Swaps the browser-tab favicon to reflect blueprint generation state:
 * spinner arc while generating, green checkmark on completion, and the
 * original favicon otherwise. Mirrors the live document-title updates from
 * useDocumentTitle so users who switch tabs can read generation status at a
 * glance. The original favicon href is restored when the hook unmounts or
 * generation returns to idle.
 */
export function useFaviconStatus(): void {
  const status = useEditorStore((state) =>
    getFaviconStatus(state.isGenerating, state.generationProgress)
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const existing = document.querySelector<HTMLLinkElement>(FAVICON_CONFIG.LINK_SELECTOR);
    let link: HTMLLinkElement;
    let created = false;
    if (existing) {
      link = existing;
    } else {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
      created = true;
    }
    const originalHref = link.getAttribute("href") ?? FAVICON_CONFIG.DEFAULT_HREF;

    if (status === "generating") {
      link.setAttribute("href", FAVICON_CONFIG.LOADING_HREF);
    } else if (status === "complete") {
      link.setAttribute("href", FAVICON_CONFIG.COMPLETE_HREF);
    } else if (created) {
      link.setAttribute("href", FAVICON_CONFIG.DEFAULT_HREF);
    } else {
      link.setAttribute("href", originalHref);
    }

    return () => {
      if (created) {
        link.remove();
      } else {
        link.setAttribute("href", originalHref);
      }
    };
  }, [status]);
}
