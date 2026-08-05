# Task Plan: Janitor Cleanup — Redundant Files, Unused Exports, Commented-Out Dead Code

## Goal

Scan the blueprintify monorepo (apps/web, apps/api, packages/shared) for redundant files, unused exports, and commented-out dead code. Remove them safely while keeping all quality gates green (typecheck, lint, build, tests).

## Phases

- [ ] Phase 1: Plan and setup (branch sync, memory ingestion)
- [ ] Phase 2: Scan for commented-out dead code blocks
- [ ] Phase 3: Scan for unused exports (verify with codegraph/grep)
- [ ] Phase 4: Scan for redundant files (gitignored artifacts, log files, duplicated utils, build outputs committed)
- [ ] Phase 5: Execute removals in small verified batches
- [ ] Phase 6: Verify gates (typecheck, lint, tests, build)
- [ ] Phase 7: Report findings to docs/findings.md
- [ ] Phase 8: Commit, push, open PR

## Key Questions

1. Which files are tracked in git but should not be (logs, dist, node_modules)?
2. Which exported symbols have zero consumers?
3. Where are commented-out code blocks?
4. Are there duplicated utils across folders?

## Decisions Made

- Working branch: agent/janitor (merged with origin/main)
- Deleted dead modules: `apps/web/src/utils/logger.ts` (0 consumers), `apps/web/src/lib/storageAdapter.ts` + test (only self-test)
- Removed dead exports: `ErrorTypeSchema`, `ErrorDetailSchema`, `ErrorResponseSchema` from shared schema.ts (0 consumers)
- De-exported 5 internal-only types in storage.ts (0 external refs)
- Removed unused import in ScrollProgress.tsx (lint warning)
- Kept tested public barrel exports (useAccessibleAnimation etc.) — reported in findings instead

## Errors Encountered

- (none yet)

## Status

**Complete** - PR #3082 opened: https://github.com/cpa03/blueprintify/pull/3082. All gates green.
