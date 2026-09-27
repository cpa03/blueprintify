# Issue: Platform-Aware Keyboard Shortcut Display Labels

## Metadata
- **Category**: bug
- **Priority**: P2
- **Affected Files**:
  - `packages/shared/src/config/ui.ts`
  - `apps/web/src/components/editor/EditorHeader.tsx`
  - `apps/web/src/components/KeyboardShortcutsModal.tsx`
- **Origin**: Open Code Review (OCR) Scan Finding #23

## Problem Description
`packages/shared/src/config/ui.ts` defines `SHORTCUT_LABELS` with hardcoded "Ctrl" modifier keys:

```typescript
export const SHORTCUT_LABELS = {
  COPY: "Ctrl+C",
  EXPORT: "Ctrl+Shift+E",
  NEW_PROJECT: "Ctrl+N",
  // ...
} as const;
```

Meanwhile, the same file defines `MODIFIER_KEYS.CMD` documented as "auto-detecting ⌘ on Mac vs Ctrl elsewhere" and `KEYBOARD_SHORTCUTS.TOGGLE_EDITOR.KEY` uses the platform-aware modifier.

On macOS, users see "Ctrl+C" instead of "⌘C" — confusing for Mac users expecting Command key shortcuts.

## Current Usage
- `apps/web/src/components/editor/EditorHeader.tsx` uses `SHORTCUT_LABELS.COPY` directly.
- `apps/web/src/components/KeyboardShortcutsModal.tsx` iterates `SHORTCUT_LABELS` for display.

## Proposed Solution
Make `SHORTCUT_LABELS` a getter that resolves the modifier at render time using the platform detection already available (`MODIFIER_KEYS.CMD` / `W.CTRL`):
- Option A: Keep `SHORTCUT_LABELS` as static constants but make them template strings like `"{MOD}+C"` where `{MOD}` is replaced at runtime.
- Option B: Export a function `getShortcutLabel(key: keyof typeof SHORTCUT_LABELS)` that returns platform-appropriate label using `navigator.platform` or `navigator.userAgentData`.

## Acceptance Criteria
- [ ] On macOS, shortcuts display "⌘C", "⌘⇧E", "⌘N".
- [ ] On Windows/Linux, shortcuts display "Ctrl+C", "Ctrl+Shift+E", "Ctrl+N".
- [ ] No hardcoded "Ctrl" in displayed shortcut labels.