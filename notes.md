# Security Audit Notes: PR Dependency Updates

## Scope

- 3 changed files: `apps/web/package.json`, `package.json`, `package-lock.json`
- Dependency version bumps and one removal

## Changes Analyzed

### 1. apps/web/package.json

| Dependency   | Old     | New      | Assessment                                                   |
| ------------ | ------- | -------- | ------------------------------------------------------------ |
| dompurify    | ^3.3.1  | ^3.4.7   | ✅ SECURITY IMPROVEMENT - 3.3.1 had 6M+1L vulns; 3.4.7 has 0 |
| react        | ^19.2.0 | ^19.2.7  | ✅ Safe - patch bump, no known regressions                   |
| react-dom    | ^19.2.6 | ^19.2.7  | ✅ Safe - patch bump                                         |
| @types/react | ^19.2.0 | ^19.2.16 | ✅ Safe - type definitions only                              |

### 2. package.json (root)

| Dependency            | Old    | New     | Assessment                                           |
| --------------------- | ------ | ------- | ---------------------------------------------------- |
| react                 | 19.2.6 | 19.2.7  | ✅ Safe                                              |
| react-dom             | 19.2.6 | 19.2.7  | ✅ Safe                                              |
| playwright-lighthouse | ^4.0.0 | REMOVED | ✅ Clean removal - not referenced in any source file |

### 3. package-lock.json

Regenerated to match new dependency tree. Correctly resolved.

## Security Findings

### No Introduced Vulnerabilities

This PR does NOT introduce any new vulnerabilities. All changes are either:

- Security improvements (dompurify bump)
- Safe patch bumps (react, react-dom)
- Clean removal of unused dependency (playwright-lighthouse)

### DOMPurify Security Assessment

dompurify 3.3.1 had 6 medium + 1 low vulnerabilities (per Snyk):

- CVE-2024-47875 (mXSS, fixed in 3.1.3)
- CVE-2025-15599 (textarea rawtext bypass in SAFE_FOR_XML, fixed in 3.2.7)
- CVE-2026-41239 (SAFE_FOR_TEMPLATES + RETURN_DOM bypass, fixed in 3.4.0)
- 3.4.0 fixes: ADD_TAGS bypass, ADD_ATTR URI validation bypass, USE_PROFILES prototype pollution, mXSS via Re-Contextualization
- 3.4.5 fixes: bypass via new HTML `selectedcontent` element (security release)
- 3.4.7: latest, 0 vulnerabilities

dompurify 3.4.7 has 0 known vulnerabilities. This is a significant security improvement.

### Pre-existing Critical Vulnerability (not introduced by this PR)

- **npm audit**: 4 critical vulnerabilities
- **Package**: vitest / @vitest/ui
- **Advisory**: GHSA-5xrq-8626-4rwp
- **CVSS**: 9.8 (Critical)
- **Issue**: When Vitest UI server is listening, arbitrary file can be read and executed (CWE-862: Missing Authorization)
- **Affected**: vitest < 4.1.0, @vitest/ui <=0.0.130 or 0.31.0-4.1.0-beta.6
- **Current version**: vitest@3.2.4, @vitest/ui@3.2.4
- **Fix**: vitest@4.1.8, @vitest/ui@4.1.8 (breaking change - major version bump)
- **Mitigation**: vitest UI is only used in development (`vitest --ui`), not in production

### Secrets Scan

- No hardcoded passwords, API keys, tokens, or credentials found in changed files
- No `.env` files or sensitive configs in the diff
