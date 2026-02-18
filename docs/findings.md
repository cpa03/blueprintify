# Findings

> **Incoming signals and observations** - cleared after each orchestration cycle.

---

## Database-Architect Observations (2026-02-18)

### Fixed: Recursive Trigger Bug

- **File**: `schema.sql`
- **Issue**: Timestamp update triggers performed `UPDATE` on the same table they were attached to, causing infinite recursion
- **Fix**: Removed problematic triggers; timestamps handled at application layer
- **Impact**: Prevents potential production outages from infinite loops

### Architecture Notes

- D1 bindings configured in `wrangler.toml` for local/production/staging
- `MockDatabaseService` in `apps/api/src/db/index.ts` correctly handles `updated_at`
- No migrations directory exists - schema managed via single `schema.sql` file
- Consider implementing `D1DatabaseService` for production when database persistence needed

---
