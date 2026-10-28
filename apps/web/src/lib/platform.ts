/**
 * Platform detection utilities
 *
 * Flexy says: No duplicated navigator.platform checks across components!
 * Single source of truth for platform-specific logic.
 * Flexy says: No inlined "cmd" | "ctrl" | "alt" | "none" unions where
 * MODIFIER_KEYS already owns the four-value enum!
 */
import { MODIFIER_KEYS } from "@blueprint/shared";

/** Derived modifier union — single source is MODIFIER_KEYS, never an inlined literal union. */
export type ShortcutModifier = (typeof MODIFIER_KEYS)[keyof typeof MODIFIER_KEYS];

/**
 * Detect if the current browser is running on macOS.
 * Uses navigator.platform which is widely supported and reliable.
 * SSR-safe: returns false when navigator is not defined.
 *
 * @returns true if the platform is macOS, false otherwise
 *
 * @example
 * ```typescript
 * import { isMacOS } from "../lib/platform";
 * const modifier = isMacOS() ? "⌘" : "Ctrl";
 * ```
 */
export function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Get the platform-appropriate modifier key label.
 *
 * @returns "⌘" on macOS, "Ctrl" on other platforms
 *
 * @example
 * ```typescript
 * import { getModifierLabel } from "../lib/platform";
 * const shortcut = `${getModifierLabel()} + S`;
 * ```
 */
export function getModifierLabel(): string {
  return isMacOS() ? "\u2318" : "Ctrl";
}

/**
 * Get the platform-appropriate alt key label.
 *
 * @returns "⌥" on macOS, "Alt" on other platforms
 *
 * @example
 * ```typescript
 * import { getAltKeyLabel } from "../lib/platform";
 * const shortcut = `${getModifierLabel()} + ${getAltKeyLabel()} + X`;
 * ```
 */
export function getAltKeyLabel(): string {
  return isMacOS() ? "\u2325" : "Alt";
}

/**
 * Format a keyboard shortcut with the appropriate platform modifier key.
 *
 * @param shortcut - The key name (e.g., "k", "s", "e")
 * @param modifier - Optional. The modifier group:
 *   - "cmd": auto-detect ⌘ (Mac) or Ctrl (others)
 *   - "ctrl": always use Ctrl (cross-platform consistency)
 *   - "alt": auto-detect ⌥ (Mac) or Alt (others)
 *   - "none": no modifier (raw shortcut)
 * @returns Formatted shortcut string (e.g., "⌘ + K" on macOS, "Ctrl + K" on others)
 *
 * @example
 * ```typescript
 * import { formatShortcut } from "../lib/platform";
 * formatShortcut("k")        // "⌘ + K" on Mac, "Ctrl + K" on others
 * formatShortcut("k", "alt")  // "⌥ + K" on Mac, "Alt + K" on others
 * formatShortcut("k", "ctrl") // "Ctrl + K" (always)
 * formatShortcut("Home", "none") // "Home"
 * ```
 */

/**
 * Get the platform-appropriate modifier key for aria-keyshortcuts attribute.
 * WAI-ARIA spec uses "Control", "Meta", "Alt", "Shift" as modifier values.
 *
 * @returns "Meta" on macOS, "Control" on other platforms
 *
 * @example
 * ```typescript
 * import { getAriaModifier } from "../lib/platform";
 * // On Mac: "Meta", on Windows/Linux: "Control"
 * const shortcut = `${getAriaModifier()}+E`;
 * ```
 */
function getAriaModifier(): string {
  return isMacOS() ? "Meta" : "Control";
}

/**
 * Format a keyboard shortcut for the aria-keyshortcuts attribute.
 * Produces WAI-ARIA compliant key sequences.
 *
 * @param key - The primary key (e.g., "e", "Escape", "1", "?")
 * @param modifier - Optional modifier type:
 *   - "cmd": auto-detect Meta (Mac) or Control (others)
 *   - "ctrl": always use Control
 *   - "alt": always use Alt
 *   - "none": no modifier (default)
 * @returns aria-keyshortcuts value (e.g., "Meta+e", "Control+1", "Escape")
 *
 * @example
 * ```typescript
 * import { getAriaShortcutKey } from "../lib/platform";
 * getAriaShortcutKey("e")          // "Control+e" or "Meta+e"
 * getAriaShortcutKey("e", "cmd")   // "Control+e" or "Meta+e"
 * getAriaShortcutKey("1", "ctrl")  // "Control+1"
 * getAriaShortcutKey("Escape", "none") // "Escape"
 * getAriaShortcutKey("?")          // "?"
 * ```
 */
export function getAriaShortcutKey(
  key: string,
  modifier: ShortcutModifier = MODIFIER_KEYS.NONE
): string {
  if (modifier === MODIFIER_KEYS.NONE) return key;
  const prefix =
    modifier === MODIFIER_KEYS.ALT
      ? "Alt"
      : modifier === MODIFIER_KEYS.CTRL
        ? "Control"
        : getAriaModifier();
  return `${prefix}+${key}`;
}
export function formatShortcut(
  shortcut: string,
  modifier: ShortcutModifier = MODIFIER_KEYS.CMD
): string {
  if (modifier === MODIFIER_KEYS.NONE) return shortcut;
  const prefix =
    modifier === MODIFIER_KEYS.ALT
      ? getAltKeyLabel()
      : modifier === MODIFIER_KEYS.CTRL
        ? "Ctrl"
        : getModifierLabel();
  return `${prefix} + ${shortcut.toUpperCase()}`;
}
