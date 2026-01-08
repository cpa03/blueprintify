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
export declare function EditorHeader({ activeTab, setActiveTab, viewMode, setViewMode, onCopy, onExport, onNew, hasContent, copied }: EditorHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
