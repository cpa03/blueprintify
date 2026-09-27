# Issue: Tailwind Content Scanning Skips Shared Workspace Packages

## Metadata
- **Category**: bug
- **Priority**: P2
- **Affected Files**:
  - `apps/web/tailwind.config.js`
- **Origin**: Open Code Review (OCR) Scan Finding #45

## Problem Description
The `content` array in `apps/web/tailwind.config.js` only scans the web app's own source:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
```

However, this is an npm-workspace monorepo. Tailwind utility classes can be referenced from:
- `packages/shared/src/**/*` — shared components/config that import `@blueprint/shared`
- Any component using class strings assembled across packages

Because these workspace package paths are not scanned, Tailwind's JIT compiler will **purge** any utility class that only exists in a shared package file, causing missing styles in production builds when shared code is bundled.

## Current Evidence
- `apps/web/src/styles/markdown.css` uses custom tokens like `dark-700`, `primary-400`, `emerald-400` — these are only scanned today because the css file lives in `src/`.
- Any future shared UI component that uses `@apply` or template class strings would silently lose styling.

## Proposed Solution
Add monorepo package paths to the content array:
```js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "../../packages/shared/src/**/*.{js,ts,jsx,tsx}",
],
```

## Acceptance Criteria
- [ ] Utility classes referenced only in `packages/shared/src` appear in the production CSS output.
- [ ] Build output size check: no accidental inclusion of all shared source (verify glob is narrow enough).
- [ ] `npm run build` passes for `apps/web`.