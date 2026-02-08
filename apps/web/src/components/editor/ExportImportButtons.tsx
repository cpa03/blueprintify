import { useRef, useState } from "react";
import {
  exportBlueprintAsJSON,
  importBlueprintFromJSON,
  validateImportFile,
  type ImportResult,
} from "../../lib/blueprint-export";
import { useWizardStore } from "../../store/wizard";
import { useEditorStore } from "../../store/editor";
import { useToastStore } from "../../store/toast";

interface ExportImportButtonsProps {
  hasContent: boolean;
  onImportComplete?: (result: ImportResult) => void;
}

export function ExportImportButtons({
  hasContent,
  onImportComplete,
}: ExportImportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const wizardState = useWizardStore();
  const { blueprintContent, tasksContent } = useEditorStore();
  const { addToast } = useToastStore();

  const handleExportJSON = async () => {
    if (!wizardState.projectName || !blueprintContent) {
      addToast(
        "Cannot export: missing project name or blueprint content",
        "error",
      );
      return;
    }

    setIsExporting(true);
    try {
      await exportBlueprintAsJSON({
        wizardState,
        blueprintContent,
        tasksContent: tasksContent || undefined,
      });

      addToast("Blueprint exported successfully as JSON", "success");
    } catch (error) {
      addToast(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationErrors = validateImportFile(file);
    if (validationErrors.length > 0) {
      addToast(`Invalid file: ${validationErrors.join(", ")}`, "error");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importBlueprintFromJSON(file);

      wizardState.setProjectName(result.wizardState.projectName);
      wizardState.setDescription(result.wizardState.description);
      wizardState.setTechStack(result.wizardState.techStack);
      wizardState.clearFeatures();
      result.wizardState.features.forEach((feature) =>
        wizardState.addFeature(feature),
      );
      wizardState.setTargetAudience(result.wizardState.targetAudience);
      wizardState.setConstraints(result.wizardState.constraints);
      wizardState.setStep("review");

      const { setBlueprintContent, setTasksContent } =
        useEditorStore.getState();
      setBlueprintContent(result.blueprintContent);
      if (result.tasksContent) {
        setTasksContent(result.tasksContent);
      }

      const message = result.migrated;
      const successMessage = result.migrated
        ? `Blueprint imported successfully (migrated from v${result.version})`
        : "Blueprint imported successfully";

      addToast(successMessage, "success");

      onImportComplete?.(result);
    } catch (error) {
      addToast(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportJSON}
          disabled={!hasContent || isExporting}
          className="btn-ghost text-sm disabled:opacity-50"
          title="Export blueprint as JSON file"
          aria-label="Export blueprint as JSON file"
        >
          {isExporting ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">⏳</span>
              Exporting...
            </span>
          ) : (
            <span>📄 Export JSON</span>
          )}
        </button>

        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="btn-ghost text-sm disabled:opacity-50"
          title="Import blueprint from JSON file"
          aria-label="Import blueprint from JSON file"
        >
          {isImporting ? (
            <span className="flex items-center gap-1">
              <span className="animate-spin">⏳</span>
              Importing...
            </span>
          ) : (
            <span>📂 Import JSON</span>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import blueprint file"
      />
    </>
  );
}
