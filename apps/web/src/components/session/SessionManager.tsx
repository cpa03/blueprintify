import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "../../store/session";
import { useToast } from "../../store/toast";
import { generateSessionId } from "../../types/storage";
import type { StoredSession } from "../../types/storage";
import clsx from "clsx";

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect: (session: StoredSession) => void;
  currentSessionId?: string;
}

export function SessionManager({
  isOpen,
  onClose,
  onSessionSelect,
  currentSessionId,
}: SessionManagerProps) {
  const {
    sessions,
    loadSessions,
    deleteSession,
    archiveSession,
    exportSessions,
    importSessions,
  } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, loadSessions]);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (session.description &&
        session.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      session.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesArchivedFilter = showArchived || !session.isArchived;
    return matchesSearch && matchesArchivedFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      await deleteSession(sessionId);
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  const handleArchive = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await archiveSession(sessionId);
      toast.success("Session archived");
    } catch (error) {
      toast.error("Failed to archive session");
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await exportSessions();
      const blob = new Blob([exportData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blueprintify-sessions-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Sessions exported");
    } catch (error) {
      toast.error("Failed to export sessions");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const result = await importSessions(text);
      setImportResult(result);
      toast.success(
        `Imported ${result.imported} sessions, skipped ${result.skipped}`,
      );
    } catch (error) {
      toast.error("Failed to import sessions");
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-dark-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Session Manager</h2>
              <button
                onClick={onClose}
                className="text-dark-400 hover:text-dark-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:border-primary-500"
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded"
                />
                Show archived
              </label>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Export
              </button>

              <label className="px-4 py-2 bg-accent-emerald hover:bg-accent-emerald/90 text-dark-900 rounded-lg transition-colors cursor-pointer">
                {isImporting ? "Importing..." : "Import"}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>
            </div>

            {importResult && (
              <div className="mt-2 p-2 bg-accent-emerald/20 text-accent-emerald rounded text-sm">
                Imported {importResult.imported} sessions, skipped{" "}
                {importResult.skipped}
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                {searchQuery
                  ? "No sessions found matching your search."
                  : "No sessions yet. Complete the wizard to create your first session."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={clsx(
                      "p-4 bg-dark-700 rounded-lg border cursor-pointer transition-all hover:bg-dark-600",
                      currentSessionId === session.id
                        ? "border-primary-500"
                        : "border-dark-600",
                      session.isArchived && "opacity-60",
                    )}
                    onClick={() => onSessionSelect(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {session.title}
                        </h3>
                        {session.description && (
                          <p className="text-sm text-dark-300 truncate mt-1">
                            {session.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-dark-400">
                          <span>Created: {formatDate(session.createdAt)}</span>
                          <span>Modified: {formatDate(session.updatedAt)}</span>
                          <span>Words: {session.metadata.wordCount.total}</span>
                        </div>

                        {session.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {session.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-dark-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {currentSessionId !== session.id && (
                          <>
                            <button
                              onClick={(e) => handleArchive(session.id, e)}
                              className="text-dark-400 hover:text-yellow-400 transition-colors"
                              title={
                                session.isArchived ? "Unarchive" : "Archive"
                              }
                            >
                              {session.isArchived ? "📤" : "📁"}
                            </button>

                            <button
                              onClick={(e) => handleDelete(session.id, e)}
                              className="text-dark-400 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        )}

                        {currentSessionId === session.id && (
                          <span className="text-primary-400 text-sm">
                            ● Active
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
