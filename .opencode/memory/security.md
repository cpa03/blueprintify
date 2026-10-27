# Security Patterns & Conventions

## Policies

- OWASP Top 10 mitigation.
- Zero Trust Architecture.
- Constant-time comparison for all secret/token validation.
- CI/CD security: Standardized runner versions (`ubuntu-24.04-arm`) and action versions across all workflows.
- Regular security audits (monthly recommended).

## Current Security Status (2026-08-08)

| Control             | Status                                                |
| ------------------- | ----------------------------------------------------- |
| Hardcoded Secrets   | ✅ None found                                         |
| XSS Vectors         | ✅ No dangerouslySetInnerHTML                         |
| Code Injection      | ✅ No eval/innerHTML                                  |
| Input Validation    | ✅ Zod schemas                                        |
| Auth Timing Attacks | ✅ Constant-time compare                              |
| Secure Random       | ✅ crypto.getRandomValues()                           |
| Security Headers    | ✅ Hono secureHeaders()                               |
| Secure Logging      | ✅ Sensitive data redaction                           |
| CSP object-src      | ✅ Added 'none' for plugin attack prevention          |
| HTML Sanitization   | ✅ DOMPurify configured (SVG/math blocked)            |
| Rate Limiting       | ✅ Cloudflare rate limiter                            |
| CI Runner           | ✅ All workflows use ubuntu-24.04-arm                 |
| CI Actions          | ✅ All workflows use actions/checkout@v7              |
| npm audit           | ✅ **0 vulnerabilities** — Clean (openai 7.4.0)       |
| Deprecated API usage| ✅ max_tokens → max_completion_tokens (openai v7)    |
| .dev.vars gitignore  | ✅ Added to prevent credential commits               |

## Lessons Learned

### 2026-10-26: Security Engineer Audit — Changed-files scan (11-file diff vs origin/main: BUG-058 gates + stub removal + audit docs), 0 introduced issues

- **Finding**: `git diff --name-only origin/main` = 11 files (BUG-058 hardening `scan-secrets.mjs` +21/-2, `validate-wrangler.mjs` +381, root `package.json` +`validate:secrets`, `env.test.ts` +21, shared `config.test.ts` +103, `.env.example` placeholder rewrite; `bug.md`/`task.md` already `git rm`'d on this branch by the prior 8a17529a cycle; audit docs `findings.md`/`security.md`; plus package.json/lockfile). **0 introduced vulnerabilities, secrets, or deprecated usage** — the code diff IS the BUG-058 hardening; nothing to remove. An initial `--name-only` call transiently reported only the 5 package files; re-verify against `--stat`/`--name-status` before scoping. **Apparent `@vitest/coverage-v8` root removal = STALENESS, not introduction**: merge-base `a3aea891` and HEAD both lack the root pin; `origin/main` gained it via #3900 (`169c9f34`, merged while this branch was 2-behind) to fix `test:coverage`'s `ERR_MODULE_NOT_FOUND` — the two-dot diff renders main's addition as a branch-side deletion. Resolution: keep BOTH (`validate:secrets` + main's `coverage-v8@4.1.12`), take main's lockfile wholesale.
- **Verification**: code-path added-lines real-secret regex **0x** (sole hits = detection-pattern definitions, comments, `# VITE_API_KEY=` empty placeholder, synthetic test fixture `operator-supplied-key`) · full-file secret regex on all 6 changed code files **0x** · injection/unsafe added-lines **0x** (sole `execFileSync` = static local bin + argv array `["secret","list",...envArgs]`, `stdio:["ignore","pipe","pipe"]`, no `shell:true`, no user input) · deprecated **0x** · `scan:secrets` ✅ 357 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = 4 moderate + 4 high, **advisory-URL + vulnerable-package sets programmatically IDENTICAL to `origin/main`**, `NEW IN HEAD: (none)` — all pre-existing dev-only zod/chromium-bidi/puppeteer/@cloudflare/vitest-plugin + tailwindcss chains) · `validate:wrangler` ✅ (API_KEY not in `[vars]` across both configs) · `validate:secrets` **fails closed exit 1** without `CLOUDFLARE_API_TOKEN` (both envs reported unverified, never silent-pass) · typecheck ✅ exit 0 (shared/api/web) · web `env.test.ts` 22/22 · shared `config.test.ts` 949/949 · eslint changed TS files 0 errors · coverage-v8 staleness resolved by merge keeping main's `4.1.12` root pin (#3900's `test:coverage` fix) + our `validate:secrets`, lockfile taken from main.
- **Lesson**: When a `--name-only` snapshot disagrees with a subsequent `--stat`, trust neither until re-run — filesystem/git state can be briefly inconsistent mid-command; the authoritative scope is `--name-status` after a clean fetch. **A dep line that appears "removed" by the branch must be checked against merge-base before being called a removal**: if merge-base AND HEAD both lack it and only `origin/main` has it, the two-dot diff is rendering main's *addition* as a deletion (the inverse of the usual stale-downgrade shape) — resolve forward by keeping both sides' lines, never by deleting main's fix. `validate:secrets` fail-closed behavior must be exercised (expect exit 1 + explicit "NOT verified" wording) rather than assumed from code review alone.
### 2026-10-26: Security Engineer Audit — Working-branch changed-files scan vs origin/main (10-file post-merge diff), 0 introduced issues

