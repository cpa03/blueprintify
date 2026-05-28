# @blueprint/shared

> Shared types, Zod schemas, and configuration for the Blueprint Generator project.

## Overview

The `@blueprint/shared` package provides TypeScript types, Zod validation schemas, and configuration constants used by both the API (Cloudflare Workers) and web (React) applications. This ensures type safety and validation consistency across the entire project.

## Installation

This is a private workspace package. It is automatically installed when you run `npm install` from the project root.

```bash
# Build the package (required after changes)
npm run build --workspace=@blueprint/shared
```

## Usage

### Importing Types

```typescript
import type {
  BlueprintRequest,
  TaskGenerationRequest,
  WizardState,
  EditorState,
  ExportFormat,
  StorageQuota,
} from "@blueprint/shared";
```

### Importing Schemas

```typescript
import {
  BlueprintRequestSchema,
  TaskGenerationRequestSchema,
  ExportFormatSchema,
} from "@blueprint/shared";

// Validate data
const result = BlueprintRequestSchema.safeParse(requestBody);
if (result.success) {
  const data: BlueprintRequest = result.data;
}
```

### Importing Configuration

```typescript
import { RETRY_CONFIG, VALIDATION_LIMITS, STORAGE_CONFIG, SSE_CONFIG } from "@blueprint/shared";
```

## Exports

### Zod Schemas

| Schema                        | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| `TechStackCategory`           | Enum for tech stack categories (frontend, backend, database, etc.) |
| `DatabaseSubcategory`         | Enum for database subcategories (relational, document, etc.)       |
| `TechStackItem`               | Individual technology with name, category, optional version        |
| `BlueprintRequestSchema`      | Request payload for blueprint generation                           |
| `TaskGenerationRequestSchema` | Request payload for task generation                                |
| `TaskStatusSchema`            | Enum for task status (todo, in_progress, done)                     |
| `TaskPrioritySchema`          | Enum for task priority (low, medium, high, critical)               |
| `TaskItemSchema`              | Individual task item                                               |
| `TaskListSchema`              | Array of task items                                                |
| `RefineRequestSchema`         | Request payload for content refinement                             |
| `TemplateSchema`              | Predefined project template                                        |
| `StreamChunkSchema`           | SSE chunk structure                                                |
| `GenerationResultSchema`      | Complete generation result                                         |
| `SuccessResponseSchema`       | Standard success response wrapper                                  |
| `ErrorResponseSchema`         | Standard error response                                            |
| `ErrorTypeSchema`             | Enum for error types                                               |
| `ErrorDetailSchema`           | Individual error detail                                            |
| `ExportFormatSchema`          | Export format enum (json, zip, markdown)                           |
| `ExportRequestSchema`         | Export request payload                                             |
| `ImportRequestSchema`         | Import request payload                                             |
| `ImportResultSchema`          | Import result with warnings                                        |
| `StorageQuotaSchema`          | Storage quota information                                          |
| `StorageClearRequestSchema`   | Storage clear confirmation request                                 |
| `StorageReportRequestSchema`  | Client storage usage report request                                |

### TypeScript Types

All schemas have corresponding TypeScript types inferred via `z.infer`:

- `TechStackCategoryType`
- `TechStackItemType`
- `BlueprintRequest`
- `TaskGenerationRequest`
- `RefineRequest`
- `Template`
- `StreamChunk`
- `GenerationResult`
- `WizardState`
- `WizardStep`
- `Session`
- `EditorState`
- `EditorTab`
- `ExportFormat`
- `ExportRequest`
- `ImportRequest`
- `StorageQuota`
- `StorageClearRequest`
- `StorageReportRequest`
- `ImportResult`

### Configuration

| Config                   | Description                               |
| ------------------------ | ----------------------------------------- |
| `RETRY_CONFIG`           | Retry settings (retries, delays, backoff) |
| `RETRYABLE_STATUS_CODES` | HTTP status codes eligible for retry      |
| `VALIDATION_LIMITS`      | Form and API validation limits            |
| `STORAGE_CONFIG`         | LocalStorage quota settings               |
| `DEBOUNCE_CONFIG`        | Debounce delays for auto-save             |
| `SECURITY_LIMITS`        | Content validation limits                 |
| `SSE_CONFIG`             | Server-Sent Events configuration          |
| `SSE_HEADERS`            | Standard SSE response headers             |
| `HTTP_HEADERS`           | Standard HTTP headers                     |
| `HTTP_STATUS`            | HTTP status code constants                |
| `ID_GENERATION_CONFIG`   | ID generation settings                    |
| `TIME_UNITS`             | Time conversion constants                 |
| `ROUTE_PATHS`            | API route path constants                  |
| `DEFAULT_URLS`           | Default URL configuration                 |
| `SHARED_DEFAULTS`        | Shared default values                     |
| `TECH_STACK_OPTIONS`     | Tech stack selection options              |

### Templates

```typescript
import { STARTER_TEMPLATES } from "@blueprint/shared";
```

### Utilities

```typescript
import { createDebouncedSaver } from "@blueprint/shared";
```

## Project Structure

```
packages/shared/
├── src/
│   ├── config.ts        # Configuration constants
│   ├── schema.ts        # Zod schemas and types
│   ├── templates.ts     # Predefined project templates
│   ├── types.ts         # Additional TypeScript types
│   └── utils/
│       └── debounce.ts  # Debounce utility
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## Available Scripts

```bash
# Build TypeScript to dist/
npm run build

# Clean dist folder
npm run clean

# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## Tech Stack

- **Type Safety**: TypeScript (strict mode)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Validation Example

```typescript
import { BlueprintRequestSchema } from "@blueprint/shared";
import type { BlueprintRequest } from "@blueprint/shared";

// Parse and validate incoming request
const parseBlueprintRequest = (data: unknown): BlueprintRequest => {
  const result = BlueprintRequestSchema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error.errors);
  }

  return result.data;
};
```

## Constants Usage

```typescript
import { VALIDATION_LIMITS, STORAGE_CONFIG } from "@blueprint/shared";

// Form validation
const isValidProjectName = (name: string): boolean => {
  return (
    name.length >= VALIDATION_LIMITS.PROJECT_NAME.MIN &&
    name.length <= VALIDATION_LIMITS.PROJECT_NAME.MAX
  );
};

// Storage check
const checkQuota = (used: number): boolean => {
  return used < STORAGE_CONFIG.QUOTA_BYTES * 0.9;
};
```

## Related Documentation

- [Main README](../../README.md)
- [API Documentation](../../docs/api-documentation.md)
- [Schema Documentation](../../docs/api-documentation.md#schemas)
