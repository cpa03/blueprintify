import * as Tabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import type { EditorTab } from '@blueprint/shared';

export type ViewMode = 'edit' | 'preview' | 'split';

interface EditorHeaderProps {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onCopy: () => void;
  onExport: () => void;
  onNew: () => void;
  hasContent: boolean;
  copied: string | null;
}

export function EditorHeader({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onCopy,
  onExport,
  onNew,
  hasContent,
  copied
}: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-dark-700">
      <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as EditorTab)}>
        <Tabs.List className="flex gap-1 bg-dark-800 p-1 rounded-lg">
          <Tabs.Trigger
            value="blueprint"
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'blueprint'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            )}
          >
            📘 blueprint.md
          </Tabs.Trigger>
          <Tabs.Trigger
            value="tasks"
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'tasks'
                ? 'bg-primary-500 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            )}
          >
            📋 task.md
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <div className="flex items-center gap-2">
        {/* View mode toggle */}
        <div className="flex bg-dark-800 p-1 rounded-lg">
          {(['edit', 'split', 'preview'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'px-3 py-1.5 rounded text-xs font-medium transition-all',
                viewMode === mode
                  ? 'bg-dark-600 text-white'
                  : 'text-dark-400 hover:text-white'
              )}
            >
              {mode === 'edit' && '✏️'}
              {mode === 'split' && '⚡'}
              {mode === 'preview' && '👁️'}
            </button>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={onCopy}
          disabled={!hasContent || !activeTab}
          className="btn-ghost text-sm"
          title="Copy to clipboard"
        >
          {copied === activeTab ? (
            <span className="text-accent-emerald">✓ Copied!</span>
          ) : (
            <span>📋 Copy</span>
          )}
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          disabled={!hasContent}
          className="btn-secondary text-sm"
        >
          📦 Export .zip
        </button>

        {/* New Project */}
        <button
          onClick={onNew}
          className="btn-ghost text-sm"
          title="Start new project"
        >
          🔄 New
        </button>
      </div>
    </div>
  );
}
