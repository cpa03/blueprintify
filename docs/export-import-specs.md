# Export/Import Specifications for Blueprintify

## Overview

This document defines the specifications for exporting and importing blueprints in the Blueprintify application, enabling data portability and backup capabilities.

## Export Formats

### Supported Formats

1. **JSON Format** (.blueprint)
   - Primary format for full data export
   - Includes all session metadata and content
   - Machine-readable and version-controlled

2. **ZIP Archive** (.zip)
   - Contains both blueprint and task files
   - Includes metadata and supporting files
   - Suitable for distribution and sharing

3. **Markdown Files** (.md)
   - Individual markdown files for blueprint and tasks
   - Human-readable format
   - Compatible with markdown editors

### JSON Export Structure

```typescript
interface BlueprintExport {
  version: string; // Export format version
  exportType: ExportType; // Type of export
  metadata: ExportMetadata; // Export metadata
  sessions: ExportedSession[]; // Exported sessions
  schema: ExportSchema; // Schema information
}

enum ExportType {
  SINGLE_SESSION = "single-session", // Single session export
  MULTIPLE_SESSIONS = "multiple-sessions", // Multiple sessions
  BACKUP = "backup", // Full backup export
  TEMPLATE = "template", // Template export
}

interface ExportMetadata {
  exportedAt: string; // Export timestamp (ISO)
  exportedBy: string; // Exporter identifier
  sourceApp: string; // Source application
  appVersion: string; // Application version
  totalSessions: number; // Total sessions exported
  wordCount: number; // Total word count
  compression?: CompressionInfo; // Compression information
}

interface CompressionInfo {
  algorithm: string; // Compression algorithm
  originalSize: number; // Original size in bytes
  compressedSize: number; // Compressed size in bytes
  compressionRatio: number; // Compression ratio
}

interface ExportedSession {
  id: string; // Session identifier
  title: string; // Session title
  description?: string; // Session description
  wizardState: WizardState; // Wizard configuration
  content: SessionContent; // Session content
  metadata: SessionMetadata; // Session metadata
  tags: string[]; // Session tags
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
}

interface SessionContent {
  blueprint: string; // Blueprint content
  tasks: string; // Tasks content
  assets?: SessionAssets; // Associated assets
}

interface SessionAssets {
  images: AssetInfo[]; // Image assets
  documents: AssetInfo[]; // Document assets
  custom: AssetInfo[]; // Custom assets
}

interface AssetInfo {
  id: string; // Asset identifier
  name: string; // Asset name
  type: string; // Asset MIME type
  size: number; // Asset size in bytes
  data: string; // Base64 encoded data or URL
  checksum: string; // Asset checksum
}

interface ExportSchema {
  version: string; // Schema version
  format: string; // Format identifier
  compatibility: string[]; // Compatible versions
  migrationPath?: string; // Migration path information
}
```

### ZIP Archive Structure

```
blueprint-export.zip
├── manifest.json              # Export manifest and metadata
├── sessions/
│   ├── session-001/
│   │   ├── metadata.json      # Session metadata
│   │   ├── blueprint.md       # Blueprint content
│   │   ├── tasks.md          # Tasks content
│   │   └── assets/            # Session assets
│   │       ├── images/
│   │       └── documents/
│   └── session-002/
│       └── ...
├── templates/                 # Optional templates
│   └── ...
└── README.md                 # Export documentation
```

### Manifest.json Structure

```typescript
interface ExportManifest {
  version: string; // Manifest version
  exportInfo: ExportInfo; // Export information
  sessionIndex: SessionIndex[]; // Session index
  assetIndex: AssetIndex[]; // Asset index
  schema: ManifestSchema; // Schema information
}

interface ExportInfo {
  exportedAt: string; // Export timestamp
  exportedBy: string; // Exporter information
  sourceApp: string; // Source application
  format: string; // Export format
  totalSessions: number; // Total sessions
  totalAssets: number; // Total assets
  uncompressedSize: number; // Uncompressed size
}

interface SessionIndex {
  id: string; // Session ID
  path: string; // Relative path in archive
  title: string; // Session title
  description?: string; // Session description
  wordCount: number; // Word count
  assetCount: number; // Number of assets
  createdAt: string; // Creation timestamp
  updatedAt: string; // Update timestamp
}

interface AssetIndex {
  id: string; // Asset ID
  sessionId: string; // Parent session ID
  path: string; // Relative path in archive
  name: string; // Asset name
  type: string; // Asset type
  size: number; // Asset size
  checksum: string; // Asset checksum
}

interface ManifestSchema {
  version: string; // Schema version
  format: string; // Format identifier
  compatibility: string[]; // Compatible versions
}
```

