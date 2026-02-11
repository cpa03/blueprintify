import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "../../store/session";
import { useToast } from "../../store/toast";
import type { StoredSession } from "../../types/storage";
import clsx from "clsx";

interface ExportImportManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportImportManager({ isOpen, onClose }: ExportImportManagerProps) {
  const { exportSessions, importSessions, sessions } = useSessionStore();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const toast = useToast();

  const handleExport = useCallback(async (format: "json" | "zip") => {
    setIsExporting(true);
    
    try {
      if (format === "json") {
        const jsonData = await exportSessions();
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `blueprintify-sessions-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const response = await fetch("/api/export", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format, sessionIds: sessions.map(s => s.id) }),
        });

        if (!response.ok) {
          throw new Error(`Export failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `blueprintify-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success(`Exported ${format.toUpperCase()} file successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${format}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(false);
    }
  }, [exportSessions, sessions]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await importSessions(text);
      setImportResult(result);
      toast.success(`Imported ${result.imported} sessions, skipped ${result.skipped}`);
    } catch (error) {
      toast.error(`Failed to import sessions: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  }, [importSessions]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-800 rounded-lg w-full max-w-md p-6 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Export & Import</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-200 transition-colors"
          >
            ✕
          </button>
        </div>

            <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Export Sessions</h3>
            <div className="text-sm text-dark-300 mb-4">
              Export your sessions as JSON for backup or migration to other instances.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport("json")}
                disabled={isExporting || sessions.length === 0}
                className={clsx(
                  "flex-1 px-4 py-3 rounded-lg transition-colors font-medium",
                  isExporting
                    ? "bg-dark-700 text-dark-400"
                    : "bg-primary-600 hover:bg-primary-700 text-white",
                  sessions.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                )}
              >
                {isExporting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting JSON...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-lg">📄</div>
                    <span>Export JSON</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleExport("zip")}
                disabled={isExporting || sessions.length === 0}
                className={clsx(
                  "flex-1 px-4 py-3 rounded-lg transition-colors font-medium",
                  isExporting
                    ? "bg-dark-700 text-dark-400"
                    : "bg-accent-emerald hover:bg-accent-emerald/90 text-dark-900",
                  sessions.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                )}
              >
                {isExporting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
                    Exporting ZIP...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-lg">📦</div>
                    <span>Export ZIP</span>
                  </div>
                )}
              </button>
            </div>

            {sessions.length === 0 && (
              <div className="text-sm text-accent-pink bg-accent-pink/10 p-3 rounded-lg">
                No sessions to export. Create some sessions first!
              </div>
            )}
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Import Sessions</h3>
            <div className="text-sm text-dark-300 mb-4">
              Import sessions from a previously exported JSON file.
            </div>
            <label className={clsx(
              "flex-1 px-4 py-3 bg-accent-emerald hover:bg-accent-emerald/90 text-dark-900 rounded-lg transition-colors font-medium cursor-pointer text-center",
              isImporting && "opacity-50 cursor-not-allowed"
            )}>
              {isImporting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin"></div>
                  Importing...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-lg">📁</div>
                  <span>Import JSON File</span>
                </div>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* Import Result */}
          {importResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "p-4 rounded-lg text-sm",
                importResult.imported > 0 
                  ? "bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/50"
                  : "bg-accent-pink/20 text-accent-pink border border-accent-pink/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {importResult.imported > 0 ? "Import Successful" : "Import Issues"}
                </span>
                <button
                  onClick={() => setImportResult(null)}
                  className="text-dark-400 hover:text-dark-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div>
                <span>Imported: <strong>{importResult.imported}</strong> sessions</span>
                {importResult.skipped > 0 && (
                  <span className="ml-2">Skipped: <strong>{importResult.skipped}</strong> sessions</span>
                )}
              </div>
              {importResult.skipped > 0 && (
                <div className="mt-2 text-xs text-dark-400">
                  Some sessions were skipped. This could be due to corrupted data or format incompatibilities.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}