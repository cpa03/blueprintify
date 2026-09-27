# Issue: Automated Design Token Synchronization (CSS Variables, theme.ts, tailwind.config.js)

## Metadata
- **Category**: maintainability
- **Priority**: P1
- **Affected Files**:
  - `apps/web/src/index.css`
  - `apps/web/src/config/theme.ts`
  - `apps/web/tailwind.config.js`
- **Origin**: Open Code Review (OCR) Scan Finding #1, #4

## Problem Description
The color palette and animation design tokens are defined in three separate files that must be manually synchronized:
1. `apps/web/src/index.css` (`:root` CSS custom properties) — CSS runtime source of truth.
2. `apps/web/src/config/theme.ts` (`COLORS` export) — TypeScript/JavaScript source of truth.
3. `apps/web/tailwind.config.js` (`theme.extend.colors`) — Tailwind utility generator source of truth.

A prominent comment in `index.css` notes:
> "When changing a color value, update ALL THREE files. The index.css values take precedence in CSS, theme.ts values in JS/TS code, and tailwind.config.js values in Tailwind utility classes."

However, there is no automated validation (e.g. CI check, Vitest test, or code generator) enforcing that all tokens remain in parity. This previously caused a critical bug where `--color-dark-400` through `--color-dark-950` were declared in `theme.ts` and `tailwind.config.js` but omitted from `index.css`, silently breaking `color-mix()` computations for skeletons and borders.

## Proposed Solution
1. **Option A (Generator)**: Define tokens in a single JSON/TypeScript schema (e.g. `packages/shared/src/tokens/colors.json`) and generate `index.css` `:root` variables, `theme.ts` `COLORS`, and `tailwind.config.js` automatically during build.
2. **Option B (CI Contract Test)**: Create a Vitest test in `apps/web/src/config/tokens-sync.test.ts` that parses `index.css` `:root` properties and asserts 1:1 parity with `theme.ts` `COLORS` and `tailwind.config.js`.

## Acceptance Criteria
- [ ] Automated CI check fails if a color token is added to `theme.ts` or `tailwind.config.js` without corresponding `:root` declaration in `index.css`.
- [ ] Hex values across all three sources match exactly.
