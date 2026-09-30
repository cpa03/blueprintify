# Notes: Janitor Scan

## Structure Overview

- apps/api, apps/web, packages/shared, scripts, docs, functions

## Findings (2026-09-30 scan, base c4155e5e)

- janitor-scan.mjs: 127 orphan + 82 unused-export candidates — counts unchanged from prior cycle at same base
- merge-base HEAD vs origin/main = c4155e5e (0 behind) — no new main commits since last scan
- // keyword grep → 4 prose false positives (App.tsx:101/292, OfflineBanner:178, motion.test.ts:110)
- /* hits → JSX comments / route strings / JSDoc only, no dead code
- console.log (10 hits, non-test) → all intentional (Workers logger/secureLog, JSDoc examples, template output strings)
- md5sum duplicates → zero pairs
- Hygiene → 0 TODO/FIXME/HACK, 0 .only/.skip, 0 as any/ts-ignore, 0 markers, 0 temp, 0 empty dirs
- Spot-verified 10/82 exports (FIELD_LABELS 18, SHARED_ROUTE_PATHS 14, storageManager 5, ToastType 9, ViewMode 59, PREVIEW/PLAYWRIGHT barrel, generateHonoIndex registry, Container 192, APIError 23) — all live
- eslint-disables → 6 targeted, legitimate
- depcheck unavailable offline — no package.json edits
- Build green 9.40s → zero safe deletions, zero source changes