- **Finding**: Task "Scan the changed files in this PR (git diff --name-only origin/main)" run on `agent/security-engineer` after merging `origin/main` (`f65ffbd2`, janitor #3907). Post-merge two-dot diff = **10 files**, all the branch's own standing posture: `.opencode/memory/security.md` (audit history), `apps/web/.env.example` (clarifies `VITE_API_KEY` is public-by-construction), `apps/web/src/config/env.test.ts` (BUG-058 regression tests), root `bug.md` + `task.md` (**deleted** — the standing prompt-injection-stub fix, `8a17529a`), `docs/findings.md` (audit history), root `package.json` (+`validate:secrets` script), `packages/shared/src/config.test.ts` (BUG-058 structural no-key-material tests), `scripts/scan-secrets.mjs` (dropped `wrangler.toml` exemption + added hardcoded auth-header pattern), `scripts/validate-wrangler.mjs` (+API_KEY-in-[vars] offline gate + opt-in `--check-secrets` provisioned check). **0 introduced vulnerabilities, 0 secrets, 0 deprecated usage — nothing to remove.**
- **Verification**: added-lines strict secret regex across all **717 added lines** → **0 non-FP** (1 "URL embedded credentials" = findings.md prose about the pattern itself; 4 high-entropy candidates = branch-name strings in prose, none in code); no `.env`/`.dev.vars`/pem/key/wrangler files added (only `.env.example`, placeholder-only, edit removes the fill-in value) · `scan:secrets` ✅ **357 files** (−1 = the two removed stubs) · **dependency vulns: 0 introduced** — `npm run audit --omit=dev --audit-level=high` ✅ 0; full audit = standing held **8** (4 moderate + 4 high, dev-only zod/chromium-bidi/puppeteer/@cloudflare/vitest-plugin + tailwindchain), identical to `origin/main`, **no package-lock in diff → zero new CVE surface** · deprecated/dangerous scan: 9 hits (`ReactDOM.render`/`dangerouslySetInnerHTML`/`innerHTML=`) all **prose in `docs/findings.md`** (prior audit text), code-only grep **0**; sole `child_process` = `execFileSync` static-bin + static-argv array, **no shell, no user input** · typecheck ✅ (shared/api/web) · eslint changed source ✅ · `validate:wrangler` ✅ (new `checkApiKeyNotDeclaredInVars` confirms `API_KEY` not in `[vars]` across both configs) · targeted tests ✅ 971/971 · full suite ✅ **2,967/2,967** (web 1,383 + api 555 + shared 1,029). Merge: 1 conflict (`docs/findings.md`, dual-history append-only) resolved keeping both (main's Janitor 10-26 first, branch's prior Security 10-26 second), 0 residual markers.
- **Lesson**: **A "scan this PR's changed files" task on the security working branch usually re-audits the branch's own standing hardening, not a foreign PR** — the two-dot `git diff origin/main` after merging main lists the branch's entire carried posture (BUG-058 gates/tests/docs + stub removals), so the correct output is "0 introduced, nothing removed" plus a findings entry, *not* a re-fix of files that are already the fix. Confirm this by checking whether the deletions in the diff (`bug.md`/`task.md` −5 each) are the branch's own prior security commits (`git log --oneline origin/main..HEAD -- <path>` shows `8a17529a`) — if so they are the posture, not a regression. Corollary on doc-conflict resolution for append-only audit files: when main has landed a *newer* cycle entry (here Janitor 10-26 #3907) since this branch's last entry (Security 10-26 on the #3906 audit), the correct order is **main's newer entry first, then the branch's own entry** — matching the file's newest-first prepend convention — and the exact-line marker strip (`^<<<<<<<`/`^=======$`/`^>>>>>>>`) must leave **zero** residual markers verified by grep before commit.
### 2026-10-26: Security Audit — Dependabot production-dependencies bump PR (3-file diff vs origin/main: openai/framer-motion/zustand), 0 introduced issues

- **Finding**: `git diff --name-only origin/main` → 3 files, +28/−24: `apps/api/package.json` (openai 7.34.0 → 7.43.0), `apps/web/package.json` (framer-motion 14.3.0 → 14.6.0, zustand 5.0.15 → 5.0.16), `package-lock.json` (+transitive motion-dom 14.3.0 → 14.6.0, motion-utils 14.1.1 → 14.6.0). All 5 version moves **forward-only**. Introduces 0 vulnerabilities, 0 secrets, 0 deprecated-API usage — nothing to remove.
- **Verification**: added-lines (28) strict secret regex 0x · injection/XSS 0x · deprecated-API 0x (openai call sites already use `max_completion_tokens`, correct for v7; framer-motion imports use modern `framer-motion/m` + `AnimatePresence`, unchanged surface in 14.6) · full-file grep on all 3 changed files 0x · **lockfile: all 5 entries resolved to `https://registry.npmjs.org/` with sha512 integrity present** · `npm ls openai framer-motion zustand motion-dom motion-utils` matches lockfile exactly · openai 7.43.0 adds optional peer `google-auth-library >=9.15.1 <11` — **not installed** (`npm ls google-auth-library` → empty), zero new dependency surface · `npm audit --omit=dev` ✅ 0 vulns · full audit 8 (4 moderate + 4 high) = pre-existing tailwindcss/postcss + zod/chromium-bidi/puppeteer dev-chain, **byte-identical count on origin/main worktree baseline (0 prod / 8 full) → zero CVEs introduced** · `scan:secrets` ✅ 356 files · typecheck ✅ exit 0 (shared/api/web) · API tests ✅ 555/555 (35 files) · web tests ✅ 1,381/1,381 (92 files) · rebuilt gitignored dists (shared + web) → 0 stale-version hits for 7.34.0/14.3.0/5.0.15 · no trust-boundary stubs (`task.md`/`bug.md`/`blueprint.md`) or env/secret files in diff.
- **Lesson**: **A package.json/lockfile diff inverts the CVE-surface check** — instead of proving "no manifest in diff ⇒ zero new CVE surface" (docs-only PRs), the proof becomes a *baseline audit comparison*: run `npm audit --omit=dev` + full `npm audit` on a clean `origin/main` worktree and diff the counts against the PR branch. Identical counts (0 prod / 8 full both sides) is the one-command proof that no advisory was introduced or regressed. Also verify lockfile hygiene mechanically: every changed `resolved` must be `registry.npmjs.org` and every entry must carry `integrity` — a bumped package whose new peerDependencies list an optional dep must be checked with `npm ls` to confirm the optional was not pulled in (openai → google-auth-library: not installed here, zero surface). Forward-only direction for *transitive* motion-* pins matters as much as the direct bumps — a coordinated family bump (motion-dom/motion-utils to 14.6.0) is the expected shape; a lagging sibling pin would be the regression smell.

### 2026-10-26: Security Engineer Audit — vitest coverage-pin + StartFromScratchButton micro-UX PR (#3906, 9-file diff vs origin/main), 1 introduced issue REMOVED

- **Finding**: PR branch `agent-15211324288563375084` head `45fe3c51`, 1 commit, **1-ahead/0-behind** `origin/main` at audit time (merge-base `3785fe54` == `origin/main` → the two-dot `git diff --name-only origin/main` 9-file list was the true introduced surface, nothing to discount). **1 introduced vulnerability: the PR re-added root `bug.md` + `task.md`** — policy-banned stubs already deleted from main 4× (#313, #3762, #3799, `3a7a9734`). Root `task.md` is trusted prompt input for the 6-hourly `ai-software-company` workflow: the **QA** step (`"Review PR berdasarkan task.md & blueprint.md…"`) and **Knowledge Steward** step (`"Review konsistensi blueprint.md, roadmap.md, task.md…"`) both run `opencode-run.sh` with `GITHUB_TOKEN` + `IFLOW_API_KEY` in step env and `contents/pull-requests/issues: write` permissions → PR-controlled file content becomes agent instructions with secrets in scope (prompt-injection → exfiltration class). Both removed via `git rm`. **The PR merged to main as `a3aea891` (#3906) during the audit, so the stubs reached the default branch; `agent/security-engineer` merged that main and re-applied the removal there.**
- **Verification**: added-lines secret regex **0x** (82 added lines incl. lockfile; no high-entropy outside `integrity`; no creds in `resolved` URLs; no `.env`/key/wrangler files) · `scan:secrets` ✅ 356 files · **dependency vulns: 0 introduced** — `npm audit --package-lock-only` PR vs `origin/main` advisory-URL sets compared programmatically → `IDENTICAL: true`, `NEW IN PR: (none)` (both = the standing held 8: 4 moderate + 4 high, dev-only zod/chromium-bidi/puppeteer/@cloudflare/vitest-plugin + tailwindcss chains); repo gate `npm run audit --omit=dev --audit-level=high` ✅ 0 · lockfile delta is vitest-family **upgrades + removals only** (`coverage-v8`/`pretty-format`/`utils` 4.1.11→4.1.12, mismatched `@vitest/ui@5.0.5` tree removed) — **no downgrades, no new packages** · deprecated/injection grep **0x** on all changed files · eslint changed files ✅ 0 · typecheck ✅ exit 0 (shared/api/web) · `StartFromScratchButton.test.tsx` ✅ 3/3 · `validate:models` ✅ 56 agent files · working-branch sync: merged `origin/main` `a3aea891`, 2 conflicts (`findings.md`, `security.md`) resolved keeping both histories, 0 residual markers.
- **Lesson**: **A PR's `--name-only` list must be checked for *policy-banned paths*, not just for secret/CVE patterns** — the dangerous file here contained no secret and no CVE; it was dangerous purely because of *where* it sits (repo root) and *who reads it* (scheduled CI agents with tokens in env). Keep a standing denylist in head: root `task.md`/`bug.md`/`blueprint.md` (now 5× reintroduced counting this one), plus any `.env*`/`.dev.vars*`/`wrangler*.toml`. Second corollary: **diff-scope math first** — `git rev-list --left-right --count HEAD...origin/main` (here `1 0`) tells you in one command whether the two-dot list is trustworthy or needs three-dot/staleness discounting, before any file is touched. Third: when a dependency diff appears, compare *advisory URL sets* between head and base rather than raw counts — identical counts can hide a swapped advisory, and only set-equality proves "0 introduced". Fourth: **a PR can merge while you audit it** — re-check `git fetch origin main` + `git merge-base --is-ancestor <pr-head> origin/main` immediately before delivering, because if the PR landed, the fix must be re-applied on a branch cut from the *new* main rather than pushed to a deleted PR branch.

### 2026-10-25: Security Audit — useTemplatesExitFocus a11y focus-restore PR (4-file diff vs origin/main, 0-behind/1-ahead), 0 introduced issues

- **Finding**: `git diff --name-only origin/main` → 4 files, +230/-1, all in `apps/web/src`: `App.tsx` (+18/-1, adds `wizardPanelRef` + `tabIndex={-1}` on the wizard panel div and wires the hook), `hooks/index.ts` (+1 barrel export), new `hooks/useTemplatesExitFocus.ts` (84 lines) and its new `useTemplatesExitFocus.test.ts` (128 lines, 6 tests). The hook restores keyboard/screen-reader focus into the wizard panel when the starter-template block unmounts (WCAG 2.4.3 Focus Order). Introduces 0 vulnerabilities, 0 secrets, 0 deprecated-API usage — nothing to remove.
- **Verification**: added-lines (230) strict secret regex 0x (AWS/GitHub/OpenAI/Anthropic/Slack/Google/JWT/npm/GitLab/SendGrid tokens, PEM blocks, `password|secret|api_key|token` assignments) · injection/XSS/dangerous 0x (`dangerouslySetInnerHTML`/`innerHTML`/`eval`/`new Function`/`document.write`/`javascript:`/`<script>`/`on*=`/`Math.random`/`localStorage.setItem`) · deprecated-API 0x (`navigator.platform`/`substr`/`keyCode`/`UNSAFE_*`/`ReactDOM.render`/`max_tokens`) · lint-suppression/`any`/`console`/TODO 0x · full-file grep on all 4 changed files 0x · **no `package.json`/lockfile in diff → lockfile byte-identical to origin/main → zero new CVE surface** · root trust-boundary stubs not reintroduced (0x) · `scan:secrets` ✅ 356 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = pre-existing zod/chromium-bidi/puppeteer dev-chain) · typecheck ✅ exit 0 (shared/api/web) · eslint changed files ✅ exit 0 · prettier changed files ✅ · new hook tests ✅ 6/6 · full web suite ✅ 1,381/1,381 (92 files).
- **Focus sink reviewed as the PR's only async surface — safe**: the `requestAnimationFrame` callback satisfies all three checks from the ErrorFallback audit: (1) `cancelAnimationFrame` returned from the effect cleanup, so no post-unmount focus and no leak; (2) it re-reads `document.activeElement` *at fire time* and bails unless idle (`null`/`body`/`documentElement`), so a user who has already started navigating is never interrupted; (3) the target is scoped with `panel.querySelector(FOCUSABLE_SELECTOR_STRING)` — and that selector is a module-level `const` built from a static array in `config/constants/accessibility.ts:128`, so there is no CSS-selector injection path and no way to focus outside the app's own panel. `tabIndex={-1}` on the panel is the standard programmatic-focus pattern (removes it from the tab order, does not add a new tab stop). No user input reaches any sink.
- **Lesson**: **A focus-*restore* hook is the mirror image of a focus-*delay* hook and needs the same three-part audit** — cleanup, fire-time state re-validation, and target scoping — because both are deferred callbacks that mutate `document.activeElement`. The distinguishing question is not "does it move focus" (all of them do) but "can an attacker choose *where* focus lands or *when*": here the target is a static selector over the app's own panel and the trigger is a single app-controlled boolean, so the answer is no. Corollary worth keeping: when a hook's selector comes from `config/constants`, confirm it is a literal array joined at module load rather than anything derived from props/env — that one grep (`FOCUSABLE_SELECTOR_STRING` → `accessibility.ts:128`) closes the injection question. Report-only nit recorded, not fixed: `.focus()` is called without `{ preventScroll: true }`, which is a scroll/UX preference, not a security issue.

### 2026-10-25: Security Audit — RepoKeeper Cycle 25 doc-sync PR (4-file docs-only diff vs origin/main, 0-behind/1-ahead), 0 introduced issues

- **Finding**: `git diff --name-only origin/main` → 4 modified `.md` files only (`CHANGELOG.md` +2/−1, `docs/findings.md` +8, `docs/bugs.md` +1/−1, `docs/knowledge-review.md` +3/−3; 14 added lines, 0 added/deleted files, 0 code files) — a RepoKeeper hygiene + doc-sync record (footer re-sync to the live 2,958 header, DOC-004 re-count 1,055 → 1,056, Last Review/Last Updated refreshes, cycle-25 findings + changelog entries). Introduces 0 vulnerabilities, 0 secrets, 0 deprecated-API usage — nothing to remove.
- **Verification**: added-lines (14) strict secret regex 0x (AWS/GitHub/OpenAI/Anthropic/Slack/Google/JWT/npm/GitLab/SendGrid tokens, PEM blocks, URL creds) · key=value secret assignments 0x · markdown injection 0x (raw `<script>`/`<iframe>`/`javascript:`/`on*=` handlers) · token-bearing URLs 0x · deprecated-API 0x · `scan:secrets` ✅ 354 files · `npm audit --omit=dev` ✅ 0 vulns · **no `package.json`/lockfile in diff → lockfile byte-identical to origin/main → zero new CVE surface** · root trust-boundary stubs (`task.md`/`bug.md`/`blueprint.md`) not reintroduced (0x) · no test asserts on `CHANGELOG` content (grep `*test*` → 0 files) so the doc edits cannot shift any gate.
- **Lesson**: **Cycle-24's own defect was a partial sync** — the header was re-measured to 2,958 but the footer left narrating 2,953, i.e. *internal* doc inconsistency (two live claims in one file disagreeing) is a drift class separate from doc-vs-code drift. Added to the checklist: when touching a file with both a header metric and a `Last Updated` footer that *narrates* that metric, sync both in the same edit or the next cycle finds a contradiction that no external measurement flags (both numbers were checked against tests separately and only the cross-reference failed).

### 2026-10-25: Security Audit — RepoKeeper Cycle 24 doc-sync PR (4-file docs-only diff vs origin/main, 0-behind/1-ahead), 0 introduced issues

- **Finding**: `git diff --name-only origin/main` → 4 modified `.md` files only (`CHANGELOG.md` +1, `docs/bugs.md` +2, `docs/findings.md` +7, `docs/knowledge-review.md` +4; 14 added lines, 0 added/deleted files, 0 code files) — a RepoKeeper hygiene + doc-sync record (test-count re-sync 2,942 → 2,953, scan:secrets 352 → 354, DOC-004 re-count, footers). Introduces 0 vulnerabilities, 0 secrets, 0 deprecated-API usage — nothing to remove.
- **Verification**: added-lines (14) strict secret regex 0x (AWS/GitHub/OpenAI/Anthropic/Slack/Google/JWT/npm/GitLab/SendGrid tokens, PEM blocks, URL creds) · key=value secret assignments 0x · high-entropy base64/hex blobs 0x · markdown injection 0x (raw `<script>`/`<iframe>`/`javascript:`/`on*=` handlers) · token-bearing URLs 0x · deprecated-API 0x · full-file grep on all 4 changed files secret/XSS 0x (sole deprecated hits = pre-existing historical audit prose in `findings.md` describing past findings, none in added lines) · `scan:secrets` ✅ 354 files · `npm audit --omit=dev` ✅ 0 vulns · **no `package.json`/lockfile in diff → lockfile byte-identical to origin/main → zero new CVE surface** · root trust-boundary stubs (`task.md`/`bug.md`/`blueprint.md`) not reintroduced (0x).
- **Lesson**: **Docs-only diffs still get the full added-lines scan** — a "docs-only" PR can still smuggle a secret (paste of a `.dev.vars` line into a changelog), an injection vector (raw HTML in markdown rendered by a non-sanitizing viewer), or a trust-boundary file (root `task.md`), so the scan battery runs unchanged and only the code-specific checks (typecheck/eslint/tests) are skipped. Cheap corollary that settles the CVE question in one command: `git diff --name-only origin/main | grep -E '(package(-lock)?\.json|.*\.lock)'` — no manifest/lockfile in the diff means the full-audit count can never be "introduced" by the PR, so `npm audit --omit=dev` is confirmation, not discovery. Also: grep hits for deprecated names inside `docs/findings.md`/`security.md` are almost always *prose about* past findings — always re-check whether the match lands in the PR's added lines before classifying it as introduced.

### 2026-10-25: Security Audit — ErrorFallback recovery-focus PR (commit 3db2bed6; 3-file true diff vs origin/main, 0-behind/1-ahead), 0 introduced issues

- **Finding**: PR adds a mount-time focus effect to `ErrorFallback.tsx` (`recoveryButtonRef` + `recoveryFocusDelayMs` derived from `STAGGER_CONFIG.ERROR_FALLBACK` + `ANIMATION.NORMAL`), 4 fake-timer tests, and `active-tasks.md` prose — introduces 0 vulnerabilities, secrets, or deprecated usage. Focus effect audited as a **focus-hijack surface**: single `setTimeout` with `clearTimeout` cleanup (no leak / no post-unmount focus), re-checks `document.activeElement` at fire time and bails unless idle (`null`/`body`/`documentElement`) so an actively navigating user is never interrupted, `focus({ preventScroll: true })` is standard; delay math is bounded 580–780ms from static config (no NaN path), pure functions, no user input.
- **Verification**: added-lines (122) secret/injection/deprecated/lint-suppression/`any`/`console` 0x (sole `.focus()` grep hit = false positive — standard API) · full-file grep changed files 0x · docs added-lines 0x · `scan:secrets` ✅ 351 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = pre-existing tailwindcss/postcss/puppeteer dev-chain; **lockfile byte-identical to origin/main → zero new CVE surface**) · typecheck ✅ (shared/api/web) · eslint changed files ✅ · `ErrorFallback.test.tsx` 22/22 · full web suite ✅ 1,360/1,360 (89 files).
- **Lesson**: **Deferred `setTimeout` callbacks that touch focus/DOM are a reviewable security surface, not just UX** — audit them like any async sink: (1) is the timer cleared on unmount/dep-change, (2) does the callback re-validate state *at fire time* (here: `document.activeElement` idle check) rather than trusting mount-time state, (3) is the delay bounded by static config. A focus effect that only fires when focus is idle is the safe pattern — it cannot steal focus from a user who has already started navigating. Also: when the PR branch is the checked-out branch and the remote `agent/security-engineer` has diverged (force-push prohibited), harden **in place on the PR branch** so the fix ships with the PR — record the deviation in `task_plan.md` instead of forcing a branch switch that would drop the PR's changes.

### 2026-10-25: Security Audit — EditorHeader micro-UX + platform-aware shortcut labels PR (commit f9e1477a; 5-file true diff vs origin/main, 0-behind), 1 introduced issue REMOVED

- **Finding**: PR's new `getPlatformShortcutLabel()` in `packages/shared/src/config/ui.ts` had a **default parameter** doing inline platform detection via deprecated `navigator.platform` (`/Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent)`). Deprecated per MDN (modern: `navigator.userAgentData.platform` + UA fallback). It also duplicated the check `apps/web/src/lib/platform.ts` exists to centralize ("No duplicated navigator.platform checks across components!") and was dead code — the sole call site (`KeyboardShortcutsModal.tsx:129`) already passed `isMacOS()` explicitly. **Fix**: made `isMac: boolean` required (removed default) — deprecated usage gone, duplicate detection gone, zero behavior change. Rest of diff clean: `EditorHeader.tsx` static-string `data-*` attrs from typed props/`DATA_BOOLEAN_VALUES` (React-escaped, no user input), `KeyboardShortcutsModal` label swap output-identical, `index.ts` export, `active-tasks.md` prose.
- **Verification**: added-lines deprecated scan 1x pre-fix (`navigator.platform`) → 0x post-fix · secrets/injection 0x · full-file grep changed files 0x · `scan:secrets` ✅ 351 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = pre-existing dev-chain; no package.json/lockfile in PR → zero new CVE surface) · typecheck ✅ (shared/api/web) · eslint changed files ✅ · shared 1,020/1,020 · web 1,356/1,356 · gitignored dists rebuilt (`packages/shared/dist` + `apps/web/dist`) — removed `Mac|iPod|iPhone|iPad` default pattern 0x in both post-rebuild; remaining web-dist `navigator.platform` hits = pre-existing `isMacOS()` + CodeMirror internals (on origin/main, out of scope).
- **Lesson**: **A default parameter is still shipped code** — a "harmless" auto-detect default in a shared util introduces deprecated-API surface even when every current call site passes the value explicitly (dead-by-default ≠ dead). When a repo already has a canonical helper for a platform/env check (`isMacOS()`), the secure pattern is to make the shared function *require* the caller to inject it: shared stays pure/testable, detection stays in one place, and no deprecated API leaks into new code. Also: grep the *rebuilt* dist for the exact removed pattern (not just `navigator.platform`, which legitimately remains from pre-existing sources) to prove the stale-bundle regression is gone.

