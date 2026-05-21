# Task Tracking

> Execution-focused task list aligned with roadmap milestones and GitHub issues.

## Organization

This file has been reorganized to improve navigability:

- **[Active Tasks](./active-tasks.md)** - Current work items and priorities
- **[Completed Tasks 2026 Q1](./completed-tasks-2026-Q1.md)** - Archived completed work from Q1 2026

## Task Lifecycle

All tasks follow the lifecycle defined in [repo-rules.md](./repo-rules.md):

1. **Open** → **In Progress** → **Review** → **Done**
2. Completed tasks are archived quarterly to `completed-tasks-YYYY-QX.md`
3. Active work is tracked in `active-tasks.md`

## References

- **Project Roadmap**: [roadmap.md](./roadmap.md)
- **Repository Rules**: [repo-rules.md](./repo-rules.md)
- **Bugs Tracking**: [bugs.md](./bugs.md)
- **Findings**: [findings.md](./findings.md)

---

## Phase 5 StorX Tasks

- [x] [CONSOLIDATE] Direct import of `HTTP_STATUS` from `@blueprint/shared` in `apps/api/src/errors.ts` to prevent circular dependencies or initialization issues.

---

## Phase 1 BugLover Findings

- [x] bug: Flaky analytics test in `apps/api/src/db/index.test.ts`
- [x] error: Unhandled rejection warnings in `apps/api/src/middleware/rateLimit.test.ts`

---

_Last Updated: 2026-05-11_
_For task lifecycle rules, see repo-rules.md_

## CMZ Phase 1 Findings

- [x] error: Hardcoded "anonymous" string in `apps/api/src/middleware/rateLimit.ts`.
- [x] error: Missing `afterAll` delay in `apps/api/src/db/index.test.ts`.
- [x] error: Slow tests in `apps/api/src/utils/timeout.test.ts`.
