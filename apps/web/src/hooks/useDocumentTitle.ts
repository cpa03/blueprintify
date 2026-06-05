import { useEffect } from "react";
import { DOCUMENT_TITLE_CONFIG } from "../config/constants";

/**
 * Hook for managing the document title
 *
 * Sets the document title with the app name appended. Restores the original
 * title when the component unmounts.
 *
 * @param title - The title to set (appended with app name)
 *
 * @example
 * ```tsx
 * useDocumentTitle("My Project"); // Sets "My Project | Blueprintify"
 * ```
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title
      ? `${title}${DOCUMENT_TITLE_CONFIG.SEPARATOR}${DOCUMENT_TITLE_CONFIG.APP_NAME}`
      : DOCUMENT_TITLE_CONFIG.DEFAULT_TITLE;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
