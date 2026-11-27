# Notes: Janitor Dead-Code Scan (disabled)

## Context

- Branch: `agent/janitor`; `git fetch` + checkout + `git merge origin/main --no-edit` → clean, 0 conflict markers.
- Request ends with bare `disabled` → standing precedent: **read-only scan + report, 0 deletions**.
- Subagent spawns hard-fail (`ProviderModelNotFoundError: kimi-for-coding/kimi-for-coding-highspeed`) — known standing item; all probes run directly via bash.

## Scan Results

| Category                                        | Raw hits      | Genuine                                             |
| ----------------------------------------------- | ------------- | --------------------------------------------------- |
| Commented-out dead code                         | 60+ `//` runs | **0** (all prose/JSDoc)                             |
| Code-shaped `//` / `// import` / non-JSDoc `/*` | 0             | **0**                                               |
| TODO/FIXME/debugger/.only/@ts-ignore            | 0             | **0**                                               |
| Unused exports (733 enumerated)                 | 3             | **0** (2 return-type keeps + 1 template-literal FP) |
| Test-only exports                               | 72            | legit — would break tests                           |
| Orphan files (355 census)                       | 4             | **0** (2 ambient `.d.ts` + 2 Pages routing entries) |
| Duplicate-by-hash                               | 1 group       | intentional dual Pages proxy KEEP                   |
| console.log non-test                            | 12            | all legitimate                                      |
| Tracked temp artifacts                          | 1             | `notes.md` → structural flag                        |

### Verified FPs

- `OnlineStatus` / `PasteTruncationResult` — declared return types of live exported hooks.
- `RootLayout` — inside `generateNextLayout()` backtick string.
- `global.d.ts` / `react-jsx-global.d.ts` — ambient, tsconfig-included.
- dual `[[path]].ts` — byte-identical, Pages root undeterminable.

### Prior enabled-cycle removals still held

`GenerationResultSchema` 0 · `ImportResultSchema` 0 · `ShortcutModifier` not exported.

## Structural Flag (NEW)

`.gitignore:114-116` ignores transient `task_plan.md`, but `notes.md` (same transient class per all 28 agent defs) is **tracked** with stale placeholder. Recommend `notes.md` → `.gitignore` + `git rm --cached` on an **enabled** cycle.

## Verify

typecheck ✅ · lint ✅ exit 0 · build ✅ 12.07s · tailwindcss 3.4.19 = lockfile pin.

## Deliverable

Report appended to `docs/findings.md` (newest-first). **0 code deletions.**
