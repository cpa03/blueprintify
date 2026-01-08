interface ExportFiles {
    blueprint: string;
    tasks: string;
    projectName: string;
}
/**
 * Generate and download a ZIP file containing the docs folder
 */
export declare function exportAsZip(files: ExportFiles): Promise<void>;
/**
 * Copy text to clipboard with fallback
 */
export declare function copyToClipboard(text: string): Promise<boolean>;
/**
 * Format markdown for IDE pasting (normalize line endings)
 */
export declare function formatForIDE(content: string): string;
export {};
