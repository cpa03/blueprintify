# Security Engineer - Long-term Memory

## Role

Security Engineer - responsible for vulnerability management, code auditing, and secrets hygiene.

## Priority Security Issues

### High Priority

- **Issue #905**: Share route ID validation allows potential injection - **FIXED** ✅
- **Issue #892**: Add ownership verification for share deletion - **FIXED** ✅
- **Issue #891**: Add production warning when API_KEY not configured - **FIXED** ✅
- **Issue #890**: Replace CORS wildcard default with explicit origin validation - **FIXED** ✅
- **Issue #906**: Export/Import endpoints missing rate limiting - **FIXED** ✅

### Medium Priority

- **Issue #907**: Missing requestId in share route error responses - **FIXED** ✅\*\* (Just completed)

### P2/Low Priority

- **Issue #864**: Disable source map upload in production - **FIXED** ✅

## Security Patterns Implemented

### Input Validation

- Share ID validation uses regex pattern: `/^[a-zA-Z0-9_-]{10,}$/`
- Zod schema validation for all API inputs

### Authentication

- Constant-time API key comparison to prevent timing attacks
- Production mode requires API_KEY to be set
- Development mode allows bypass with warning

### CORS Security

- Default CORS origin is `http://localhost:3000` (dev only)
- Production warning when wildcard "\*" is used in production
- Support for multiple origins via comma-separated list

### Rate Limiting

- Applied to all resource-intensive endpoints:
  - `/generate` - strict rate limit
  - `/tasks` - strict rate limit
  - `/refine` - strict rate limit
  - `/export` - standard rate limit
  - `/import` - standard rate limit
  - `/storage/quota` - standard rate limit
  - `/storage/clear` - strict rate limit

### Error Response Standardization

- All error responses include:
  - `success: false`
  - `error.type` - error category
  - `error.message` - user-friendly message
  - `error.code` - machine-readable code
  - `error.timestamp` - ISO timestamp
  - `error.requestId` - for tracing (where applicable)

### Ownership & Authorization

- Share deletion requires ownership verification
- Tracks request source (api_key_user vs anonymous)
- Prevents unauthorized deletion of shares

### Source Map Protection

- Production environment disables source map upload
- Development has source maps enabled for debugging

## Files Monitored

- `apps/api/src/config/env.ts` - Environment configuration
- `apps/api/src/middleware/auth.ts` - Authentication middleware
- `apps/api/src/middleware/rateLimit.ts` - Rate limiting
- `apps/api/src/routes/share.ts` - Share functionality
- `apps/api/src/routes/export.ts` - Export endpoint
- `apps/api/src/routes/import.ts` - Import endpoint
- `apps/api/wrangler.toml` - Worker configuration

## Testing Commands

```bash
# Run API tests
npm test --workspace=@blueprint/api

# Run typecheck
npm run typecheck

# Run lint
npm run lint
```

## Notes

- All security fixes are documented with "SECURITY FIX #XXX" comments
- Tests are in `*.test.ts` files in same directories
- Use constant-time comparison for secrets to prevent timing attacks