## Import Specifications

### Import Validation

```typescript
interface ImportValidation {
  isValid: boolean; // Overall validation status
  errors: ValidationError[]; // Validation errors
  warnings: ValidationWarning[]; // Validation warnings
  recommendations: string[]; // Import recommendations
  compatibility: CompatibilityInfo; // Compatibility information
}

interface ValidationError {
  code: string; // Error code
  message: string; // Error message
  field?: string; // Related field
  severity: ErrorSeverity; // Error severity
}

enum ErrorSeverity {
  CRITICAL = "critical", // Import cannot proceed
  ERROR = "error", // Import with issues
  WARNING = "warning", // Import with warnings
  INFO = "info", // Informational
}

interface ValidationWarning {
  code: string; // Warning code
  message: string; // Warning message
  field?: string; // Related field
  action?: string; // Suggested action
}

interface CompatibilityInfo {
  isCompatible: boolean; // Overall compatibility
  supportedVersion: boolean; // Version is supported
  migrationRequired: boolean; // Migration required
  migrationPath: string[]; // Available migration paths
  deprecatedFeatures: string[]; // Deprecated features
}
```

### Import Process

```typescript
interface ImportProcess {
  phase: ImportPhase; // Current import phase
  progress: ImportProgress; // Import progress
  sessions: ImportSession[]; // Sessions to import
  conflicts: ImportConflict[]; // Import conflicts
  options: ImportOptions; // Import options
}

enum ImportPhase {
  VALIDATION = "validation", // Validation phase
  CONFLICT_RESOLUTION = "conflict-resolution", // Conflict resolution
  MIGRATION = "migration", // Migration phase
  IMPORT = "import", // Import phase
  POST_PROCESS = "post-process", // Post-processing phase
}

interface ImportProgress {
  currentPhase: ImportPhase; // Current phase
  totalPhases: number; // Total phases
  phaseProgress: number; // Phase progress (0-100)
  overallProgress: number; // Overall progress (0-100)
  estimatedTime?: number; // Estimated time remaining
}

interface ImportSession {
  source: ExportedSession; // Source session data
  target?: SessionMapping; // Target session mapping
  status: ImportStatus; // Import status
  conflicts: string[]; // Session conflicts
}

enum ImportStatus {
  PENDING = "pending", // Pending import
  CONFLICT = "conflict", // Has conflicts
  APPROVED = "approved", // Approved for import
  IMPORTED = "imported", // Successfully imported
  FAILED = "failed", // Import failed
  SKIPPED = "skipped", // Skipped import
}

interface ImportConflict {
  type: ConflictType; // Conflict type
  sessionId: string; // Session ID
  description: string; // Conflict description
  resolution?: ConflictResolution; // Conflict resolution
}

enum ConflictType {
  DUPLICATE_ID = "duplicate-id", // Duplicate session ID
  TITLE_CONFLICT = "title-conflict", // Title conflict
  SCHEMA_MISMATCH = "schema-mismatch", // Schema mismatch
  VERSION_INCOMPATIBLE = "version-incompatible", // Version incompatible
  CORRUPTION = "corruption", // Data corruption
}

interface ConflictResolution {
  action: ConflictAction; // Resolution action
  newValue?: string; // New value
  preserveOriginal: boolean; // Preserve original flag
}

enum ConflictAction {
  SKIP = "skip", // Skip import
  OVERWRITE = "overwrite", // Overwrite existing
  RENAME = "rename", // Rename imported
  MERGE = "merge", // Merge with existing
  DUPLICATE = "duplicate", // Create duplicate
}

interface ImportOptions {
  resolveConflicts: boolean; // Auto-resolve conflicts
  preserveIds: boolean; // Preserve original IDs
  importAssets: boolean; // Import assets
  overwriteExisting: boolean; // Overwrite existing sessions
  createBackup: boolean; // Create backup before import
  validateOnly: boolean; // Validation only mode
  migrationStrategy: MigrationStrategy; // Migration strategy
}

enum MigrationStrategy {
  STRICT = "strict", // Strict migration
  BEST_EFFORT = "best-effort", // Best effort migration
  SKIP_INCOMPATIBLE = "skip-incompatible", // Skip incompatible
}
```

## Implementation Architecture

### Export Implementation

