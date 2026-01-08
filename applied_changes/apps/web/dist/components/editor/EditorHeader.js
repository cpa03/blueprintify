import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Tabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
export function EditorHeader({ activeTab, setActiveTab, viewMode, setViewMode, onCopy, onExport, onNew, hasContent, copied }) {
    return (_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-dark-700", children: [_jsx(Tabs.Root, { value: activeTab, onValueChange: (v) => setActiveTab(v), children: _jsxs(Tabs.List, { className: "flex gap-1 bg-dark-800 p-1 rounded-lg", children: [_jsx(Tabs.Trigger, { value: "blueprint", className: clsx('px-4 py-2 rounded-md text-sm font-medium transition-all', activeTab === 'blueprint'
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white hover:bg-dark-700'), children: "\uD83D\uDCD8 blueprint.md" }), _jsx(Tabs.Trigger, { value: "tasks", className: clsx('px-4 py-2 rounded-md text-sm font-medium transition-all', activeTab === 'tasks'
                                ? 'bg-primary-500 text-white'
                                : 'text-dark-400 hover:text-white hover:bg-dark-700'), children: "\uD83D\uDCCB task.md" })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex bg-dark-800 p-1 rounded-lg", children: ['edit', 'split', 'preview'].map((mode) => (_jsxs("button", { onClick: () => setViewMode(mode), className: clsx('px-3 py-1.5 rounded text-xs font-medium transition-all', viewMode === mode
                                ? 'bg-dark-600 text-white'
                                : 'text-dark-400 hover:text-white'), children: [mode === 'edit' && '✏️', mode === 'split' && '⚡', mode === 'preview' && '👁️'] }, mode))) }), _jsx("button", { onClick: onCopy, disabled: !hasContent || !activeTab, className: "btn-ghost text-sm", title: "Copy to clipboard", children: copied === activeTab ? (_jsx("span", { className: "text-accent-emerald", children: "\u2713 Copied!" })) : (_jsx("span", { children: "\uD83D\uDCCB Copy" })) }), _jsx("button", { onClick: onExport, disabled: !hasContent, className: "btn-secondary text-sm", children: "\uD83D\uDCE6 Export .zip" }), _jsx("button", { onClick: onNew, className: "btn-ghost text-sm", title: "Start new project", children: "\uD83D\uDD04 New" })] })] }));
}
