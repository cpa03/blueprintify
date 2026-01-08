import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';
import { EditorHeader } from './editor/EditorHeader';
import { useEditorStore, useWizardStore } from '../store';
import { exportAsZip, copyToClipboard, formatForIDE } from '../lib/export';
import clsx from 'clsx';
export function Editor() {
    const [viewMode, setViewMode] = useState('split');
    const [copied, setCopied] = useState(null);
    const activeTab = useEditorStore((s) => s.activeTab);
    const setActiveTab = useEditorStore((s) => s.setActiveTab);
    const blueprintContent = useEditorStore((s) => s.blueprintContent);
    const tasksContent = useEditorStore((s) => s.tasksContent);
    const setBlueprintContent = useEditorStore((s) => s.setBlueprintContent);
    const setTasksContent = useEditorStore((s) => s.setTasksContent);
    const isGenerating = useEditorStore((s) => s.isGenerating);
    const projectName = useWizardStore((s) => s.projectName);
    const resetWizard = useWizardStore((s) => s.reset);
    const resetEditor = useEditorStore((s) => s.reset);
    const currentContent = activeTab === 'blueprint' ? blueprintContent : tasksContent;
    const setCurrentContent = activeTab === 'blueprint' ? setBlueprintContent : setTasksContent;
    const handleCopy = async () => {
        const formatted = formatForIDE(currentContent);
        const success = await copyToClipboard(formatted);
        if (success) {
            setCopied(activeTab);
            setTimeout(() => setCopied(null), 2000);
        }
    };
    const handleExport = async () => {
        await exportAsZip({
            blueprint: blueprintContent,
            tasks: tasksContent,
            projectName: projectName || 'my-project'
        });
    };
    const handleNewProject = () => {
        resetWizard();
        resetEditor();
    };
    const hasContent = blueprintContent.length > 0 || tasksContent.length > 0;
    return (_jsxs("div", { className: "h-full flex flex-col", children: [_jsx(EditorHeader, { activeTab: activeTab, setActiveTab: setActiveTab, viewMode: viewMode, setViewMode: setViewMode, onCopy: handleCopy, onExport: handleExport, onNew: handleNewProject, hasContent: hasContent, copied: copied }), _jsx("div", { className: "flex-1 overflow-hidden", children: !hasContent && !isGenerating ? (_jsx("div", { className: "h-full flex items-center justify-center text-dark-500", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCDD" }), _jsx("p", { children: "Your generated content will appear here" }), _jsx("p", { className: "text-sm mt-2", children: "Complete the wizard to get started" })] }) })) : (_jsxs("div", { className: "h-full flex", children: [(viewMode === 'edit' || viewMode === 'split') && (_jsx("div", { className: clsx('h-full overflow-hidden', viewMode === 'split' ? 'w-1/2 border-r border-dark-700' : 'w-full'), children: _jsx(CodeMirror, { value: currentContent, onChange: setCurrentContent, extensions: [markdown()], theme: oneDark, className: "h-full", basicSetup: {
                                    lineNumbers: true,
                                    foldGutter: true,
                                    highlightActiveLine: true
                                } }) })), (viewMode === 'preview' || viewMode === 'split') && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: clsx('h-full overflow-y-auto p-6', viewMode === 'split' ? 'w-1/2' : 'w-full'), children: _jsx("div", { className: "markdown-content", children: _jsx(ReactMarkdown, { children: currentContent || '*No content yet...*' }) }) }))] })) })] }));
}
