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

### 2026-10-04: Security Engineer Audit — PageScrollProgressBar reduced-motion DOM tracking (commit c50ff06 3-file diff vs origin/main; PR head 5 files incl. audit records), 0 introduced issues

- **Finding**: 3-file diff vs origin/main (`PageScrollProgressBar.tsx` +1 `data-reduced-motion` attr, test mock prop-stripping + shared-constant import, `active-tasks.md` prose) introduces 0 vulnerabilities, secrets, or deprecated usage — nothing to remove.
- **Verification**: Added-lines secret/injection/deprecated 0x; full-file secret/XSS 0x; `scan:secrets` ✅ 337 files; `npm audit --omit=dev` ✅ 0 vulns (full 5 high pre-existing braces GHSA-vfj7-8cjw-p6xm, no fix, no package change → not introduced); web typecheck ✅; PageScrollProgressBar tests 11/11 (incl. reduced-motion true-branch).
- **Lesson**: Framer-motion mock prop-stripping (`initial`/`animate`/`transition`/etc.) is a test-only jsdom hygiene pattern — it keeps test-DOM assertions focused on real attributes; shipped code is unaffected (framer-motion handles real DOM nodes itself). When reviewing motion-component tests, verify the mock strips non-DOM props rather than spreading them into the jsdom div.

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
