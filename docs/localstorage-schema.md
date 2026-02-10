# LocalStorage Schema Design for Blueprint Persistence

## Overview

This document defines the localStorage schema for persisting blueprints across browser sessions in the Blueprintify application.

## Storage Schema

### Main Storage Key: `blueprintify_data`

```typescript
interface BlueprintifyStorage {
  version: string; // Schema version for migrations
  sessions: StoredSession[]; // Array of saved sessions
  settings: UserSettings; // User preferences
  metadata: StorageMetadata; // Storage metadata and stats
}
```

### Stored Session Interface

```typescript
interface StoredSession {
  id: string; // Unique session identifier
  title: string; // User-friendly session title
  description?: string; // Optional session description
  wizardState: WizardState; // Complete wizard configuration
  generatedBlueprint: string; // Generated blueprint content
  generatedTasks: string; // Generated tasks content
  editorState?: EditorState; // Editor state (active tab, dirty status)
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastAccessedAt: string; // ISO timestamp for sorting
  tags: string[]; // User-defined tags for organization
  isArchived: boolean; // Archive status
  metadata: SessionMetadata; // Additional session metadata
}
```

### User Settings Interface

```typescript
interface UserSettings {
  autoSave: boolean; // Auto-save enabled
  autoSaveInterval: number; // Auto-save interval in seconds
  maxSessions: number; // Maximum sessions to store
  defaultExportFormat: "json" | "zip"; // Default export format
  theme: "light" | "dark" | "auto"; // Theme preference
  showArchived: boolean; // Show archived sessions
  sortBy: "createdAt" | "updatedAt" | "lastAccessedAt" | "title"; // Sort preference
  sortOrder: "asc" | "desc"; // Sort order
}
```

### Storage Metadata Interface

```typescript
interface StorageMetadata {
  totalSessions: number; // Total sessions stored
  archivedSessions: number; // Archived sessions count
  storageUsed: number; // Bytes used (approximate)
  lastCleanup: string; // ISO timestamp of last cleanup
  schemaVersion: string; // Current schema version
  migrationHistory: Migration[]; // Migration history
}
```

### Session Metadata Interface

```typescript
interface SessionMetadata {
  version: string; // Session format version
  source: "generated" | "imported" | "manual"; // Session source
  wordCount: {
    // Word counts for content
    blueprint: number;
    tasks: number;
    total: number;
  };
  generationTime?: number; // Time taken to generate (ms)
  refinementCount: number; // Number of refinements made
  exportCount: number; // Number of times exported
}
```

### Migration Interface

```typescript
interface Migration {
  version: string; // Target version
  appliedAt: string; // ISO timestamp
  sessionsMigrated: number; // Number of sessions migrated
}
```

## Storage Operations

### Core Operations

1. **Save Session**: Store or update a session
2. **Load Session**: Retrieve a specific session
3. **List Sessions**: Get all sessions with metadata
4. **Delete Session**: Remove a session
5. **Archive Session**: Mark session as archived
6. **Export Sessions**: Export sessions as JSON
7. **Import Sessions**: Import sessions from JSON

### Auto-Save Strategy

- **Trigger Events**: Content changes, tab switches, wizard completion
- **Debounce**: 2-second debounce to prevent excessive writes
- **Conflict Resolution**: Last write wins with user notification
- **Error Handling**: Graceful degradation with retry logic

### Storage Management

1. **Quota Monitoring**: Track localStorage usage
2. **Cleanup Strategy**: Remove oldest sessions when quota exceeded
3. **Compression**: Optional compression for large content
4. **Validation**: Schema validation on load/save

## Error Handling

### Common Scenarios

1. **Quota Exceeded**: Cleanup old sessions, notify user
2. **Corrupted Data**: Attempt recovery, reset to defaults
3. **Browser Incompatibility**: Feature detection, graceful fallback
4. **Privacy Mode**: Disable persistence, notify user

### Recovery Mechanisms

1. **Backup Storage**: Maintain backup in sessionStorage
2. **Validation**: Strict schema validation with error recovery
3. **Migration**: Automatic schema migrations
4. **Reset**: Last resort reset option

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load session content on demand
2. **Caching**: Cache frequently accessed sessions
3. **Batching**: Batch multiple operations
4. **Compression**: Compress large content before storage

### Storage Limits

- **Typical Limit**: 5-10MB per domain
- **Target Usage**: Keep under 2MB for safety
- **Monitoring**: Real-time quota monitoring
- **Cleanup**: Automatic cleanup of old/archived sessions

## Security Considerations

### Data Protection

1. **No Sensitive Data**: Never store API keys or tokens
2. **Sanitization**: Sanitize all stored content
3. **Validation**: Strict input validation
4. **Encryption**: Optional client-side encryption for sensitive content

## Migration Strategy

### Version Management

1. **Semantic Versioning**: Use semantic versions for schema
2. **Backward Compatibility**: Maintain backward compatibility when possible
3. **Migration Scripts**: Automatic migration scripts
4. **Fallback Handling**: Graceful fallback for migration failures

### Migration Process

1. **Check Version**: Compare stored vs current version
2. **Apply Migrations**: Run migration scripts in order
3. **Validate Data**: Validate migrated data
4. **Update Metadata**: Update migration history

## Implementation Notes

### Key Implementation Points

1. **Type Safety**: Use TypeScript interfaces for all storage operations
2. **Error Boundaries**: Wrap storage operations in error boundaries
3. **Testing**: Comprehensive testing for all storage scenarios
4. **Monitoring**: Storage usage monitoring and reporting

### Integration Points

1. **Wizard State**: Direct integration with wizard state management
2. **Editor State**: Integration with CodeMirror editor state
3. **Export/Import**: Integration with export/import functionality
4. **Settings Panel**: Integration with user settings interface

## Future Enhancements

### Potential Improvements

1. **Cloud Sync**: Optional cloud synchronization
2. **Collaboration**: Shared sessions and collaboration features
3. **Version History**: Session version history and rollback
4. **Advanced Search**: Full-text search across sessions
5. **Analytics**: Usage analytics and insights
