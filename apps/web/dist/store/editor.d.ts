import type { EditorTab } from '@blueprint/shared';
interface EditorStore {
    activeTab: EditorTab;
    blueprintContent: string;
    tasksContent: string;
    isDirty: boolean;
    isGenerating: boolean;
    generationProgress: string;
    setActiveTab: (tab: EditorTab) => void;
    setBlueprintContent: (content: string) => void;
    appendBlueprintContent: (chunk: string) => void;
    setTasksContent: (content: string) => void;
    appendTasksContent: (chunk: string) => void;
    setIsGenerating: (generating: boolean) => void;
    setGenerationProgress: (progress: string) => void;
    markClean: () => void;
    reset: () => void;
}
export declare const useEditorStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<EditorStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<EditorStore, {
            blueprintContent: string;
            tasksContent: string;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: EditorStore) => void) => () => void;
        onFinishHydration: (fn: (state: EditorStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<EditorStore, {
            blueprintContent: string;
            tasksContent: string;
        }>>;
    };
}>;
export {};
