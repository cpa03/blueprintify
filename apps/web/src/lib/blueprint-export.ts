import type { WizardState, TechStackItemType } from "@blueprint/shared";
import {
  BlueprintExportSchema,
  BlueprintExportV090Schema,
  CURRENT_SCHEMA_VERSION,
} from "@blueprint/shared";
import { z } from "zod";

// Local types for now until shared package exports are properly set up
export type BlueprintExport = z.infer<typeof BlueprintExportSchema>;
export type BlueprintExportV090 = z.infer<typeof BlueprintExportV090Schema>;
import { EXPORT_CONFIG } from "../config/constants";

// ===== Export Functions =====

export interface ExportData {
  wizardState: WizardState;
  blueprintContent: string;
  tasksContent?: string;
}

export async function exportBlueprintAsJSON(data: ExportData): Promise<void> {
  const exportData: BlueprintExport = {
    version: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    projectName: data.wizardState.projectName,
    description: data.wizardState.description,
    techStack: data.wizardState.techStack,
    features: data.wizardState.features,
    targetAudience: data.wizardState.targetAudience,
    constraints: data.wizardState.constraints,
    blueprintContent: data.blueprintContent,
    tasksContent: data.tasksContent,
    metadata: {
      generator: "Blueprintify",
      platform: "Web",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    },
  };

  // Validate export data against schema
  const validationResult = BlueprintExportSchema.safeParse(exportData);
  if (!validationResult.success) {
    throw new Error(
      `Export validation failed: ${validationResult.error.message}`,
    );
  }

  // Create JSON blob
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `${data.wizardState.projectName
    .toLowerCase()
    .replace(/\s+/g, "-")}-blueprint.json`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== Import Functions =====

export interface ImportResult {
  wizardState: WizardState;
  blueprintContent: string;
  tasksContent?: string;
  version: string;
  migrated: boolean;
}

export async function importBlueprintFromJSON(
  file: File,
): Promise<ImportResult> {
  // Validate file type
  if (!file.name.toLowerCase().endsWith(".json")) {
    throw new Error("Invalid file type. Please select a JSON file.");
  }

  // Read file content
  const jsonString = await file.text();

  try {
    const parsedData = JSON.parse(jsonString);

    // Handle different schema versions
    if (parsedData.version === "0.9.0" || !parsedData.version) {
      return migrateFromV090(parsedData);
    }

    // Validate against current schema
    const validationResult = BlueprintExportSchema.safeParse(parsedData);
    if (!validationResult.success) {
      throw new Error(
        `Import validation failed: ${validationResult.error.message}`,
      );
    }

    const validatedData = validationResult.data;

    return {
      wizardState: {
        currentStep: "review",
        projectName: validatedData.projectName,
        description: validatedData.description,
        techStack: validatedData.techStack,
        features: validatedData.features || [],
        targetAudience: validatedData.targetAudience || "",
        constraints: validatedData.constraints || "",
      },
      blueprintContent: validatedData.blueprintContent,
      tasksContent: validatedData.tasksContent,
      version: validatedData.version,
      migrated: false,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid JSON format. Please check the file content.");
    }
    throw error;
  }
}

// ===== Migration Functions =====

function migrateFromV090(data: any): ImportResult {
  // Handle legacy v0.9.0 format
  const legacyData = data as BlueprintExportV090;

  return {
    wizardState: {
      currentStep: "review",
      projectName: legacyData.projectName,
      description: legacyData.description,
      techStack: legacyData.techStack,
      features: legacyData.features || [],
      targetAudience: legacyData.targetAudience || "",
      constraints: legacyData.constraints || "",
    },
    blueprintContent: legacyData.blueprintContent,
    tasksContent: legacyData.tasksContent,
    version: "0.9.0",
    migrated: true,
  };
}

// ===== Validation Functions =====

export function validateImportFile(file: File): string[] {
  const errors: string[] = [];

  // Check file extension
  if (!file.name.toLowerCase().endsWith(".json")) {
    errors.push("File must have .json extension");
  }

  // Check file size (max 10MB)
  const maxSize = EXPORT_CONFIG.MAX_IMPORT_FILE_SIZE || 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(
      `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
    );
  }

  return errors;
}

// ===== Utility Functions =====

export function createExportFilename(projectName: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return `${sanitizedName}-blueprint-${timestamp}.json`;
}
