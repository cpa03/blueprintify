# LocalStorage Schema for Blueprint Persistence

## Overview

This document describes the actual localStorage implementation used by the Blueprintify web application to persist wizard and editor state across browser sessions. The frontend persists flat, per-store state snapshots under namespace-prefixed keys — there is no monolithic `blueprintify_data` root key, no session history, and no user settings model. Each persisted payload is wrapped in a versioned envelope (`{ data, metadata }`) so payloads can be migrated as the schema evolves.

## Key Derivation

All keys are derived at runtime from the shared storage namespace plus a per-purpose suffix (see `apps/web/src/config/keys.ts`):

```typescript
// packages/shared/src/config/core.ts
SHARED_DEFAULTS.STORAGE_NAMESPACE = "blueprint";

// apps/web/src/config/keys.ts
const createKey = (key: string): string => `${NAMESPACE}-${key}`;
```

### Application Keys

| Key | Purpose | Status |
| --- | --- | --- |
| `blueprint-wizard` | Persisted wizard form state (flat snapshot) | Active |
| `blueprint-editor` | Persisted editor content (blueprint + tasks markdown) | Active |
| `blueprint-reduced-motion` | User override for reduced-motion preference | Active |
| `blueprint-shortcuts-discovered` | Whether the shortcuts modal was shown once | Active |
| `blueprint-theme` | Reserved theme preference key | Defined, not written |
| `blueprint-preferences` | Reserved preferences key | Defined, not written |
| `blueprint-last-visited` | Reserved last-visited tracking key | Defined, not written |
| `blueprint-onboarding-completed` | Reserved onboarding flag key | Defined, not written |
| `blueprint-recent-templates` | Reserved recent templates key | Defined, not written |

The five reserved keys are declared in `STORAGE_KEYS` but are not currently read or written anywhere in the codebase; they exist for future use and are documented here for completeness.

### Internal Keys

| Key | Purpose |
| --- | --- |
| `__backup__blueprint-wizard` | Backup snapshot history for wizard payloads |
| `__backup__blueprint-editor` | Backup snapshot history for editor payloads |
| `__storage_test__` | Availability probe key (written/removed at startup) |
| `__privacy_test__` | Privacy-mode probe key (written/removed at startup) |

Backup keys are built from `STORAGE_KEY_PREFIXES.BACKUP` (`__backup__`) plus the storage key; test keys come from `STORAGE_KEY_PREFIXES.STORAGE_TEST` / `PRIVACY_TEST` (`packages/shared/src/config/storage.ts`).

## Persisted Payload Shapes

### Wizard State: `blueprint-wizard`

Persisted by the wizard store through the shared persistence utility. The stored data is a flat subset of store state — not a session record:

```typescript
{
  data: {
    projectName: string;      // Project name
    description: string;      // Project description
    techStack: TechStackItemType[]; // Selected technologies (name, category, ...)
    features: string[];       // Selected feature list
    targetAudience: string;   // Target audience description
    constraints: string;      // Project constraints
  },
  metadata: StorageMetadata
}
```

Source: `PersistedWizardData` in `apps/web/src/store/wizard.ts` (wizard.ts:80-83, persist selector at wizard.ts:93-100). Fields omitted from persistence: `currentStep` and all store actions.

### Editor State: `blueprint-editor`

Persisted by the editor store. Only the two markdown content buffers are stored; runtime fields such as `activeTab`, `isDirty`, `isGenerating`, and `generationProgress` are intentionally excluded:

```typescript
{
  data: {
    blueprintContent: string;  // Blueprint markdown content
    tasksContent: string;      // Tasks markdown content
  },
  metadata: StorageMetadata
}
```

Source: `PersistedEditorData` in `apps/web/src/store/editor.ts` (editor.ts:89-90, persist selector at editor.ts:100-103).

### Versioned Payload Envelope

Every payload written through the `StorageService` is wrapped with metadata so the storage layer can validate and migrate it on read:

```typescript
interface StorageMetadata {
  version: number;   // Schema version of the payload
  createdAt: string; // ISO timestamp of first write
  updatedAt: string; // ISO timestamp of last write
  checksum: string;  // Hash of the payload used for corruption detection
}
```

The envelope is serialized as `JSON.stringify({ data, metadata })`. `version` defaults to `STORAGE_CONFIG.CURRENT_SCHEMA_VERSION` (currently `1`). On read, `validateAndMigrate` checks whether the stored version is older than the current version and runs registered migrations when applicable (see Migration).

### Simple Flag Keys

The following keys store raw string values without the versioned envelope:

| Key | Value | Written by |
| --- | --- | --- |
| `blueprint-reduced-motion` | `"true"` or `"false"` (absent = follow system preference) | `ReducedMotionContext.tsx` |
| `blueprint-shortcuts-discovered` | `"true"` | `App.tsx` |

`blueprint-reduced-motion` is removed (not set to `"false"`) when the user resets to the system preference. `blueprint-shortcuts-discovered` is read with `localStorage.getItem(...) === "true"` and set to `"true"` after the shortcuts modal is first shown.

### Backup Entries: `__backup__<key>`

Each backup key holds a JSON array of snapshot entries:

```typescript
interface BackupEntry {
  timestamp: number;      // Epoch ms when the backup was created
  data: string;           // Raw serialized payload of the main key
  metadata: StorageMetadata;
}
```

Up to `STORAGE_LOCAL_DEFAULTS.MAX_BACKUP_ENTRIES` (5) backups are retained per key; older entries are shifted out.

## Persistence Behavior

### Auto-Save (Debounced)

