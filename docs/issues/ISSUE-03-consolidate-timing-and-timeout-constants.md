# Issue: Consolidate Duplicate Toast and Tooltip Timing Constants

## Metadata
- **Category**: maintainability
- **Priority**: P1
- **Affected Files**:
  - `packages/shared/src/config/ui.ts`
- **Origin**: Open Code Review (OCR) Scan Findings #12, #13, #24

## Problem Description
`packages/shared/src/config/ui.ts` defines two separate timing modules that both claim to be the centralized source of truth:

1. **`UI_TIMING`** — documents as "Centralized source of truth for UI timing magic numbers."
2. **`UI_TIMEOUTS`** — documents as "Centralized source of truth for setTimeout/interval durations used across the frontend."

Both contain overlapping entries:
- `UI_TIMING.EDITOR_FOCUS_DELAY_MS` (180ms) vs `UI_TIMEOUTS.FOCUS_DELAY` (100ms) — both claim to be the editor focus delay.
- `UI_TIMING.ARRIVAL_POP_DISPLAY_MS` (600ms) vs `UI_TIMEOUTS.READY_PULSE_MS` (600ms) — both claim to be the same animation display duration.
- `UI_TIMEOUTS.TOAST_NOTIFICATION` (1500ms) vs `TOAST_DEFAULTS.DEFAULT_DURATION_MS` (3000ms) — two conflicting toast auto-dismiss durations.
- `TOOLTIP_DEFAULTS.SHOW_DELAY_MS` (400ms) vs `UI_DEFAULTS.TOOLTIP_DELAY_MS` (500ms) — two conflicting tooltip hover delays.

Components may pick either constant, producing inconsistent toast dismiss timing and tooltip behavior across the UI.

## Proposed Solution
Merge all timing constants into a single `UI_TIMING` module with consistent `_MS` naming convention, and have `UI_TIMEOUTS`, `TOAST_DEFAULTS`, and `TOOLTIP_DEFAULTS` reference the single source of truth (or deprecate them).

## Acceptance Criteria
- [ ] Single source of truth for all timing constants.
- [ ] `TOAST_NOTIFICATION` and `TOAST_DEFAULTS.DEFAULT_DURATION_MS` resolve to the same value.
- [ ] `TOOLTIP_DEFAULTS.SHOW_DELAY_MS` and `UI_DEFAULTS.TOOLTIP_DELAY_MS` resolve to the same value.
- [ ] `EDITOR_FOCUS_DELAY_MS` and `FOCUS_DELAY` resolve to the same value.
- [ ] All consumers updated to use the merged constant.
- [ ] All tests pass.