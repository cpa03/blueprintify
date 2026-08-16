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

| Date       | Scope                               | Result                                                                                                                                               |
| ---------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-16 | Recurring gate (ULW Loop Cycle 491) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1014 96th deferral) + doc-sync 0 defects         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 490) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked (#1014 95th deferral) + doc-sync 12-cycle backfill |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 489) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3305 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 488) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3304 (BroCula Run 67) + #3303 (BugFixer 82) + findings-only (backfilled)      |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 487) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled)                                                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 486) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3300 (BroCula Run 66) + issue-manager findings-only (backfilled)              |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 485) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled)                                                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 484) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled)                                                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 483) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled)                                                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 482) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3294 (BroCula Run 65) + issue-manager findings-only (backfilled)              |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 481) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3292 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 480) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER findings-only (backfilled)                                                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 479) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 4/4 merged (#3288-#3285) + issue-manager findings-only (backfilled)                   |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 478) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3284 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 477) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects + doc-sync fixes + PR delivery                                      |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 476) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3282 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 475) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 3/3 merged (#3281,#3280,#3279) + issue-manager findings-only (backfilled)             |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 474) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects (1 stale branch deleted) + doc-sync 4 fixes                         |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 473) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3277 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 472) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3276 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 471) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER 5/5 merged (#3275-#3271) + issue-manager findings-only (backfilled)                   |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 470) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3270 + issue-manager findings-only (backfilled)                               |
| 2026-08-15 | Recurring gate (ULW Loop Cycle 469) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · REPOKEEPER hygiene 0 defects + ISSUE MANAGER P1s code-resolved/human-blocked                     |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 468) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · PR HANDLER merged #3268 + issue-manager findings-only (backfilled)                               |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 467) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · issue-manager findings-only (backfilled)                                                         |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 466) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · ISSUE MANAGER P1s code-resolved/human-blocked + REPOKEEPER hygiene 0 defects                     |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 465) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · issue-manager records-only (backfilled)                                                          |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 464) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · repo hygiene audit 0 defects                                                                     |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 463) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · 3/3 PRs merged (1 code + 2 docs)                                                                 |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 462) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 461) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 460) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files · deps bumped (#1161, #3248)                                                                       |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 459) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-14 | Recurring gate (ULW Loop Cycle 458) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 457) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 456) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 455) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 454) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 453) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 452) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 451) | `npm audit` 0 vulns · `scan:secrets` ✅ 322 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 449) | `npm audit` 0 vulns · `scan:secrets` ✅ 323 files                                                                                                    |
| 2026-08-13 | Recurring gate (ULW Loop Cycle 448) | `npm audit` 0 vulns · `scan:secrets` ✅ 320 files                                                                                                    |
| 2026-02-19 | Full codebase audit                 | All checks passed                                                                                                                                    |
| 2026-02-18 | CI/CD security                      | Workflow issues identified (#743)                                                                                                                    |

## Contact

For security-related questions or concerns:

- Open a GitHub Discussion for general security questions
- Use Security Advisories for vulnerability reports

---

**Last Updated**: 2026-08-16  
**Policy Version**: 1.0.0
