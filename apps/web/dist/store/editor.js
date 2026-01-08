import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useEditorStore = create()(persist((set) => ({
    activeTab: 'blueprint',
    blueprintContent: '',
    tasksContent: '',
    isDirty: false,
    isGenerating: false,
    generationProgress: '',
    setActiveTab: (activeTab) => set({ activeTab }),
    setBlueprintContent: (blueprintContent) => set({ blueprintContent, isDirty: true }),
    appendBlueprintContent: (chunk) => set((state) => ({
        blueprintContent: state.blueprintContent + chunk,
        isDirty: true
    })),
    setTasksContent: (tasksContent) => set({ tasksContent, isDirty: true }),
    appendTasksContent: (chunk) => set((state) => ({
        tasksContent: state.tasksContent + chunk,
        isDirty: true
    })),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setGenerationProgress: (generationProgress) => set({ generationProgress }),
    markClean: () => set({ isDirty: false }),
    reset: () => set({
        blueprintContent: '',
        tasksContent: '',
        isDirty: false,
        isGenerating: false,
        generationProgress: ''
    })
}), {
    name: 'blueprint-editor',
    partialize: (state) => ({
        blueprintContent: state.blueprintContent,
        tasksContent: state.tasksContent
    })
}));
