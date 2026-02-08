import JSZip from "jszip";
import {
  EXPORT_CONFIG,
  README_TEMPLATE,
  DEFAULT_PROJECT_NAME,
} from "../config/constants";

interface ExportFiles {
  blueprint: string;
  tasks: string;
  projectName: string;
}

export async function exportAsZip(files: ExportFiles): Promise<void> {
  const zip = new JSZip();
  const docsFolder = zip.folder(".docs");

  if (!docsFolder) {
    throw new Error("Failed to create docs folder");
  }

  if (files.blueprint) {
    docsFolder.file("blueprint.md", files.blueprint);
  }

  if (files.tasks) {
    docsFolder.file("task.md", files.tasks);
  }

  docsFolder.file(
    "README.md",
    README_TEMPLATE(files.projectName || DEFAULT_PROJECT_NAME),
  );

  // Generate the ZIP
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: EXPORT_CONFIG.ZIP_COMPRESSION_LEVEL },
  });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${files.projectName.toLowerCase().replace(/\s+/g, "-")}-docs.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = `${EXPORT_CONFIG.COPY_TEXTAREA_OFFSET}px`;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Format markdown for IDE pasting (normalize line endings)
 */
export function formatForIDE(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}
