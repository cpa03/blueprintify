# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security Advisories](https://github.com/cpa03/blueprintify/security/advisories) page
   - Click "Report a vulnerability"
   - Fill in the details

2. **Email** (Alternative)
   - Send details to the repository maintainers
   - Include: description, steps to reproduce, potential impact

### What to Include

When reporting, please include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** and affected components
- **Suggested fix** (if available)
- **Your contact information** for follow-up

### Response Timeline

| Stage              | Timeline              |
| ------------------ | --------------------- |
| Acknowledgment     | Within 48 hours       |
| Initial Assessment | Within 7 days         |
| Fix Development    | Depends on severity   |
| Security Advisory  | After fix is released |

### Disclosure Policy

- We follow **coordinated disclosure**
- Security advisories are published after fixes are available
- Credit is given to reporters (unless anonymity is requested)

## Security Best Practices

### For Users

- **API Keys**: Never commit your OpenAI API key to version control
- **Environment Variables**: Use `.dev.vars` for local development (already in `.gitignore`)
- **Dependencies**: Keep dependencies updated to avoid known vulnerabilities

### For Contributors

- **Input Validation**: All user inputs must be validated with Zod schemas
- **XSS Prevention**: Use DOMPurify for sanitizing HTML/Markdown content
- **Secrets**: Never log or expose API keys, tokens, or credentials
- **Dependencies**: Run `npm audit` before submitting PRs

## Known Security Considerations

### Upstream Dependencies

| Issue               | Status     | Details                              |
| ------------------- | ---------- | ------------------------------------ |
| ajv vulnerabilities | Monitoring | Upstream dependency, tracked in #418 |

### Security Features

The application implements the following security measures:

- **Input Validation**: Zod schemas on all API endpoints
- **XSS Protection**: DOMPurify sanitization with forbidden attributes
- **Security Headers**: Hono `secureHeaders()` middleware
- **Secure Logging**: Sensitive data redaction in logs
- **Random Generation**: `crypto.getRandomValues()` for security-sensitive IDs
- **Constant-Time Comparison**: For authentication tokens

## Security Audit History

| Date       | Scope                               | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 524) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (103rd, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 129th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 523) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · PR HANDLER 2/2 merged: #3364 dependabot eslint 9→10 major bump (full diff reviewed — lockfile/manifest only, 0 secrets; security audit recorded `docs/findings.md`: 0 vulns/0 secrets/0 deprecated usage; peer `^9` caps on `eslint-plugin-react`/`eslint-plugin-jsx-a11y` = informational, mitigated by `legacy-peer-deps=true`; gates ALL GREEN under v10) + #3363 brocula Run 73 docs-only (0 secrets) → ISSUE MANAGER re-check Steps 1–3 token-blocked (102nd, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 128th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573 |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 522) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · REPOKEEPER audit (0 redundant/temp/unused tracked files · 0 orphaned scripts/agents/skills/commands · workflows all `ubuntu-24.04-arm` + node-version-file 11 total ✓ · audits index 81 ↔ 81 in sync) · archive retention purge executed (7× Jul 16–17 files, 31–32d strict, past 30-day policy) · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 522) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (101st, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 127th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 521) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (100th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 126th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 520) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (99th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 125th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 519) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (98th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #1167/#1082, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 124th deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 518) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · PR HANDLER 1/1 merged #3356 (BugFixer Cycle 90 docs) → ISSUE MANAGER re-check Steps 1–3 token-blocked (97th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment on #849, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 123rd deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                              |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 517) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (96th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 122nd deferral · janitor FAIL-SAFE maintained (5 commits unchanged — human disposition pending) · doc-sync 1 defect fixed (active-tasks Cycle 516 backfill) · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 516) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (95th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 121st deferral · janitor FAIL-SAFE maintained (5 commits, 2 new gatekeeper auto-fixes — human disposition pending) · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 515) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (94th, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 120th deferral · janitor FAIL-SAFE maintained · doc-sync 1 defect fixed (README L339 BroCula range) · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-08-17 | Recurring gate (ULW Loop Cycle 514) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (93rd, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 119th deferral · janitor FAIL-SAFE maintained · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 513) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files · ISSUE MANAGER re-check Steps 1–3 token-blocked (92nd, 3 real mutation probes 403 addLabelsToLabelable/closeIssue/addComment, zero residue) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 118th deferral · janitor FAIL-SAFE maintained · doc-sync 0 defects · baseline ALL GREEN 2,573/2,573                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 512) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 2/2 merged (#3341 Cycle 511 docs record + #3342 BugFixer Cycle 88) + ISSUE MANAGER re-check Steps 1–3 token-blocked (91st) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 117th deferral · doc-sync 0 defects                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