### 2026-10-22: Security Engineer Audit — StepStack reduced-motion/DOM-state-tracking PR (`5e1816ea`, 7-file two-dot → 3-file true diff), 0 introduced issues

- **Finding**: PR branch `agent-2093391464201612509`, 1 commit on merge-base `e4bfb697` while `origin/main` = `4b74e18c` (2 behind: #3853 header link fix + #3854 Run 112 doc). Two-dot `git diff --name-only origin/main` = 7 files; three-dot true introduced surface = **3 files** (`StepStack.tsx` +22/-7 pre-existing `useReducedMotion()` import + `whileHover`/`whileTap`/entrance gating + static-string `data-reduced-motion`/`data-can-proceed` + numeric `data-selected-count`/`data-min-required` set via React DOM property API → no HTML sink; `StepStack.test.tsx` adds `layout: _l` framer-motion mock prop-strip + one attribute test with pinned literals; `active-tasks.md` +6 prose) = 0 vulnerabilities, secrets, or deprecated usage — nothing to remove. The other 4 files (`Header.tsx`/`Header.test.tsx`/audits README/Run 112) proven pure staleness: `git diff <merge-base> <pr-head> -- <those paths>` empty (PR never touched them).
- **Verification**: Added-lines secret/injection-XSS/deprecated 0x · full-file scans of the 3 PR-head files 0x · no package/lock/env/wrangler in diff → zero new CVE surface (`npm audit --omit=dev --audit-level=high` ✅ 0; full 10 = 5 moderate + 5 high pre-existing dev-only `braces`/`postcss-selector-parser`/`@vitest/mocker`, lockfile byte-identical to origin/main, root package.json differs only by standing +1 `validate:secrets`) · `scan:secrets` ✅ 348 files (re-run with PR files applied) · `validate:wrangler` ✅ exit 0; `validate:secrets` blocked only by missing `CLOUDFLARE_API_TOKEN` (reproduces with PR files restored → environmental, PR touches 0 wrangler/env files) · typecheck ✅ exit 0 shared+api+web **with PR files applied** · eslint changed files ✅ 0 errors · `StepStack.test.tsx` ✅ 20/20 against PR file versions · tree restored (`git checkout HEAD -- <3 files>`), post-restore diff = standing 8 files, 0 modified.
- **Lesson**: **Two-dot vs three-dot scope capture must happen before touching any branch** — capture `git diff --name-only origin/main` AND `git diff origin/main...<pr-head>` (three-dot) plus `git log <merge-base>..<pr-head>` in the same breath; the stale files can then be *proven* PR-untouched with `git diff <merge-base> <pr-head> -- <stale paths>` (empty = staleness, non-empty = PR-side edit) instead of assumed. Proving staleness also proves merge safety: GitHub's merge will keep main's #3853/#3854 content because the PR side has no conflicting edit — but the PR should still rebase so its own `diff origin/main` stops reporting 4 phantom files. Environmental gate failures (`validate:secrets` needing `CLOUDFLARE_API_TOKEN`) must be reproduced on the *restored* tree before blaming the PR — same error with PR files out = env, not introduction.

### 2026-10-22: Security Engineer Audit — GLOW_STATE_VALUES / saved-glow tracking PR (`6f663caf`, 3-file diff vs origin/main), 0 introduced issues

- **Finding**: PR head `origin/agent-14559412615675127417` = 1 commit, 3 `M` files only (`LastSavedIndicator.tsx` +4, `LastSavedIndicator.test.tsx` +13/-1, `packages/shared/src/config/ui.ts` +14), 0 adds/deletes, 0 mode changes, no root `.md` stubs, no package/lock/env/wrangler files → introduces 0 vulnerabilities, secrets, or deprecated usage — nothing to remove. The sole new DOM surface is the static-string `data-saved-glow={showSavedGlow ? GLOW_STATE_VALUES.ACTIVE : GLOW_STATE_VALUES.IDLE}` (both arms `as const` shared literals → no attacker-controlled input reaches a DOM sink); `showSavedGlow` state + `UI_TIMEOUTS.SAVED_GLOW_MS` timer pre-exist on main, so the PR only *observes* existing state.
- **Verification**: Added-lines secret/injection-XSS/deprecated 0x · full-file secret scan of the 3 changed files 0x (sole repo `innerHTML` hit in the PR = read-only test assertion) · no `.env`/`.dev.vars`/pem/key/wrangler in diff · **no package.json/lockfile in PR → zero new CVE surface** (`npm audit --omit=dev --audit-level=high` ✅ 0; full 10 = 5 moderate + 5 high pre-existing dev-only tailwindcss + vitest chains, lockfile byte-identical to origin/main) · `scan:secrets` ✅ 346 files · `validate:wrangler` ✅ exit 0 (`API_KEY` not in `[vars]`) · typecheck ✅ exit 0 (shared + web **with the PR files applied**) · eslint changed files ✅ 0 errors · PR tests `LastSavedIndicator.test.tsx` 15/15 + shared `config.test.ts` 871/871. Working-branch sync first: merged `origin/main` (`aa25c8eb`), 2 conflicts (`findings.md`, `security.md`) resolved keeping both histories, 0 residual markers; post-merge branch diff = standing 8 BUG-058/doc files, re-scanned clean.
- **Lesson**: **Run the PR's own typecheck/tests against the PR's file versions, not the branch's** — a security branch does not carry the PR commit, so verifying "the changed files" requires temporarily `git checkout <pr-head> -- <files>` (or a worktree), running typecheck/lint/tests, then `git checkout HEAD -- <files>` to restore; asserting cleanliness on the branch's stale copy proves nothing about the PR. Reconfirmed the standing oracle caveat: a `data-*` assertion written with the same shared constant the component renders (`data-saved-glow === GLOW_STATE_VALUES.ACTIVE`) cannot detect drift — flag report-only and recommend pinning the literal, per #3712/PageScrollProgressBar/AnimatedNumber precedent. Also: `packages/shared/src/index.ts` re-exports config constants by *explicit* name list, so a JSDoc "Usage: from `@blueprint/shared`" line on a `config/ui.ts` constant is wrong unless the root barrel is updated — only the `@blueprint/shared/config` subpath works.

### 2026-10-20: Security Engineer Audit — Changed-files scan (8 files), merge-conflict resolution (12 conflicts), 0 introduced issues

- **Finding**: Post-merge 8-file diff vs origin/main (BUG-058 gates + audit docs) introduces 0 vulnerabilities, secrets, or deprecated usage. Merge of origin/main (40+ commits: a11y #3806/#3811/#3823, deps #3815/#3816/#3818, repokeeper cycles 5–9, BroCula Runs 97–104) hit 12 conflicts — all branch-behind-main staleness or dual-history docs: web package/lock (framer-motion 14.1.0→14.3.0 + dompurify/react/dev group), HeadingAnchor (branch conditional tabIndex reverted main's always-Tab-reachable WCAG fix), LastSavedIndicator (branch reduced-motion superseded by main's persistent-live-region superset), Toast (branch attrs already in main), 4 docs stale to Oct 18–19 state, root package.json kept BOTH (`validate:secrets` + main's `validate:models`/`validate:all`), findings.md + security.md kept both histories (0 residual markers).
- **Verification**: Added-lines real-secret 0x · fallback 0x in code · XSS/injection 0x (sole `execFileSync` = safe argv-array, no shell) · deprecated 0x · `scan:secrets` ✅ 344 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 pre-existing tailwind dev-chain, lockfile byte-identical to main) · `validate:wrangler` ✅ · typecheck ✅ (shared/api/web) · env 22/22 · config 847/847.
- **Lesson**: When both sides add the same doc entry (e.g. StepTransition in active-tasks.md), git three-way merge auto-unions identical additions without conflict — only the non-overlapping hunks conflict. For LastSavedIndicator-class files where main's fix is a strict superset of the branch's older fix of the same feature, `git checkout origin/main -- <file>` is lossless; verify with `grep` that main contains the branch's distinctive markers (e.g. `shouldReduceMotion ? { opacity: 0 }`) before checkout.

### 2026-10-21: Security Audit — StepInfo reduced-motion/state-tracking PR (commit 4d1728b0; 5-file true diff after origin/main sync), 1 introduced issue REMOVED

- **Finding**: PR reintroduced root `bug.md` + `task.md` — deleted from `main` by policy 3× (#313, #3762, #3799; RepoKeeper cycles 5–12 assert "no re-introduction"). Security relevance: root `task.md` is **trusted prompt input for scheduled CI agents** — `.github/workflows/main.yml` QA (`"Review PR berdasarkan task.md & blueprint.md…"`) and Knowledge Steward (`"Review konsistensi blueprint.md, roadmap.md, task.md…"`) steps export `GITHUB_TOKEN` (contents/pull-requests/issues: write) + `IFLOW_API_KEY` into the agent process on the 6-hourly cron, so a PR-supplied root `task.md` merged to main = untrusted-content → agent-prompt injection with secrets in scope. `task.md` is also the product's own output name (`EDITOR_FILENAMES.TASKS`). Both files `git rm`'d in the audit commit. Remaining diff (`StepInfo.tsx` boolean-derived `data-reduced-motion`/`data-can-proceed` static strings, test-only framer-motion mock prop-stripping, `active-tasks.md` prose) = 0 vulnerabilities / secrets / deprecated usage — nothing else to remove.
- **Verification**: Added-lines secret/injection/deprecated 0x (code + docs) · full-file grep on changed files 0x · `scan:secrets` ✅ 344 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = 5 high + 3 moderate pre-existing tailwindcss dev-chain, **no package.json/lockfile in PR → zero new CVE surface**) · web typecheck ✅ exit 0 · eslint changed files ✅ exit 0 · `StepInfo.test.tsx` ✅ 60/60 · `useReducedMotion` hook present and clean.
- **Lesson**: **Diff hygiene first**: a two-dot `git diff origin/main` on a behind branch shows stale reversions of main's commits as apparent "changes" — merge `origin/main` before scoping the audit, or the real introduced surface (here 5 of 10 files) is misreported. **Repo-root `.md` filenames are CI trust boundaries**: never treat a reintroduced root `task.md`/`bug.md`/`blueprint.md` as mere hygiene when workflow prompts reference those bare paths with secrets in step env — classify as injection surface and remove. Standing recommendation logged in `docs/findings.md`: point every agent prompt at `docs/`-prefixed paths (architect step already does) and/or fail the workflow if root stubs exist.

### 2026-10-19: Security Engineer Audit — AnimatedNumber counter-state + reduced-motion DOM tracking (commit 14698ce2 5-file diff vs origin/main), 0 introduced issues

- **Finding**: 5-file diff vs origin/main (`AnimatedNumber.tsx` +7/-2 connects `useReducedMotion` + static-string `data-reduced-motion` + `COUNTER_STATE_VALUES` literal replacement; `AnimatedNumber.test.tsx` +4/-2 shared-constant assertions; `ui.ts` +14 shared constant; `index.ts` +1 export; `active-tasks.md` +6 prose) introduces 0 vulnerabilities, secrets, or deprecated usage — nothing to remove.
- **Verification**: Added-lines secret/injection/deprecated 0x (code + docs) · full-file grep on changed source 0x · `scan:secrets` ✅ 339 files · `npm audit --omit=dev` ✅ 0 vulns (full 8 = 5 high + 3 moderate pre-existing tailwindcss dev-chain `braces`/`chokidar`/`micromatch`/`fast-glob` + `postcss-selector-parser`, lockfile byte-identical to origin/main → not introduced) · shared + web typecheck ✅ · eslint changed files ✅ · AnimatedNumber tests 10/10 · `COUNTER_STATE_VALUES` export + gitignored `dist` build verified · `useReducedMotion` hook present and clean.
- **Lesson**: A DOM-contract assertion written with the same shared constant the component uses (`data-state === COUNTER_STATE_VALUES.IDLE`) cannot detect drift — both sides move together; #3712's review fixed the identical PageScrollProgressBar pattern by pinning the literal in the test and guarding the constant instead. Flag report-only when auditing: literal-replacement refactors are security-neutral but silently weaken the test oracle. Also confirmed again: identical lockfile to origin/main ⇒ the full-audit count (8) can never be "introduced" by the PR — diff `package.json`/`package-lock.json` names first to settle the CVE-surface question before deep-diving audit output.

### 2026-10-13: Security Engineer Audit — Dependabot vitest/ui 5.0.3 PR scan + merge sync (150→8 files)

- **Finding**: Invoking PR (3 files: `@vitest/ui` ^4.1.11→^5.0.3) introduces 0 vulnerabilities, secrets, or deprecated usage — nothing to remove. Apparent hono/openai/react-syntax-highlighter backward moves = stale-behind-main (merge-base 8644f65f predates ff59018d), not introduced; PR needs rebase (dependabot's job). Merge of origin/main had 6 conflicts; packages + stale docs resolved forward to main, findings kept both sides; post-merge diff 150→8 files (BUG-058 gates + audit docs only).
- **Verification**: Added-lines secret/injection/deprecated 0x; lockfile URLs registry.npmjs.org + 10x sha512 CLEAN; `scan:secrets` ✅ 337 files; `npm audit --omit=dev` ✅ 0 vulns (full 8 pre-existing dev-only braces + postcss-selector-parser tailwind chain); `max_completion_tokens` intact, 0x `max_tokens`; `validate:wrangler` ✅; typecheck ✅.
- **Lesson**: On a dependabot PR branch, always compute merge-base before triaging apparent downgrades — a diff showing older versions than main with zero branch-side edits since merge-base is staleness, not introduction. For findings.md merge conflicts, strip only exact-line markers (`^<<<<<<< HEAD$`, `^=======$`, `^>>>>>>> origin/main$`) to keep both audit histories; prose mentions of markers mid-line must be preserved.

### 2026-10-07: Security Engineer Audit — Changed-files scan (16→8 files), stale-reversion remediation

- **Finding**: 16-file diff mixed BUG-058 hardening (0 introduced issues) with 8 stale reversions of main's newer commits (merge-base 7dcfe59f predates #3715/#3716/#3724/#3727): focus-ring removal, act() unwrapping, reduced-motion deletion, audit-docs rollback. Restored all 8 forward from origin/main; final diff = 8 files, zero dep moves.
- **Verification**: Added-lines real-secret 0x; fallback 0x in code; execFileSync safe argv-array; `scan:secrets` ✅ 338 files; `npm audit --omit=dev` ✅ 0 vulns (full 15 all pre-existing, lockfile zero-diff — newly disclosed shell-quote critical + sharp high need override bumps, deferred per no-churn); `validate:wrangler` ✅; typecheck ✅; shared 801/801; web env 22/22.
- **Lesson**: Never run `git stash` + `git checkout -- <file>` mid-audit without a re-verification pass — the sequence silently dropped the `validate:secrets` script from worktree+index. Always re-grep the intended addition (`grep validate package.json`) and re-check `git diff origin/main --stat` after any tree manipulation before committing. Stale-file detection shortcut: if `git diff origin/main` shows DELETIONS of content committed to main after your merge-base (`git log --oneline origin/main -- <file>`), it's staleness — restore forward, don't review it as an intentional change.

### 2026-10-05: Security Engineer Audit — Dependabot vitest/ui 5.0.3 PR + stale-downgrade remediation

- **Finding**: Invoking PR (`origin/main..origin/dependabot/npm_and_yarn/vitest/ui-5.0.2`: `@vitest/ui` ^4.1.11→^5.0.3, lock +51/-22) introduces 0 vulnerabilities, secrets, or deprecated usage — forward-only dev-only bump, nothing to remove. Working branch carried stale downgrades (`hono` 4.13.12→4.13.9, `openai` 7.27.0→7.23.0; merge-base predates main's #3722 prod-deps bump) — restored forward from `origin/main`; final diff = 8 files, zero dep moves.
- **Verification**: Dependabot added-lines secret/injection/deprecated 0x; code-only secret value 0x; hardcoded fallback 0x; sole `execFileSync` = safe argv-array; `scan:secrets` ✅ 338 files; `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing dev-only braces GHSA-vfj7-8cjw-p6xm, identical on main); `validate:wrangler` ✅; typecheck ✅; shared 801/801; web env 22/22.
- **Structural flags (report-only)**: `ui@5.0.3` peer-requires vitest 5 while runner stays 4.1.11 → lone-UI-major peer warning, coordinated 5.x bump left to dependabot; full-audit 5 high braces chain pre-existing dev-only, risk accepted.
- **Lesson**: After checking out a new branch away from the PR branch, `git diff --name-only origin/main` changes meaning — capture the invoking PR's range (`origin/main..<pr-head>`) before switching, and audit both the PR scope and the working-branch scope explicitly.

### 2026-10-05: Security Engineer Audit — Changed-files scan, stale-downgrade remediation (12→8 files)

- **Finding**: 12-file diff vs origin/main mixed BUG-058 hardening (gates + tests + docs, 0 introduced issues) with stale backward version moves in 4 package files (eslint/wrangler/vite/jsdom/etc. behind main). Restored the 4 files forward from origin/main, re-applying only the `validate:secrets` script to root package.json. Final diff = 8 files, zero dep moves.
- **Verification**: Added-lines real-secret 0x; hardcoded fallback 0x; XSS/injection 0x (execFileSync safe argv pattern); deprecated 0x; `scan:secrets` ✅ 338 files; `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing braces GHSA-vfj7-8cjw-p6xm, identical on main); typecheck ✅; shared 801/801; web env 22/22.
- **Lesson**: When a hardening branch sits behind main, `git diff origin/main` shows package files moving *backward* — this is staleness, not introduction. Fix with `git checkout origin/main -- <package files>` then surgically re-apply only the intended addition (e.g. a new npm script); never hand-edit versions forward.

### 2026-10-05: Security Engineer Audit — 27-file changed-files scan vs origin/main, 0 introduced issues

- **Finding**: 27-file diff IS hardening + cleanup (BUG-058 gates: scan-secrets drops wrangler.toml exemption + adds auth-header-literal pattern, validate-wrangler +381 API_KEY-in-[vars] gate + --check-secrets, validate:secrets script, fail-closed regression tests asserting booleans; shared-constant removals + StepReview simplification). Nothing to remove.
- **Verification**: Code-only added secret 0x; full-file secret/XSS 0x; sole execFileSync = safe argv-array pattern (no shell, static bin, no user input); `scan:secrets` ✅ 338 files; `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing braces GHSA-vfj7-8cjw-p6xm, no fix, zero dep moves → not introduced); typecheck ✅; shared 796/796; web env 22/22. Invoking dependabot prod-deps PR (hono/openai/framer-motion) forward-only.
- **Lesson**: When `git merge` fails on missing identity in a non-interactive env, use `git -c user.name=… -c user.email=…` inline flags (no config change) — the merge then succeeds; docs-only conflicts resolve by keeping both entries in date order, and the code diff must still be re-scanned afterward since main can silently reintroduce removed secrets.

### 2026-10-04: Security Engineer Audit — PageScrollProgressBar reduced-motion DOM tracking (commit c50ff06 3-file diff vs origin/main; PR head 5 files incl. audit records), 0 introduced issues

- **Finding**: 3-file diff vs origin/main (`PageScrollProgressBar.tsx` +1 `data-reduced-motion` attr, test mock prop-stripping + shared-constant import, `active-tasks.md` prose) introduces 0 vulnerabilities, secrets, or deprecated usage — nothing to remove.
- **Verification**: Added-lines secret/injection/deprecated 0x; full-file secret/XSS 0x; `scan:secrets` ✅ 337 files; `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing braces GHSA-vfj7-8cjw-p6xm, no fix, no package change → not introduced); web typecheck ✅; PageScrollProgressBar tests 11/11 (incl. reduced-motion true-branch).
- **Lesson**: Framer-motion mock prop-stripping (`initial`/`animate`/`transition`/etc.) is a test-only jsdom hygiene pattern — it keeps test-DOM assertions focused on real attributes; shipped code is unaffected (framer-motion handles real DOM nodes itself). When reviewing motion-component tests, verify the mock strips non-DOM props rather than spreading them into the jsdom div.

### 2026-10-03: Security Engineer Audit — Merge doc-sync (6 files) + dependabot vitest/ui 5.0.3 (2 files), 0 introduced issues

- **Finding**: Both scopes clean — merge is docs/type-shaping only (`.dev.vars.example` URL fix, `.env.example` placeholder, `types.ts` optional cold-start/NODE_ENV + `BACKGROUND_QUEUE?`, 3 orphan-script wires); vitest/ui PR is forward-only dev-only bump (lock hoists ui/utils/pretty-format to 5.0.3, registry URLs intact, 0 install scripts). No introduced vulnerabilities, secrets, or deprecated usage — nothing to remove.
- **Verification**: Added-lines secret/injection/deprecated 0 real hits both scopes · hardcoded fallback 0x · fail-closed intact both sides · `scan:secrets` ✅ 337 files · `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing dev-only braces chain, no fix) · `validate:wrangler` ✅ · typecheck ✅.
- **Structural flags (report-only)**: vitest 4.1.11 runner + ui 5.0.3 peer mismatch (lone-UI-major; coordinated 5.x bump left to dependabot) · full-audit braces chain pre-existing on main.
- **Lesson**: When the invoking PR lives on another branch, audit it explicitly via `git diff origin/main..origin/<pr-branch>` from `agent/security-engineer` — `git diff --name-only origin/main` alone only shows the security branch's own (post-merge, empty) diff. Merge conflicts in `docs/findings.md` resolve by keeping both audit blocks.

### 2026-10-02: Security Engineer Audit — Changed-files scan vs origin/main (16 files), 0 introduced issues

- **Finding**: 16-file diff IS the hardening (CWE-532 x-api-key log redaction, BUG-053 consumed-body fix, hardcoded `blueprintify-public-access-2026` removal fail-closed). No introduced vulnerabilities, secrets, or deprecated usage.
- **Verification**: Added-lines secret regex 0x, PR-head source grep 0x, deprecated/unsafe 0x, npm audit 0 vulns (full + prod), XSS vectors 0x, Zod + constantTimeCompare intact.
- **Structural flag (report-only)**: `tailwind.config.js` simplification drops load-bearing `packages/shared/src` scan (TOAST_STYLES/CHAR_COUNTER_COLORS still interpolated at runtime) → JIT purge risk. Functional, not security — flagged in docs/findings.md, no rewrite.
- **Lesson**: Removal-only `package.json` changes (e.g. dropping `fast-glob`) reduce attack surface and need no CVE action; tailwind content-glob narrowing should be cross-checked against shared literal class sources before merge.

### 2026-10-02: Security Engineer Audit — Changed-Files Scan re-verification (6 files)

- **Finding**: `git diff --name-only origin/main` (wrangler prod+staging `API_KEY` → secret-put comments, `PUBLIC_ACCESS_KEY` removed, `env.ts` fail-closed, test asserts absence) introduces 0 vulnerabilities, secrets, or deprecated usage — the diff IS the hardening.
- **Verification**: code-only added secret 0x · injection/XSS/deprecated 0x (sole `Math.random` = pre-existing JSDoc `core.ts:90`) · `scan:secrets` ✅ 335 files · `npm audit` ✅ 0 vulns (full + prod) · `validate:wrangler` ✅ · typecheck ✅ · shared 869/869 · api 535/535 · fail-closed both sides re-confirmed · stale gitignored dists rebuilt → 0 hits.
- **Lesson**: Gitignored `dist/` regresses to the old fallback on every cycle until rebuilt — always rebuild shared + web dists and re-grep after any secret-removal verification, even when source is clean.

### 2026-10-02: Security Engineer Audit — Changed-Files Scan post-merge re-verification (6 files)

- **Finding**: After `git merge origin/main` (5244a98b doc-sync), the 6-file diff vs `origin/main` still introduces 0 vulnerabilities, secrets, or deprecated usage — the diff IS the hardening (wrangler prod+staging `API_KEY` → secret-put comments, `PUBLIC_ACCESS_KEY` removed, `env.ts` fail-closed, test asserts absence).
- **Merge gate**: `docs/findings.md` conflicted (HEAD audit block vs main's Cycle 603 block) — resolved keeping **both** sections, 0 residual markers. Main's new commit is doc/registry-only; it did NOT reintroduce the removed secret, so no secret-side conflict this cycle.
- **Verification**: code-only added secret 0x (6 added lines) · injection/XSS/deprecated 0x (sole `Math.random` hit = pre-existing JSDoc at `core.ts:90`) · `scan:secrets` ✅ 336 files · `npm audit` ✅ 0 vulns (full + prod) · `validate:wrangler` ✅ · typecheck ✅ (shared/api/web) · shared 869/869 · api 535/535 · fail-closed both sides re-confirmed (`env.ts:7` `""`, `api.ts:142` header omitted, `auth.ts:129-140` 503).
- **Stale artifacts**: gitignored `packages/shared/dist` + `apps/web/dist` had regressed to embedding the removed fallback again (built from pre-fix source) — rebuilt both; post-rebuild grep 0 hits.
- **Lesson**: A merge that only conflicts in *docs* still needs a re-scan of the code diff afterward — main moves, and the code-side secret removal must be re-proven (not assumed) after every merge; rebuild gitignored dists on every cycle since local builds drift from source.

### 2026-10-02: Security Engineer Audit — Changed-Files Scan vs origin/main (6 files)

- **Finding**: Diff is the hardening itself (wrangler prod+staging `API_KEY` → secret-put comments, `PUBLIC_ACCESS_KEY` removed, `env.ts` fail-closed, test asserts absence). 0 introduced vulnerabilities / secrets / deprecated usage — nothing to remove.
- **Verification**: Code-only added secret value 0x (audit-prose quotes excluded); injection/XSS/deprecated CLEAN; `scan:secrets` ✅ 335 files; `npm audit` ✅ 0 vulns (full + prod); `validate:wrangler` ✅; fail-closed verified both sides (web omits header, api 503s); shared 869/869, web typecheck clean.
- **Lesson**: When audit-prose docs quote a removed secret for traceability, scope secret-counting to code paths (`apps/**`, `packages/**`) — doc quotes are false positives. Staging `CORS_ORIGIN="*"` pre-exists on main; flag report-only, don't expand scope.

### 2026-10-01: Security Engineer Audit — PR app-functionality-fixes-round-2 (4-file state)

- **Finding**: PR (`origin/convoy/app-functionality-fixes-round-2-lost-rev/a6674c16/head` vs `origin/main`: `logger.ts` +20, `index.ts` -9, `index.test.ts` +258, `logger.test.ts` +153) introduces 0 vulnerabilities, secrets, or deprecated usage — it is a net security FIX.
- **Fix 1 (CWE-532)**: `logger.ts` adds `API_HEADERS.CUSTOM.API_KEY` (= `x-api-key`, the `apiKeyAuth` default) to `SANITIZED_HEADER_EXCLUDE`, closing credential-into-Workers-logs. Verified import from `./network` with no import cycle; shared-derivation anti-drift.
- **Fix 2**: `index.ts` deletes the `env.ASSETS.fetch(request)` SPA fallback, fixing the consumed-body "Cannot reconstruct a Request" crash; unknown paths now return structured JSON 404.
- **Verification**: Secret scan (PR-head versions), added-lines secret regex, dangerous-pattern scan (`eval`/`innerHTML`/`Math.random`/`substr`/`max_tokens`) all clean; test canaries (`CANARY-bug052-*`, `TEST_API_KEY="test-key"`) are synthetic fixtures, not secrets; `npm audit` 0 vulnerabilities; no `package.json`/lockfile change → no new CVEs. Independently confirms the existing `docs/findings.md` audit entry for this PR scope.
- **Lesson**: Bare `git diff --name-only <pr-head>` from another branch compares PR-head→working-tree (reversed); true PR scope is `origin/main..head`. Always verify diff direction before scoping an audit.

### 2026-02-22 06:15 UTC: Cloudflare Workers Environment File in .gitignore

- **Finding**: `.dev.vars` (Cloudflare Workers environment file) was not in `.gitignore`
- **Root Cause**: `.gitignore` included `.env*` patterns but missed Cloudflare's equivalent `.dev.vars`
- **Risk**: Developers could accidentally commit API keys and secrets to version control
- **Fix**: Added `.dev.vars` to `.gitignore` under the Environment variables section
- **Verification**: TypeScript clean, ESLint clean, 236 web tests pass
- **Lesson**: All environment file patterns (including cloud-specific ones like `.dev.vars`) should be in `.gitignore` to prevent credential leakage

### 2026-02-21 21:16 UTC: CSP object-src Hardening

 **Finding**: CSP was missing `object-src 'none'` directive for defense-in-depth against plugin-based attacks (Flash, Java, PDF)
 **Root Cause**: Original CSP configuration did not include this recommended directive
 **Risk**: Without `object-src 'none'`, browsers could potentially load malicious plugins if other attack vectors succeeded
 **Fix**: Added `object-src 'none'` to CSP in `/apps/web/src/lib/security.ts`
 **Verification**: All 236 web tests pass, lint clean
 **Lesson**: CSP should always include `object-src 'none'` as a defense-in-depth measure against plugin-based attacks

### 2026-02-21 17:05 UTC: Security Engineer Audit - main.yml Invalid Action Version

- **Finding**: `main.yml` workflow uses invalid `actions/checkout@v5` (v5 doesn't exist)
- **Root Cause**: Workflow file not kept in sync with project standards defined in AGENTS.md
- **Risk**: Invalid action versions could fail or execute unintended code if malicious actor creates v5 tag
- **Status**: Blocked by issue #483 - requires repository admin to grant `workflows` permission
- **Verification**: All 217 tests pass, build succeeds, lint clean
- **Lesson**: CI workflow action versions must be validated against actual available versions; non-existent versions are a security risk

### 2026-02-20 21:00 UTC: Security Engineer Audit - Posture Verified

- **Finding**: Security audit confirmed all controls remain effective
- **Observation**: Codebase maintains excellent security posture; all 396 tests pass
- **npm audit**: 18 vulnerabilities (dev deps only) - risk accepted
- **Secrets scan**: No hardcoded secrets found
- **XSS scan**: No dangerouslySetInnerHTML, eval(), or innerHTML usage
- **Blocker**: CI workflow fixes for #483 still require GitHub App `workflows` permission
- **Action**: Documented workflow fix steps; awaiting repository permission changes
- **Lesson**: Security audits should verify both code-level controls and CI/CD infrastructure permissions

### 2026-02-20 16:55 UTC: XSS Pattern Library Enhancement

- **Finding**: XSS pattern library was missing modern attack vectors (SVG-based, mutation XSS, DOM clobbering)
- **Root Cause**: Original patterns focused on traditional XSS vectors; newer attack techniques emerged
- **Risk**: SVG elements can contain embedded scripts; mutation XSS exploits browser parsing quirks; DOM clobbering can override global variables
- **Fix**: Added FORBID_TAGS for `svg`, `math`, `base`, `link`, `meta`; added XSS_PATTERNS for SVG animate/set/use, data/base64/blob protocols, DOM clobbering IDs, noscript/template elements
- **Lesson**: XSS defense must evolve with attack techniques; regular pattern library audits are essential for defense-in-depth

### 2026-02-20 13:24 UTC: CI Workflow Security Standardization Fixed

- **Finding**: `on pull.yml` workflow used outdated runner (`ubuntu-22.04-arm`) and invalid action versions (`@v6`)
- **Root Cause**: Workflow not kept in sync with project standards defined in AGENTS.md
- **Risk**: Outdated CI runners may contain unpatched vulnerabilities; invalid action versions could fail or execute unintended code
- **Fix**: Updated runner to `ubuntu-24.04-arm`, actions/checkout and actions/setup-node to `@v4`
- **Lesson**: CI workflows should be audited regularly for version consistency and security compliance per AGENTS.md standards

### 2026-09-29 09:30 UTC: Security Engineer Audit — Dependabot Dev-Deps PR (9 bumps)

- **Finding**: PR bumps 9 dev-only deps (eslint 10.11.0, wrangler 4.141.0, jsdom 30.1.1, vite 8.3.1, lighthouse 13.5.0, etc.). All forward-only, no introduced vulnerabilities, secrets, or deprecated functions.
- **Verification**: Added-lines secret/XSS/deprecated greps CLEAN; `scan:secrets` ✅ 334 files; web typecheck clean; fresh `apps/web/dist` rebuild grep CLEAN (stale gitignored bundle had held the old hardcoded fallback — never committed).
- **Pre-existing Issue**: `undici@7.28.0-7.29.0` (GHSA-3wwx-pv8p-q78v, moderate) persists via `miniflare@5.20260925.0-alpha` exact pin (`undici: "7.29.0"`) inside wrangler 4.141.0. `npm audit fix --force` would breaking-downgrade vitest-pool-workers → risk accepted (dev-only test tooling). jsdom 30.1.1 moving to undici ^8.10.2 improves one leg.
- **Merge Hazard**: `origin/main` merge tried to reintroduce hardcoded `blueprintify-public-access-2026` into `wrangler.toml` + `env.ts` — conflicts resolved keeping secret-free version.
- **Lesson**: When main regresses a prior secret-removal, the merge conflict itself is the security gate — always resolve toward the secret-free side and rebuild gitignored artifacts (dist/) that may still embed the old value.

### 2026-09-27 04:00 UTC: Security Engineer Audit — Model Fallback Hierarchy PR

- **Finding**: PR (90 files: toast options→duration refactor, pro-tip removal, debounce retype, opencode.json model hierarchy, 2 new dev deps, new scripts/opencode-run.sh, 5 workflows migrated to wrapper). No introduced vulnerabilities, secrets, or deprecated functions.
- **Code Scanned**: All code/config diffs; secret/XSS/deprecated greps on added lines clean; `scan:secrets` ✅ 332 files; `npm audit` ✅ 0 vulns (incl. @emnapi/core 1.11.3, @img/sharp-wasm32 0.35.4); opencode-run.sh bash -n OK, 0755, fully quoted, no eval/curl/secrets; toast refactor complete (44/44 vitest pass); source typecheck 0 errors.
- **Verification**: No code fixes required; audit recorded in `docs/findings.md`.
- **Lesson**: Shell fallback wrappers that interpolate a user-passed `--model` must quote the expansion and strip the original flag first, otherwise argument injection reorders the fallback chain. Verified pattern: strip `--model`/`-m` during arg parse, then append `--model "$model"` quoted per attempt.

### 2026-09-27 05:15 UTC: Security Engineer Audit — Hardcoded-Secret Removal Verified (22 files vs origin/main)

- **Finding**: PR removes hardcoded credential `blueprintify-public-access-2026` from `apps/api/wrangler.toml` (prod + staging → `wrangler secret put` comments) and `apps/web/src/config/env.ts` (fallback → `""` when unset). No introduced vulnerabilities, secrets, or deprecated usage in the 22-file diff.
- **Verification**: Added-lines secret/XSS/deprecated greps CLEAN; `scan:secrets` ✅ 334 files; `npm audit` ✅ 0 vulns; fail-closed confirmed (frontend omits `x-api-key` when empty, backend 503s when unset); toast tests 44/44 pass; web source + shared typecheck clean.
- **Lesson**: Removing a hardcoded *fallback* credential is only safe when both sides fail closed — verify the client omits the header on empty and the server rejects (not bypasses) on unset before approving. No rotation needed for a public dev fallback that was never a real secret.

### 2026-09-29 09:00 UTC: Security Engineer Audit — vitest/ui 4.1.11→5.0.2 (dependabot)

- **Finding**: PR bumps dev-only `@vitest/ui` to `5.0.2` (2 files: package.json + lock). No introduced vulnerabilities, secrets, or deprecated functions. Snyk 0 direct vulns; prior Vitest UI RCEs (GHSA-p63j-vcc4-9vmv, GHSA-5xrq-8626-4rwp) patched in both versions; Vite 8.3.0 + Node ≥22 satisfy Vitest 5 reqs.
- **Verification**: PR-diff secret/XSS/deprecated greps CLEAN; `scan:secrets` ✅ 334 files; `npm audit --omit=dev` ✅ 0 vulns (full audit 5 moderate undici pre-existing via jsdom→miniflare chain); lockfile URLs + integrity ✅.
- **Structural flag (report-only)**: `vitest` stays `4.1.11` while ui 5.0.2 peerRequires `vitest@5.0.2` → peer warning / possible `vitest --ui` breakage. Coordinated 5.x bump (vitest + coverage-v8 + ui) left to dependabot follow-ups.
- **Lesson**: Major-range dev-tool bumps must be checked for peer-matrix coherence, not just CVEs — a lone UI major ahead of its runner is the classic dependabot interim state. Flag it, don't fix it (no functionality reduction).

### 2026-09-30 09:00 UTC: Security Engineer Audit — TOML Typo + Override Downgrade Fixed
- **Finding**: PR diff carried 2 introduced defects alongside valid secret removal: (1) stray `<` in `apps/api/wrangler.toml:76` (`<vars = {...}` — invalid TOML breaking staging deploy/validator); (2) silent overrides downgrade (`brace-expansion` 5.0.12→5.0.9, `undici` 7.30.0→7.29.0 behind origin/main; undici 7.29.0 in GHSA-3wwx-pv8p-q78v range).
- **Fix**: Removed `<` → valid `vars = {...}`; bumped overrides forward to main's versions and re-resolved lockfile (`npm update undici`).
- **Verification**: `validate:wrangler` ✅, `scan:secrets` ✅ 334 files, `npm audit` ✅ 0 vulns (prod + full), shared build + shared/web typecheck clean.
- **Lesson**: Secret-removal edits to config files must be followed by a syntax-validate step (`validate:wrangler`/tomllib parse) — a one-char typo next to the removed secret can break deploys worse than the secret did. Always diff overrides against main; backward version moves are regressions even when the surrounding PR is a hardening PR.

### 2026-09-30 10:30 UTC: Security Engineer Audit — Secret-Removal + Inline-Expansion PR Verified

- **Finding**: 14-file diff vs origin/main removes hardcoded `API_KEY` from wrangler.toml (prod + staging) and `PUBLIC_ACCESS_KEY`/`VITE_API_KEY` from shared config; call sites inline byte-identical literals. No introduced vulnerabilities, secrets, or deprecated functions.
- **Verification**: Secret value 0x in added code lines (4x removed only); `scan:secrets` ✅ 334 files; `npm audit` ✅ 0 vulns (full + prod); fail-closed verified both sides (frontend omits header, backend 503s, constant-time compare intact); valid TOML; typechecks clean (shared/web/api); zero stale refs.
- **Structural flag (report-only)**: Inlining shared constants duplicates values across 4 files (drift risk, no behavior change) — left to owning team per no-functionality-reduction rule.
- **Lesson**: Secret-counting on diff direction (`grep -c` on `+` vs `-` lines) is the fastest proof that a hardening PR only removes credentials; pair it with a fail-closed check on both client and server before approving.

### 2026-10-01 01:55 UTC: Security Engineer Audit — Stale-Deps Sync (dompurify GHSA-p98j-92pf-mc4p)
- **Finding**: `agent/security-engineer` was behind `origin/main` (f0aa4fbb): stale `dompurify@3.4.15` + missing `overrides.dompurify` re-exposed GHSA-p98j-92pf-mc4p (1 low in `npm audit`); stale UI (`MarkdownRenderer` empty-src guard, `PreviewEmptyState` data-reduced-motion) and docs (BUG-051, Cycle 602) would have been deleted by the PR.
- **Fix**: Checked out 9 stale files + Cycle 602 block forward from `origin/main`; kept the 4 secret-removal files untouched. Final diff vs main = secret removal + audit logs only.
- **Verification**: Code-only secret value 0x; `scan:secrets` ✅ 335 files; `npm audit` ✅ 0 vulns (full + prod); `validate:wrangler` ✅; typecheck clean; shared 868/868, web 12/12 + 27/27, api 535/535.
- **Lesson**: When `git diff origin/main` shows a security lib moving *backward*, check merge-base first — zero branch changes since MB means staleness, not introduction. Sync forward with `git checkout origin/main -- <files>` and never let a hardening PR delete main's newer hardening.

### 2026-10-01 02:30 UTC: Security Engineer Audit — Introduced-Defect Removal (downgrades + localStorage + inline-expansion)
- **Finding**: 18-file diff carried valid secret removal plus 3 introduced regression classes: (1) 5 dependency downgrades (hono 4.13.9→4.13.8, openai 7.23.0→7.18.0, codemirror 4.25.12→4.25.11, framer 13.4.4→13.4.0, error-boundary 6.1.6→6.1.5); (2) localStorage try/catch removal in 3 files (privacy-mode SecurityError crash/DoS); (3) shared-constant inline expansion (visibility timeouts, ELAPSED_ANNOUNCEMENT, test mocks, Iteration 187 docs).
- **Fix**: Restored forward dep versions + origin/main lockfile; checked out App/StepGenerating/ReducedMotion/e2e/api.test/flexy-plan from origin/main; surgically restored PLAYWRIGHT/UI_TIMEOUTS constants + web import + config.test expectations (23-count) while keeping PUBLIC_ACCESS_KEY removal + fail-closed test. Final diff vs main = 6 files (secret removal + audit logs only).
- **Verification**: Secret 0x; `scan:secrets` ✅ 335 files; `npm audit` ✅ 0 vulns; `validate:wrangler` ✅; typecheck clean; shared 869/869, web api.test 5/5.
- **Lesson**: A hardening PR that also touches package.json or shared config must be diffed for direction — every version move must be forward-only and every shared-constant deletion must be secret-only; otherwise restore from main and re-apply only the secret removal.

### 2026-09-30 11:00 UTC: Security Engineer Audit — Merge Reintroduction of Removed Secret Fixed
- **Finding**: `origin/main` merge reintroduced hardcoded fallback `blueprintify-public-access-2026` as new `SHARED_DEFAULTS.PUBLIC_ACCESS_KEY` with `env.ts` fallback wiring — regressing the prior fail-closed (`""`) hardening. Empty `git diff --name-only origin/main` on the source branch masked it; the staged merge diff (20 files) plus the `env.ts` conflict exposed it.
- **Fix**: Removed the constant; resolved conflict as `getEnvVar(WEB_ENV.VITE_API_KEY)` (shared key name, no fallback); replaced hardcoding test with fail-closed absence assertion.
- **Verification**: Secret value 0x in added code lines; `scan:secrets` ✅ 335 files; `npm audit` ✅ 0 vulns; shared 868/868, web 25/25, api openai 19/19; typechecks clean.
- **Lesson**: When `git diff --name-only origin/main` is empty on a PR branch, audit the staged merge diff (`git diff --cached`) and every merge conflict instead — merges from main can silently reintroduce previously removed secrets, and the conflict resolver is the last security gate. Always resolve toward the secret-free side.

### 2026-05-25 21:00 UTC: Security Engineer Audit - Lighthouse Dependency Upgrade

- **Finding**: PR upgraded `lighthouse` from `^12.8.2` to `^13.3.0` (dev dependency). No introduced vulnerabilities, secrets, or deprecated functions.
- **Root Cause**: Routine dependency update for performance auditing tool.
- **Verification**: Secret scan, deprecated function scan, npm audit, CVE database check (Snyk/ReversingLabs) all clean.
- **Pre-existing Issue**: `ws@8.18.0` (GHSA-58qx-3vcg-4xpx, moderate) persists in `apps/api/node_modules/ws` — pinned by `miniflare@4.20260426.0` as exact direct dependency (`ws: "8.18.0"`). Root-level npm override `"ws": "8.20.1"` cannot bypass this nested exact pin. Requires miniflare/wrangler upgrade to resolve.
- **Lesson**: When npm overrides don't propagate into workspace-level nested `node_modules` with exact version pins, the fix requires upgrading the parent dependency. Document this for future reference.

### 2026-02-20 09:35 UTC: Security Engineer Audit - Secure Logging Gap Fixed

- **Finding**: Import and export routes used inline error handling without secure logging
- **Root Cause**: Routes implemented custom try-catch blocks that didn't use `secureLogError`
- **Risk**: Potential information leakage through logs if errors contained sensitive data
- **Fix**: Added `secureLogError` calls to import.ts and export.ts error handlers
- **Lesson**: All error handlers should use secure logging utilities to maintain consistent log sanitization

### 2026-02-20 05:58 UTC: Security Engineer Audit - Posture Maintained

- **Finding**: Follow-up security audit confirmed all controls remain effective
- **Observation**: No new security issues found; codebase maintains excellent security posture
- **npm audit**: 19 vulnerabilities (1 low, 1 moderate, 17 high) - all in dev-only dependencies (eslint, lighthouse, vitest)
- **Secrets scan**: No hardcoded secrets found
- **XSS scan**: No dangerouslySetInnerHTML, eval(), or innerHTML usage
- **Action**: Added JSDoc documentation to rate limiting middleware for security clarity
- **Lesson**: Regular security audits confirm controls remain effective over time

### 2026-02-19 21:00 UTC: Security Engineer Audit - Posture Maintained

- **Finding**: Follow-up security audit confirmed all controls remain effective
- **Observation**: No new security issues found; codebase maintains excellent security posture
- **npm audit**: 19 vulnerabilities (1 low, 1 moderate, 17 high) - all in dev-only dependencies (eslint, lighthouse)
- **Secrets scan**: No hardcoded secrets found (only test data in test files)
- **Action**: No immediate fixes required; continue monitoring
- **Lesson**: Regular security audits confirm controls remain effective over time

### 2026-02-19: Security Audit - Excellent Posture Confirmed

- **Finding**: Full security audit completed - all major controls passing
- **Observation**: Codebase has excellent security posture with recent hardening (timing attacks, crypto IDs, secure logging, DOMPurify)
- **Blocker**: CI workflow standardization requires GitHub App `workflows` permission (tracked in #483)
- **npm audit**: 18 vulnerabilities in dev-only dependencies - risk accepted
- **Lesson**: Regular audits confirm security controls remain effective

### 2026-02-19: CI Workflow Security Standardization

- **Finding**: `on pull.yml` workflow used outdated runner (`ubuntu-22.04-arm`) and invalid action versions (`@v6`)
- **Root Cause**: Workflow not kept in sync with project standards defined in AGENTS.md
- **Risk**: Inconsistent CI environments, potential workflow failures from non-existent action versions
- **Fix**: Requires GitHub App `workflows` permission - tracked in #483
- **Lesson**: CI workflow configurations should be audited regularly for version consistency and security compliance

### 2026-02-19: Insecure Random ID Generation in Share Endpoint

- **Finding**: `generateShareId()` used `Math.random()` which is not cryptographically secure
- **Root Cause**: `Math.random()` is predictable and can be reverse-engineered by attackers
- **Risk**: ID prediction attacks could allow unauthorized access to shared blueprints
- **Fix**: Replaced with `crypto.getRandomValues()` for cryptographically secure random generation
- **Lesson**: All security-sensitive random values (IDs, tokens, nonces) must use `crypto.getRandomValues()` or equivalent CSPRNG

### 2026-02-18: AJV Dependency Vulnerability (Issue #418)

- **Finding**: 9 moderate vulnerabilities in `ajv` package (ReDoS via `$data` option)
- **Root Cause**: Upstream dependency via `@eslint/eslintrc` - cannot fix at project level
- **Risk Assessment**: LOW - development-only dependency, not in production bundle
- **Resolution**: Risk accepted, documented in `docs/security/assessment-ajv-vulnerabilities.md`
- **Lesson**: Always assess actual exploitability before panic-fixing dependency vulnerabilities

### 2026-07-27 09:26 UTC: Security Engineer Audit — PR jsdom 29→30, OfflineBanner Component

- **Finding**: PR upgrades `jsdom` from `29.1.1` to `30.0.0` (dev dependency) and adds `OfflineBanner.tsx` component. No introduced vulnerabilities, secrets, or deprecated functions.
- **Code Scanned**: `apps/web/package.json`, `apps/web/src/components/OfflineBanner.tsx`, `package-lock.json`
- **Scans performed**: npm audit (0 vulns ✅), secrets scan (none found ✅), XSS vector scan (no dangerous patterns ✅), deprecated API scan (none in new/changed code ✅), DOM manipulation audit (CSS injection uses static constants only ✅)
- **Pre-existing Issue Fixed**: `package-lock.json` had `openai@6.48.0` while `apps/api/package.json` specified `"openai": "6.49.0"` — ran `npm install` to sync lockfile with manifest.
- **Verification**: TypeScript clean, npm audit 0 vulns, 893 packages audited.
- **Lesson**: Static CSS keyframe injection via `document.createElement('style')` is safe when content comes from constants files, not user input. Lockfile/manifest version mismatches should be caught and fixed proactively.

### 2026-06-08: Security Engineer Audit — Dependency Downgrade Regression Fixed

- **Finding**: PR contained two unauthorized dependency downgrades: `dompurify` from `^3.4.8` to `^3.4.7` (XSS sanitizer regression) and `openai` from `^6.42.0` to `^6.41.0` (OpenAI SDK regression).
- **Root Cause**: Manual edits to `apps/web/package.json` and `apps/api/package.json` lowered version constraints, and `package-lock.json` was regenerated to match.
- **Risk**: Downgrading `dompurify` (XSS sanitization library) reintroduces XSS vulnerabilities patched in 3.4.8. Downgrading `openai` loses bug fixes and security hardening from 6.41.0 → 6.42.0.
- **Fix**: Reverted both dependencies to their correct versions (`dompurify@^3.4.8`, `openai@^6.42.0`) and regenerated `package-lock.json`.
- **Verification**: TypeScript clean, npm audit clean (0 vulnerabilities).
- **Lesson**: Dependency version changes in PRs must only move forward, never backward. A security-critical dependency (like DOMPurify) should never be downgraded without explicit security review sign-off.

### 2026-02-18: Timing Attack Vulnerability in Auth Middleware

- **Finding**: API key comparison used direct string equality (`===`) which is vulnerable to timing attacks
- **Root Cause**: JavaScript string comparison is not constant-time
- **Fix**: Implemented `constantTimeCompare()` using XOR-based comparison
- **Lesson**: All secret/token comparisons must use constant-time algorithms to prevent timing side-channel attacks

### 2026-02-19: Security Headers Enhancement

- **Finding**: Missing modern security headers (Permissions-Policy, HSTS)
- **Root Cause**: Headers function was created before these became standard
- **Fix**: Added `Permissions-Policy` header to disable unnecessary browser features and `Strict-Transport-Security` for HTTPS enforcement
- **Lesson**: Security headers should be reviewed regularly as web standards evolve

### 2026-02-19: DOMPurify Configuration Hardening

- **Finding**: Missing `rel` attribute in ALLOWED_ATTR and `formaction` in FORBID_ATTR
- **Root Cause**: Configuration wasn't covering all attack vectors for links and forms
- **Fix**: Added `rel` to ALLOWED_ATTR (for safe external links with noopener/noreferrer) and `formaction` to FORBID_ATTR (prevents form-based XSS)
- **Lesson**: HTML sanitization configs should be reviewed against latest XSS vectors

### 2026-02-19: Secure Error Logging Implementation

- **Finding**: Error logs contained full error objects with stack traces and potentially sensitive data
- **Root Cause**: Direct `console.error` calls logged raw error information without sanitization
- **Risk**: Information leakage through logs (API keys, file paths, database connection strings)
- **Fix**: Created `secureLog.ts` utility with pattern-based sanitization for sensitive data
- **Lesson**: All error logging should sanitize output to prevent OWASP A09:2021 (Security Logging and Monitoring Failures)

### 2026-10-01 20:20 UTC: Security Engineer Audit — PR Tailwind content-glob hardening (fast-glob + test guard)

- **Finding**: PR adds `fast-glob@3.3.3` (dev-only), hardens `apps/web/tailwind.config.js` with absolute
  cwd-independent glob prefixes + test-file/`__tests__` negations, adds `tailwind.config.d.ts` and
  `apps/web/src/config/tailwindContent.test.ts` guard. No introduced vulnerabilities, secrets, or deprecated functions.
- **Code Scanned**: `apps/web/package.json`, `apps/web/tailwind.config.js`, `apps/web/tailwind.config.d.ts`,
  `apps/web/src/config/tailwindContent.test.ts`, `package-lock.json`
  (diff vs `origin/convoy/recover-lost-web-frontend-fixes-companio/2527e45b/head` = 5 files).
- **Scans performed**: npm audit (0 vulns ✅), `npm run scan:secrets` (337 files clean ✅),
  secrets grep (only false-positive "tokens" = design tokens ✅), injection/XSS grep
  (no eval/innerHTML/dangerouslySetInnerHTML/child_process ✅), deprecated-API grep (none ✅),
  fast-glob API check (`convertPathToPattern`/`escapePath` present in 3.3.3, no @deprecated ✅),
  targeted vitest run (7/7 pass ✅).
- **Action**: No code changes required. Named ESM import from CJS `fast-glob` relies on Vite/Vitest
  interop (verified passing); leaving as-is per no-unasked-rewrite.
- **Lesson**: Glob-building from `__dirname`-derived constants with `escapePath(convertPathToPattern())`
  is the safe pattern for cwd-independent Tailwind content scans — inputs are never user-controlled,
  so no path-traversal risk.

### 2026-10-02: Security Engineer Audit — Dependabot dev-deps PR clean, stale dist rebuilt

- **Finding**: Dependabot PR (9 forward-only dev bumps: workers-types, eslint ×4, wrangler, jsdom, vite, @types/node, lighthouse, prettier, typescript-eslint) introduces no vulnerabilities, secrets, or deprecated usage. `npm audit` 0 vulns (full + prod). Lockfile clean (local workspace links only, no suspicious scripts).
- **Root Cause (stale artifacts)**: Gitignored build outputs (`packages/shared/dist`, `apps/web/dist`) still embedded the previously removed `blueprintify-public-access-2026` fallback because they were built from pre-fix source. Tracked source was already clean.
- **Risk**: LOW — dist/ is gitignored and never part of any PR, but stale secrets in local artifacts can confuse future scans.
- **Fix**: Rebuilt both dists from current source (`tsc --build` + vite build); post-rebuild grep 0 hits. Verified typecheck clean, shared 869/869, api 535/535, web 1248/1248.
- **Lesson**: After removing a hardcoded secret from source, always rebuild gitignored dist outputs — otherwise the value lingers in local artifacts and re-triggers secret scans.

## Security Checklist

- [x] No hardcoded secrets in codebase
- [x] Environment variables used for sensitive configuration
- [x] Input validation with Zod schemas
- [x] Rate limiting implemented
- [x] Security headers via Hono middleware
- [x] CORS properly configured
- [x] Constant-time comparison for auth tokens
- [x] Circuit breaker for external dependencies
- [x] Cryptographically secure random ID generation
- [x] Permissions-Policy header (browser features disabled)
- [x] HSTS header (HTTPS enforcement)
- [x] DOMPurify with formaction forbidden
- [x] XSS pattern library includes SVG/math/mutation XSS vectors
- [ ] Consider distributed rate limiting for production scale

### 2026-10-08: Security Engineer Audit — Changed-files scan, stale-sync fix (134 files vs origin/main)

- **Finding**: 0 introduced vulnerabilities, secrets, or deprecated usage. Branch was stale behind main in 6 files: shell-quote 1.10.0→1.12.0 + sharp 0.35.4→0.35.5 (aa5281f8), AnimatedCopyButton attr removal (3120ce33), ScrollToTop isEditableField narrowing + 2 deleted tests (7a91af3d).
- **Fix**: Checked out 4 component files + package-lock.json from origin/main (branch had 0 changes since merge-base there); bumped package.json overrides forward, kept validate:secrets script.
- **Verification**: Added-lines secret/injection/deprecated 0x (execFileSync array-form safe; Math.random = celebration visuals); scan:secrets ✅ 338 files; npm audit 15→8 (prod 0); validate:wrangler ✅; web typecheck ✅; web 52/52, shared 801/801.
- **Lesson**: When both sides bump the same devDeps identically since merge-base, only the overrides/security lines need surgical merge — checkout the lockfile wholesale from main since npm scripts don't affect it.

### 2026-10-16: Security Engineer Audit — Changed-files scan (25→8 files), stale-reversion remediation

- **Finding**: 25-file diff mixed BUG-058 hardening (0 introduced issues) with 17 stale reversions (merge-base ff59018d predates main #3760-#3772): framer-motion 14.1.0→13.4.4 downgrade, 4 components + 3 tests reverting reduced-motion/DOM-state work, 5 doc rollbacks + deleted Run 96 audit, stray bug.md/task.md.
- **Fix**: Checked out 15 stale tracked files forward from origin/main; git rm stray logs; package.json left untouched (diff already exactly the 1 intended line); findings.md merged via section-parse keeping main ULW 2026-10-15 + 9 branch audit blocks + new entry, 0 residual markers. Final diff = 8 files, zero dep moves.
- **Verification**: Added-lines real-secret 0x; fallback 0x; XSS/injection 0x; deprecated 0x (all hits audit-prose); scan:secrets ✅ 338 files; npm audit --omit=dev ✅ 0 vulns; validate:wrangler ✅.
- **Lesson**: For findings.md merges, parse sections by `^## ` headers and keep branch-only sections (by exact header) + main's new top entry — avoids hand-editing a 12k-line append-only log and guarantees both histories survive.
