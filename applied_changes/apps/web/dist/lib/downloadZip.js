/**
 * Download Zip Service
 *
 * This service provides a convenient interface for downloading generated
 * documentation as a ZIP file containing the .docs folder structure.
 *
 * The actual implementation is in export.ts to maintain separation of concerns.
 */
import { exportAsZip as exportAsZipImpl } from "./export";
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
export async function downloadZip(options) {
    return exportAsZipImpl({
        blueprint: options.blueprint,
        tasks: options.tasks,
        projectName: options.projectName,
    });
}
// Re-export the underlying implementation for advanced use cases
export { exportAsZip } from "./export";
