import type JSZip from "jszip";
import { EXPORT_CONFIG, README_TEMPLATE, DEFAULT_PROJECT_NAME } from "../config/constants";
import { sanitizeMarkdown, validateAndSanitizeFileContent, handleSecurityError } from "./security";

import {
  generateReactProject,
  generateNodeProject,
  generatePythonProject,
  generateStaticProject,
} from "./templates";
import type { ExportFiles, ImportFile } from "./templates";

export async function exportAsZip(files: ExportFiles): Promise<void> {
  // Lazy load JSZip to reduce initial bundle size
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const projectName = files.projectName || DEFAULT_PROJECT_NAME;

  const sanitizedBlueprint = files.blueprint ? sanitizeMarkdown(files.blueprint) : "";
  const sanitizedTasks = files.tasks ? sanitizeMarkdown(files.tasks) : "";

  await generateProjectStructure(zip, {
    ...files,
    blueprint: sanitizedBlueprint,
    tasks: sanitizedTasks,
  });

  const docsFolder = zip.folder(EXPORT_CONFIG.DOCS_FOLDER);
  if (!docsFolder) {
    throw new Error(
      "Failed to create .docs folder in ZIP archive. This may indicate a memory issue or ZIP library error. Try reducing the content size or refreshing the page."
    );
  }

  if (sanitizedBlueprint) {
    docsFolder.file(EXPORT_CONFIG.BLUEPRINT_FILENAME, sanitizedBlueprint);
  }

  if (sanitizedTasks) {
    docsFolder.file(EXPORT_CONFIG.TASK_FILENAME, sanitizedTasks);
  }

  // Include project metadata for better connectivity between systems
  const metadata = {
    projectName: files.projectName,
    description: files.description,
    techStack: files.techStack.map((item) => ({
      name: item.name,
      category: item.category,
    })),
    features: files.features,
    generatedAt: new Date().toISOString(),
    version: EXPORT_CONFIG.METADATA_VERSION,
  };
  docsFolder.file(EXPORT_CONFIG.METADATA_FILENAME, JSON.stringify(metadata, null, 2));

  docsFolder.file(EXPORT_CONFIG.README_FILENAME, README_TEMPLATE(projectName));

  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: EXPORT_CONFIG.ZIP_COMPRESSION_LEVEL },
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split(EXPORT_CONFIG.DATE_FORMAT_SEPARATOR)[0]}${EXPORT_CONFIG.ZIP_FILENAME_SUFFIX}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importFile({ file, onImport, onError }: ImportFile): Promise<void> {
  try {
    const validation = await validateAndSanitizeFileContent(file);
    if (!validation.isValid) {
      onError(validation.error || "File validation failed");
      return;
    }

    onImport(validation.content || "");
  } catch (error) {
    const securityError = handleSecurityError(error);
    onError(securityError.message);
  }
}

async function generateProjectStructure(zip: JSZip, files: ExportFiles): Promise<void> {
  const { techStack, projectName, description, features } = files;
  const normalizedProjectName = (projectName || DEFAULT_PROJECT_NAME)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const techStackNames = techStack.map((item) => item.name.toLowerCase());

  const isReact = techStackNames.includes("react") || techStackNames.includes("next.js");
  const isNode =
    techStackNames.includes("node.js") ||
    techStackNames.includes("express") ||
    techStackNames.includes("hono");
  const isPython =
    techStackNames.includes("python") ||
    techStackNames.includes("django") ||
    techStackNames.includes("flask");
  if (isReact) {
    await generateReactProject(zip, normalizedProjectName, description, features, techStack);
  } else if (isNode) {
    await generateNodeProject(zip, normalizedProjectName, description, features, techStack);
  } else if (isPython) {
    await generatePythonProject(zip, normalizedProjectName, description, features, techStack);
  } else {
    await generateStaticProject(zip, normalizedProjectName, description, features, techStack);
  }
}

export { copyToClipboard, formatForIDE } from "./clipboard";
