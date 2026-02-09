import { useEffect } from "react";
import { DOCUMENT_TITLE_CONFIG } from "../config/constants";

export function useDocumentTitle(title: string) {
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