| 2026-08-16 | Recurring gate (ULW Loop Cycle 512) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene clean (0 redundant files, 0 orphaned scripts/agents/skills/commands, audits 79↔79, no purge due) + doc-sync 0 defects + janitor FAIL-SAFE maintained + baseline ALL GREEN 2,573/2,573 |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 511) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 1/1 merged (#3340 Cycle 510 docs record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (90th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 116th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 510) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 1/1 merged (#3339 Cycle 509 docs record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (89th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 115th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 508) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 1/1 merged (#3335 Cycle 507 docs record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (87th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 113th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 509) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 3/3 merged (#3338 REPOKEEPER + #3337 BugFixer + #3336 Cycle 508 record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (88th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 114th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 507) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene clean (0 redundant files, 0 orphaned scripts/agents/skills/commands, audits 79↔79, no purge due) + doc-sync 0 defects + janitor FAIL-SAFE maintained + baseline ALL GREEN 2,573/2,573 |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 507) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 1/1 merged (#3334 Cycle 506 docs record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (86th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 112th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 506) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 1/1 merged (#3333 Cycle 505 docs record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (85th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 111th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 505) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 2/2 merged (#3332 BroCula Run 70 docs + #3331 Cycle 504 REPOKEEPER docs) + ISSUE MANAGER re-check Steps 1–3 token-blocked (84th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 110th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 504) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER Steps 1–3 token-blocked (83rd) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 109th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 504) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene clean (0 redundant files, 0 orphaned scripts/agents/skills/commands, audits 78↔78, no purge due) + doc-sync 0 defects + janitor FAIL-SAFE maintained + baseline ALL GREEN 2,573/2,573 |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 503) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER Steps 1–3 token-blocked (82nd) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 108th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 502) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER Steps 1–3 token-blocked (81st) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 107th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 501) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3325 (docs-only Cycle 500 record) + ISSUE MANAGER re-check Steps 1–3 token-blocked (80th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 106th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 500) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3324 (BroCula Run 69 docs) + #3323 (BugFixer Cycle 85 docs) + ISSUE MANAGER re-check Steps 1–3 token-blocked (79th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 105th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 499) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER Steps 1–3 token-blocked (78th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 104th deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 498) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER Steps 1–3 token-blocked (77th) · P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) · #849/#953 103rd deferral · doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 497) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3319 (docs-only Cycle 496 record) + ISSUE MANAGER re-check P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) + doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 496) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3318 (Repokeeper 495 docs) + #3317 (a11y sr-only feature) + #3316 (BroCula Run 68 docs) + ISSUE MANAGER re-check P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) + README BroCula range fix (Jul 16–Aug 16) |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 495) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) + janitor branch FAIL-SAFE disposition maintained (not merged/not deleted, 3 unmerged commits) + doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 495) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene clean + archive purge (7 Jul 15 files) + doc-sync 3 fixes + janitor FAIL-SAFE kept |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 494) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) + janitor branch FAIL-SAFE evidence strengthened (zero consumers + gates green) + doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 493) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1045/#1165 Cloudflare provisioning) + doc-sync 0 defects |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 492) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3310 (a11y code) + #3308 (BugFixer 83 docs) + ISSUE MANAGER re-check P1s code-resolved/human-blocked (#1014 97th deferral) |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 491) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1014 96th deferral) + doc-sync 0 defects |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 490) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1014 95th deferral) + doc-sync 12-cycle backfill |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 489) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3305 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 488) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3304 (BroCula Run 67) + #3303 (BugFixer 82) + findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 487) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 486) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3300 (BroCula Run 66) + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 485) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 484) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 483) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 482) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3294 (BroCula Run 65) + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 481) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3292 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 480) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 479) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 4/4 merged (#3288-#3285) + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 478) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3284 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 477) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects + doc-sync fixes + PR delivery |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 476) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3282 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 475) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 3/3 merged (#3281,#3280,#3279) + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 474) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects (1 stale branch deleted) + doc-sync 4 fixes |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 473) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3277 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 472) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3276 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 471) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 5/5 merged (#3275-#3271) + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 470) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3270 + issue-manager findings-only (backfilled) |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 469) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects + ISSUE MANAGER P1s code-resolved/human-blocked |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 468) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3268 + issue-manager findings-only (backfilled) |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 467) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · issue-manager findings-only (backfilled) |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 466) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked + REPOKEEPER hygiene 0 defects |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 465) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · issue-manager records-only (backfilled) |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 464) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · repo hygiene audit 0 defects |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 463) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · 3/3 PRs merged (1 code + 2 docs) |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 462) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 461) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 460) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · deps bumped (#1161, #3248) |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 459) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 458) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 457) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 456) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 455) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 454) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 453) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 452) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 451) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 449) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 448) | `npm audit` 0 vulns · `scan:secrets` ✅ 320 files |
| 2026-02-19 | Full codebase audit | All checks passed |
| 2026-02-18 | CI/CD security | Workflow issues identified (#743) |

## Contact

For security-related questions or concerns:

- Open a GitHub Discussion for general security questions
- Use Security Advisories for vulnerability reports

---

**Last Updated**: 2026-08-16  
**Policy Version**: 1.0.0
