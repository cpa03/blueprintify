/**
 * DOM interaction helpers.
 */

/**
 * Returns true when a keyboard event target is a text-editing surface whose
 * typed characters must never be hijacked by global keyboard shortcuts.
 *
 * Covers:
 * - `<input>` and `<textarea>` elements
 * - contenteditable regions (e.g. CodeMirror's markdown editor renders a
 *   `contenteditable` div, so checking only HTMLInputElement/HTMLTextAreaElement
 *   would miss it — typing `?` inside the editor would otherwise open the
 *   shortcuts modal and swallow the key)
 *
 * `HTMLElement.isContentEditable` reflects the nearest contenteditable
 * ancestor, so child elements inside a contenteditable region are covered too.
 * jsdom does not implement `isContentEditable` (returns undefined), so an
 * attribute-based `closest` fallback keeps the check testable in jsdom.
 */
export function isEditableField(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return true;
  }
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable === true || target.closest("[contenteditable]") !== null;
}
