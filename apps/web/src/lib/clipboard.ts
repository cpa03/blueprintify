import { EXPORT_CONFIG } from "../config/constants";

/**
 * Copies text to clipboard with fallback for older browsers.
 *
 * The fallback path renders an off-screen, read-only textarea that is
 * hidden from assistive technology and never steals focus, so legacy
 * copy does not cause a scroll jump, mobile keyboard popup, or
 * screen-reader announcement. DOM cleanup is guaranteed via try/finally.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.tabIndex = -1;
    if (typeof textarea.setAttribute === "function") {
      textarea.setAttribute("aria-hidden", "true");
      textarea.setAttribute("readonly", "");
      textarea.setAttribute("tabindex", "-1");
    }
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = `${EXPORT_CONFIG.COPY_TEXTAREA_OFFSET}px`;
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    try {
      textarea.select();
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Normalizes line endings and trims whitespace for IDE compatibility
 */
export function formatForIDE(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
