import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const STEPS = ['info', 'stack', 'features', 'review', 'generating'];
const initialState = {
    currentStep: 'info',
    projectName: '',
    description: '',
    techStack: [],
    features: [],
    targetAudience: '',
    constraints: ''
};
export const useWizardStore = create()(persist((set, get) => ({
    ...initialState,
    setStep: (step) => set({ currentStep: step }),
    nextStep: () => {
        const current = get().currentStep;
        const currentIndex = STEPS.indexOf(current);
        if (currentIndex < STEPS.length - 1) {
            set({ currentStep: STEPS[currentIndex + 1] });
        }
    },
    prevStep: () => {
        const current = get().currentStep;
        const currentIndex = STEPS.indexOf(current);
        if (currentIndex > 0) {
            set({ currentStep: STEPS[currentIndex - 1] });
        }
    },
    setProjectName: (projectName) => set({ projectName }),
    setDescription: (description) => set({ description }),
    addTechStack: (item) => {
        const existing = get().techStack;
        if (!existing.some((t) => t.name === item.name)) {
            set({ techStack: [...existing, item] });
        }
    },
    removeTechStack: (name) => {
        set({ techStack: get().techStack.filter((t) => t.name !== name) });
    },
    setTechStack: (techStack) => set({ techStack }),
    addFeature: (feature) => {
        if (feature.trim()) {
            set({ features: [...get().features, feature.trim()] });
        }
    },
    removeFeature: (index) => {
        set({ features: get().features.filter((_, i) => i !== index) });
    },
    setTargetAudience: (targetAudience) => set({ targetAudience }),
    setConstraints: (constraints) => set({ constraints }),
    reset: () => set(initialState),
    loadTemplate: (template) => {
        set({
            projectName: template.projectName,
            description: template.defaultDescription,
            techStack: template.techStack,
            features: template.features,
            currentStep: 'review'
        });
    }
}), {
    name: 'blueprint-wizard',
    partialize: (state) => ({
        projectName: state.projectName,
        description: state.description,
        techStack: state.techStack,
        features: state.features,
        targetAudience: state.targetAudience,
        constraints: state.constraints
    })
}));
