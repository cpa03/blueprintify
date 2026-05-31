# Task Plan: Flexy Iteration 7 - Eliminate Remaining Hardcoded Values

## Goal

Eliminate all remaining hardcoded values and magic numbers across the codebase, fix 2 fatal type errors, and make everything reference shared config.

## Phases

- [x] Phase 0: Codebase analysis (complete)
- [ ] Phase 1: Fix 2 fatal type errors (authorize.ts, share.test.ts)
- [ ] Phase 2: Replace hardcoded `1024 * 1024` with `BYTE_CONVERSION.MB`
- [ ] Phase 3: Replace hardcoded Playwright config with shared `PLAYWRIGHT_DEFAULTS`
- [ ] Phase 4: Replace hardcoded test URLs/ports with shared `DEV_DEFAULTS`
- [ ] Phase 5: Replace hardcoded `1024` threshold in vite.config.ts with `BYTE_CONVERSION.KB`
- [ ] Phase 6: Replace hardcoded magic numbers in stream.test.ts with shared config
- [ ] Phase 7: Run full verification (typecheck + lint + test:all)
- [ ] Phase 8: Create PR

## Key Files Touched

1. `apps/api/src/middleware/authorize.ts` - Fix type error
2. `apps/api/src/routes/share.test.ts` - Fix type error
3. `apps/api/src/config/constants.ts` - Use BYTE_CONVERSION.MB
4. `apps/web/src/lib/security.ts` - Use BYTE_CONVERSION.MB
5. `apps/web/vite.config.ts` - Use BYTE_CONVERSION.KB
6. `apps/web/playwright.config.ts` - Use PLAYWRIGHT_DEFAULTS from shared
7. `apps/web/src/lib/api.test.ts` - Use DEV_DEFAULTS for URL
8. `apps/api/src/utils/stream.test.ts` - Use shared config

## Errors Encountered

- authorize.ts TS7053: user.role can't index Record<UserRole, number>
- share.test.ts TS2769: c.set("user") not in context variables

## Status

## Verification Results

- typecheck ✅ clean (fixed 2 fatal type errors)
- lint ✅ zero warnings
- build ✅ clean
- test:all ✅ 977 passing (558 web + 299 api + 120 shared)

## Status

**✅ COMPLETED - All phases done**
