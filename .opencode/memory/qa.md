# QA Patterns & Conventions

## Testing Strategy

- Unit tests for all business logic.
- Integration tests for API endpoints and workflows.
- E2E tests for critical user flows.
- Visual regression tests for UI components (Playwright).

## Test Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run test`          | Run web app tests (Vitest)                       |
| `npm run test:api`      | Run API tests (Vitest + Cloudflare Workers pool) |
| `npm run test:all`      | Run all tests across web and API                 |
| `npm run test:coverage` | Generate coverage report (web)                   |
| `npm run lint`          | ESLint for .ts/.tsx files                        |
| `npm run typecheck`     | TypeScript type checking                         |
| `npm run build`         | Production build                                 |

## Test Structure

- `apps/web/src/**/*.test.ts(x)` - Frontend unit/integration tests
- `apps/api/src/**/*.test.ts` - API unit/integration tests
- `apps/web/e2e/*.spec.ts` - E2E visual regression tests (Playwright)

## Coverage Targets

- Overall: 80% minimum
- Critical paths: 95% minimum
- API endpoints: 100% required
- Security functions: 100% required

## Lessons Learned

### 2026-02-18 QA Review

- **Vitest Configuration**: Web and API apps use separate Vitest configs. API uses `@cloudflare/vitest-pool-workers` for Workers-specific testing.
- **No Prettier Config**: Repository lacks explicit Prettier configuration. Formatting rules managed through ESLint.
- **CI Gating**: Uses OpenCode AI for PR validation. Build/lint/test must pass before merge.
- **Test Independence**: Tests must be independent - Test A should not depend on Test B.
- **Deterministic Tests**: Avoid flaky tests that rely on timing or external state.

### Best Practices

1. Always run `npm run typecheck && npm run lint && npm run test:all` before creating PRs
2. Sync with main branch before and after fixes to minimize conflicts
3. All warnings must be fixed - warnings are not acceptable in CI
4. Use `--run` flag for CI tests (no watch mode)

### 2026-02-18 QA Audit Findings

**CI/CD Workflow Issues (Requires Workflow Permissions)**

The following issues were identified in `.github/workflows/` but require workflow permissions to fix:

1. **Filename with space**: `on pull.yml` should be renamed to `on-pull.yml`
   - Problematic for shell commands and CI systems
   - Location: `.github/workflows/on pull.yml`

2. **Line ending inconsistency**: Workflow files have CRLF instead of LF
   - `.gitattributes` specifies `*.yml text eol=lf`
   - Files affected: `on pull.yml`, `pr-gatekeeper.yml`

3. **Outdated runner version**: `on pull.yml` uses `ubuntu-22.04-arm`
   - Should be updated to `ubuntu-24.04-arm` per AGENTS.md

4. **Invalid action versions**: `on pull.yml` uses non-existent versions
   - `actions/checkout@v6` → should be `@v4`
   - `actions/setup-node@v6` → should be `@v4`

**Test Status (2026-02-19)**

- All 299 tests pass (218 web + 81 API)
- TypeScript: No errors
- ESLint: No errors
- 1 skipped test (in security.test.ts)
- No TODO/FIXME comments related to QA in source code
