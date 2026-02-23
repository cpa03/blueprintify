# Audit Command

Run security and dependency audits to identify vulnerabilities.

## Usage

```
/audit [--fix]
```

## Arguments

- `--fix` (optional): Attempt to fix vulnerabilities automatically

## Context

@AGENTS.md
@package.json

## Instructions

1. Run npm audit:

   ```bash
   npm audit
   ```

2. If vulnerabilities found and `--fix` provided:

   ```bash
   npm audit fix
   ```

3. For breaking changes that require manual review:

   ```bash
   npm audit fix --force
   ```

   ⚠️ Use `--force` with caution - may introduce breaking changes

4. Check for outdated dependencies:
   ```bash
   npm outdated
   ```

## Vulnerability Severity Levels

| Level        | Description                     | Action              |
| ------------ | ------------------------------- | ------------------- |
| **Critical** | Immediate exploitation possible | Fix immediately     |
| **High**     | Significant impact if exploited | Fix within 24 hours |
| **Moderate** | Limited impact                  | Fix within sprint   |
| **Low**      | Minimal impact                  | Fix when convenient |
| **Info**     | Informational only              | Review and decide   |

## Common Vulnerabilities

| Vulnerability         | Common Cause                | Fix                       |
| --------------------- | --------------------------- | ------------------------- |
| `Prototype Pollution` | Insecure object merging     | Update affected package   |
| `ReDoS`               | Vulnerable regex patterns   | Update or replace package |
| `Path Traversal`      | Insecure file path handling | Update affected package   |
| `XSS`                 | Insecure HTML rendering     | Update frontend packages  |

## Security Checklist

- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities
- [ ] Moderate vulnerabilities reviewed
- [ ] Dependencies up to date
- [ ] No deprecated packages

## Example Output

```bash
npm audit

# npm audit report

minimatch  <3.0.5
Severity: high
minimatch ReDoS vulnerability - https://github.com/advisories/GHSA-f9xv-qq9q-9w8j
fix available via `npm audit fix`
node_modules/eslint/node_modules/minimatch

2 vulnerabilities (1 moderate, 1 high)
```

## Success Criteria

- No critical or high vulnerabilities
- All vulnerabilities reviewed and documented
- Dependencies reasonably up to date
