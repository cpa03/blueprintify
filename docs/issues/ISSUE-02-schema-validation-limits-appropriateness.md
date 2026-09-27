# Issue: Schema Validation Limits Reuse Inappropriate Project Name Limits

## Metadata
- **Category**: bug
- **Priority**: P1
- **Affected Files**:
  - `packages/shared/src/schema.ts`
- **Origin**: Open Code Review (OCR) Scan Findings #9, #10, #11

## Problem Description
Multiple Zod schemas incorrectly reuse `VALIDATION_LIMITS.PROJECT_NAME.MAX` (typically ~100 chars) as the maximum length for unrelated fields:

| Schema | Field | Current Limit Source | Issue |
|--------|-------|----------------------|-------|
| `TechStackItemSchema` | `name` | `PROJECT_NAME.MAX` | Tech stack item names (e.g. "React", "PostgreSQL", "Redis") should have their own reasonable limit (~50 chars). |
| `TaskItemSchema` | `id` | `PROJECT_NAME.MAX` | Task IDs (likely UUIDs or slugs) need separate limit (UUID = 36 chars). |
| `TaskItemSchema` | `title` | `PROJECT_NAME.MAX` | Task titles are different from project names; should have independent limit. |
| `TaskItemSchema` | `dependencies[]` | `PROJECT_NAME.MAX` | Dependency references (IDs) should not use project name limit. |
| `StreamChunkSchema` | `content` | `IMPORT_DATA_LENGTH` (5MB) | Streaming SSE chunk payloads should be small (e.g., 16KB), not entire import data. |

This creates two problems:
1. **Over-permissive validation**: Allows excessively long tech names, task titles, and chunk sizes that the UI/storage may not handle well.
2. **Maintenance coupling**: Changing the project name limit unintentionally affects unrelated schemas.

## Proposed Solution
Introduce dedicated validation limit constants per domain:
```typescript
export const VALIDATION_LIMITS = {
  PROJECT_NAME: { MIN: 1, MAX: 100 },
  TECH_STACK_ITEM_NAME: { MIN: 1, MAX: 50 },
  TASK_ID: { MIN: 1, MAX: 64 },        // UUID/slug
  TASK_TITLE: { MIN: 1, MAX: 200 },
  TASK_DEPENDENCY: { MIN: 1, MAX: 64 }, // reference to another task ID
  STREAM_CHUNK: { MAX: 16384 },          // 16 KB per SSE frame
  // ...existing...
};
```

Then update each schema to reference its appropriate constant.

## Acceptance Criteria
- [ ] `TechStackItemSchema.name` uses `TECH_STACK_ITEM_NAME.MAX`.
- [ ] `TaskItemSchema.id` uses `TASK_ID.MAX`.
- [ ] `TaskItemSchema.title` uses `TASK_TITLE.MAX`.
- [ ] `TaskItemSchema.dependencies` items use `TASK_DEPENDENCY.MAX`.
- [ ] `StreamChunkSchema.content` uses `STREAM_CHUNK.MAX`.
- [ ] All existing tests pass.
- [ ] New tests verify rejected payloads exceed the new limits.