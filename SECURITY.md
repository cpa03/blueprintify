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

## Security Audit Summary

| Date           | Scope                              | Key Findings                                                                                    |
| -------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| **2026-09-26** | Comprehensive doc & security audit | Stale AJV assessment marked resolved; Cloudflare placeholder warning updated; 0 vulnerabilities |
| **2026-08-20** | Recurring gate (Cycle 596)         | `npm audit` 0 vulns · `scan:secrets` ✅ 328 files · all quality gates pass                      |
| **2026-08-19** | Recurring gate (Cycle 577)         | `npm audit` 0 vulns · `scan:secrets` ✅ 328 files · all quality gates pass                      |
| **2026-02-18** | CI/CD security review              | Workflow permission gaps identified (#743)                                                      |
| **2026-02-18** | Initial security assessment        | 9 vulnerabilities identified in `ajv@6.12.6` (RESOLVED Sep 2026)                                |

> **Full historical audit trail** (280+ recurring cycle records) is preserved in [`docs/findings.md`](./docs/findings.md) and in git history: `git log -- SECURITY.md`.

## Contact

For security-related questions or concerns:

- Open a GitHub Discussion for general security questions
- Use Security Advisories for vulnerability reports

---

**Last Updated**: 2026-08-16  
**Policy Version**: 1.0.0
