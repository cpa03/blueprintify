/**
 * Download Zip Service
 *
 * This service provides a convenient interface for downloading generated
 * documentation as a ZIP file containing the .docs folder structure.
 *
 * The actual implementation is in export.ts to maintain separation of concerns.
 */
export interface DownloadZipOptions {
    /** The blueprint.md content */
    blueprint: string;
    /** The task.md content */
    tasks: string;
    /** Project name (used for zip filename and README) */
    projectName: string;
}
/**
 * Download the generated documentation as a ZIP file
 *
 * @param options - Configuration options for the ZIP file
 * @returns Promise that resolves when download is complete
 *
 * @example
 * ```ts
 * await downloadZip({
 *   blueprint: '# My Blueprint\n...',
 *   tasks: '# Tasks\n...',
 *   projectName: 'My Awesome Project'
 * });
 * ```
 */
export declare function downloadZip(options: DownloadZipOptions): Promise<void>;
export { exportAsZip } from "./export";