```typescript
interface ExportService {
  exportSession(
    sessionId: string,
    format: ExportFormat,
    options: ExportOptions
  ): Promise<ExportResult>;
  exportMultipleSessions(
    sessionIds: string[],
    format: ExportFormat,
    options: ExportOptions
  ): Promise<ExportResult>;
  exportAllSessions(format: ExportFormat, options: ExportOptions): Promise<ExportResult>;
  createBackup(options: BackupOptions): Promise<BackupResult>;
}

enum ExportFormat {
  JSON = "json",
  ZIP = "zip",
  MARKDOWN = "markdown",
}

interface ExportOptions {
  includeAssets: boolean; // Include assets
  compress: boolean; // Compress output
  includeMetadata: boolean; // Include metadata
  template?: string; // Template to use
  filter?: ExportFilter; // Content filter
}

interface ExportResult {
  success: boolean; // Export success status
  data: string | Blob; // Export data
  filename: string; // Suggested filename
  mimeType: string; // MIME type
  size: number; // File size
  metadata: ExportResultMetadata; // Export result metadata
}

interface ExportResultMetadata {
  exportedAt: string; // Export timestamp
  format: string; // Export format
  sessionsCount: number; // Sessions exported
  assetsCount: number; // Assets exported
  compressionRatio?: number; // Compression ratio
}
```

### Import Implementation

```typescript
interface ImportService {
  validateImport(data: string | File, format: ImportFormat): Promise<ImportValidation>;
  previewImport(data: string | File, format: ImportFormat): Promise<ImportPreview>;
  importData(
    data: string | File,
    format: ImportFormat,
    options: ImportOptions
  ): Promise<ImportResult>;
  resolveConflicts(
    conflicts: ImportConflict[],
    resolutions: ConflictResolution[]
  ): Promise<boolean>;
}

enum ImportFormat {
  JSON = "json",
  ZIP = "zip",
  AUTO_DETECT = "auto-detect",
}

interface ImportPreview {
  sessions: ImportSession[]; // Sessions to import
  assets: AssetInfo[]; // Assets to import
  conflicts: ImportConflict[]; // Conflicts found
  warnings: ValidationWarning[]; // Import warnings
  recommendations: string[]; // Recommendations
}

interface ImportResult {
  success: boolean; // Import success status
  importedSessions: string[]; // Imported session IDs
  importedAssets: string[]; // Imported asset IDs
  skippedSessions: string[]; // Skipped session IDs
  conflicts: ImportConflict[]; // Remaining conflicts
  errors: ValidationError[]; // Import errors
  summary: ImportSummary; // Import summary
}

interface ImportSummary {
  totalSessions: number; // Total sessions processed
  importedSessions: number; // Successfully imported
  skippedSessions: number; // Skipped sessions
  failedSessions: number; // Failed sessions
  totalAssets: number; // Total assets processed
  importedAssets: number; // Successfully imported
}
```

## Error Handling

### Common Scenarios

1. **File Format Errors**: Unsupported or corrupted file formats
2. **Schema Validation Errors**: Invalid data structure or content
3. **Version Incompatibility**: Incompatible schema versions
4. **Storage Errors**: Insufficient storage or permission errors
5. **Network Errors**: Download/upload failures

### Recovery Mechanisms

1. **Backup Creation**: Automatic backup before import
2. **Rollback Capability**: Rollback failed imports
3. **Partial Import**: Import valid sessions, skip invalid ones
4. **Validation Mode**: Preview without importing
5. **Error Logging**: Comprehensive error logging and reporting

## Security Considerations

### Data Protection

1. **Input Validation**: Strict validation of imported data
2. **Content Sanitization**: Sanitize all imported content
3. **Asset Validation**: Validate and scan imported assets
4. **Size Limits**: Enforce reasonable size limits
5. **Permission Checks**: Verify user permissions

### Privacy Considerations

1. **Data Anonymization**: Option to anonymize sensitive data
2. **Asset Filtering**: Filter out sensitive assets
3. **User Consent**: Clear consent for data processing
4. **Data Minimization**: Export only necessary data

## Testing Strategy

### Test Coverage

1. **Format Validation Tests**: All format validation scenarios
2. **Schema Migration Tests**: Various schema migration scenarios
3. **Conflict Resolution Tests**: All conflict types and resolutions
4. **Performance Tests**: Large data import/export performance
5. **Security Tests**: Malicious data handling and security validation

### Test Scenarios

1. **Valid Imports**: Successful import of various valid formats
2. **Invalid Imports**: Handling of various invalid data scenarios
3. **Conflict Scenarios**: Different conflict types and resolutions
4. **Version Migration**: Migration between different schema versions
5. **Edge Cases**: Large files, special characters, binary assets

## Future Enhancements

### Potential Improvements

1. **Cloud Integration**: Direct cloud storage integration
2. **Collaborative Export**: Multi-user collaborative exports
3. **Version History**: Export with version history
4. **Advanced Filtering**: Advanced content filtering options
5. **Batch Operations**: Batch import/export operations
6. **API Integration**: Direct API-based import/export
7. **Template System**: Advanced template-based exports
