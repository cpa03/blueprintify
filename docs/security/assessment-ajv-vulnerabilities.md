# Security Assessment: AJV Vulnerabilities

**Date**: 2026-02-18  
**Issue**: #418  
**Severity**: Moderate  
**Status**: ⚠️ UPSTREAM DEPENDENCY - Cannot Fix at Project Level

## Summary

npm audit identified **9 moderate severity vulnerabilities** in the `ajv` package. After comprehensive analysis and attempted fixes, this has been determined to be an **upstream dependency issue** that cannot be resolved at the project level without breaking ESLint functionality.

## Vulnerability Details

- **Package**: `ajv`
- **Affected Versions**: `< 8.18.0`
- **Installed Version**: `6.12.6` (via `@eslint/eslintrc@3.3.3`)
- **Severity**: Moderate
- **CVE**: ReDoS when using `$data` option - https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
- **CWE**: CWE-400 (Uncontrolled Resource Consumption)

## Dependency Chain

```
eslint@9.39.2
└── @eslint/eslintrc@3.3.3
    └── ajv@6.12.6 (vulnerable)
```

## Attempted Fixes

### 1. `npm audit fix`

**Result**: No fix available  
No automatic resolution possible through standard npm audit fix.

### 2. `npm audit fix --force`

**Result**: Breaking changes introduced, vulnerabilities persist  
Attempted to downgrade `typescript-eslint` from `^8.54.0` to `^8.14.0`, but the ajv vulnerability remained because the root cause is in the ESLint dependency chain, not typescript-eslint.

### 3. Manual Override (`"overrides": { "ajv": "^8.18.0" }`)

**Result**: BREAKS ESLint  
ESLint fails to run with error:

```
NOT SUPPORTED: option missingRefs. Pass empty schema with $id that should be ignored to ajv.addSchema.
TypeError: Cannot set properties of undefined (setting 'defaultMeta')
```

## Risk Assessment

| Factor              | Assessment                                            |
| ------------------- | ----------------------------------------------------- |
| **Impact**          | LOW                                                   |
| **Attack Vector**   | Requires use of `$data` JSON Schema feature           |
| **Exploitation**    | NOT currently exploitable in our ESLint configuration |
| **Dependency Type** | Development-only (not in production bundle)           |
| **CVSS Score**      | 0 (not scored)                                        |

### Why Risk is Low

1. **Development-only**: AJV is only used by ESLint during development/linting, not in production runtime
2. **Feature-specific**: The vulnerability only affects the `$data` JSON Schema feature which ESLint does not use in its current configuration
3. **ReDoS only**: Even if exploited, this is a ReDoS (Regular Expression Denial of Service) which would only affect linting performance, not application security
4. **No runtime exposure**: The vulnerable code path is never executed in deployed applications

## Recommendation

### Immediate Action

- ✅ **ACCEPT RISK** - The vulnerability poses minimal actual risk to the application
- ✅ **MONITOR** - Track ESLint releases for `@eslint/eslintrc` updates
- ✅ **DOCUMENT** - This assessment serves as documentation of the risk acceptance

### Long-term Action

- Monitor https://github.com/eslint/eslint/issues for ajv update progress
- When ESLint updates `@eslint/eslintrc` to use `ajv@8.18.0+`, immediately update dependencies
- Re-run `npm audit` after each ESLint release to check for resolution

## Verification

All project functionality verified with current dependencies:

- ✅ Build passes (`npm run build`)
- ✅ Linting works (`npm run lint`)
- ✅ TypeScript compilation (`npm run typecheck`)
- ✅ API tests (`npm run test:api`)

## References

- ESLint Issue Tracker: https://github.com/eslint/eslint/issues
- AJV Security Advisory: https://github.com/advisories/GHSA-2g4f-4pwh-qvx6
- CWE-400: https://cwe.mitre.org/data/definitions/400.html

## Sign-off

**Assessment performed by**: Sisyphus Autonomous Agent  
**Date**: 2026-02-18  
**Conclusion**: Risk accepted - upstream dependency issue with low actual risk to production systems