Both stores persist through the shared utility `createPersistedStore` (`apps/web/src/store/persistence.ts`), which provides `loadState`, `debouncedSave`, `flushSave`, and `cancelSave`:

- Every mutating action calls `debouncedSave(get)`, which schedules a write after a debounce delay and resets the timer on subsequent calls.
- Debounce delays come from `DEBOUNCE_CONFIG` (`packages/shared/src/config/storage.ts`):
  - Wizard: `WIZARD_SAVE = 300` ms
  - Editor: `EDITOR_SAVE = 500` ms
- `flushSave` (exposed on the editor store as `flushStorage`) immediately persists any pending write.
- `cancelSave` is invoked by both stores' `reset()` before clearing state.

### Load on Startup

On store initialization, `loadState` reads the persisted payload and merges it into the store state (merge semantics preserve the action functions installed by Zustand). Read failures are caught and logged with `STORAGE_ERROR_MESSAGES.LOAD_FAILED`; the store falls back to its initial state.

### Reset

`reset()` on either store cancels any pending debounced write, restores the initial state, and removes the corresponding storage key (`wizardStorage.remove()` / `editorStorage.remove()`).

### Editor Content Sanitization

Before any editor content is persisted (or appended), `validateEditorContent` runs the content through `sanitizeForStorage` from `apps/web/src/lib/security.ts`. Content that fails validation aborts the write and surfaces `STORAGE_ERROR_MESSAGES.SAVE_FAILED`. The security module is loaded via a dynamic import that starts at module evaluation time.

## Schema Versioning and Migration

- `STORAGE_CONFIG.CURRENT_SCHEMA_VERSION = 1` and `LEGACY_SCHEMA_VERSION = 1` (`packages/shared/src/config/storage.ts`).
- The storage layer (`apps/web/src/lib/storage.ts`) implements a migration framework: `SchemaMigration { fromVersion, toVersion, migrate }`. On read, payloads whose `metadata.version` is below the current version are passed through the registered migrations in ascending `fromVersion` order; unversioned legacy payloads are treated as version `LEGACY_SCHEMA_VERSION`.
- No migrations are currently registered on the wizard or editor storage services (`wizardStorage` / `editorStorage` in `apps/web/src/lib/storage.ts:818-831`); the `version` field exists so migrations can be added without a storage format break. Migration failures surface as `MIGRATION_ERROR`.

## Backup and Recovery

- Before every write and deletion (and before `clear`), `createBackup` snapshots the current value of the key into the `__backup__<key>` array (max 5 entries).
- If a read fails (corrupt JSON, invalid metadata), `recoverFromBackup` walks the backups in reverse chronological order, validates each snapshot, restores the first valid one back to the main key, and returns it. If no backup recovers, the read throws a `CORRUPTED_DATA` error.
- Backup failures are non-fatal: they log a warning and do not block the primary operation.

## Quota Management

- Total quota: `STORAGE_CONFIG.QUOTA_BYTES = 5 * 1024 * 1024` (5 MiB, the typical browser localStorage limit).
- Warning threshold: `WARNING_THRESHOLD_PERCENT = 90` — storage health reports unhealthy above 90% usage.
- Writes are refused (`QUOTA_EXCEEDED`) when remaining space drops below `QUOTA_WARNING_THRESHOLD_KB = 1` KB.
- Usage is tracked with a running byte estimate, counting key and value lengths as UTF-16 (2 bytes per character), updated incrementally on each write/delete to avoid O(n) reserialization.
- The estimate is drift-corrected by a full iteration of `localStorage` every 10 minutes (`FULL_RECALCULATION_INTERVAL_MS`) and is invalidated by the cross-tab `storage` event.
- Quota data is exposed via `StorageService.checkHealth()` / `getHealth()` (`{ used, total, remaining, percentage }`).

## Error Handling

- All `StorageService` operations run through error boundaries that record metrics (`StorageMetrics`) and health state, and wrap failures in a typed `StorageError` with an error type from `STORAGE_ERROR_TYPE_VALUES` (e.g. `BROWSER_UNSUPPORTED`, `PRIVACY_MODE`, `QUOTA_EXCEEDED`, `CORRUPTED_DATA`, `MIGRATION_ERROR`).
- Write operations retry transient failures up to `DEFAULT_MAX_RETRIES` (3) with linear backoff (`DEFAULT_RETRY_DELAY_MS = 100` ms, `delay * attempt`).
- Startup checks probe browser support (`isLocalStorageSupported`) and private-browsing mode (`isPrivacyMode`) using the test keys; both throw typed errors when unavailable.
- `getStorageErrorMessage` maps `StorageError` types to user-facing messages (`STORAGE_ERROR_MESSAGES`); `withStorageRecovery` provides a fallback wrapper for callers.

## Security Considerations

- Editor content is sanitized before storage (see Editor Content Sanitization) to prevent stored XSS from executing when content is re-rendered.
- No API keys, tokens, or other secrets are ever persisted to localStorage.
- Payloads are validated structurally on read (object shape, metadata shape); malformed data is rejected and routed to backup recovery.

## Not Implemented

The following were described in earlier drafts of this document but do not exist in the codebase and are intentionally absent:

- A single `blueprintify_data` root key aggregating sessions, settings, and metadata.
- A `StoredSession` model (`id`, `title`, `tags`, `isArchived`, timestamps, session metadata) and any session list/history.
- A `UserSettings` model (auto-save interval, max sessions, export format, sort preferences).
- Session-level operations: list, archive, delete, import/export of individual sessions.
- Migration history tracking, client-side content compression, or client-side encryption.
