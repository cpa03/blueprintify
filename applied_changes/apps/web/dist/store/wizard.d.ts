import type { WizardState, WizardStep, TechStackItemType } from '@blueprint/shared';
interface WizardStore extends WizardState {
    setStep: (step: WizardStep) => void;
    nextStep: () => void;
    prevStep: () => void;
    setProjectName: (name: string) => void;
    setDescription: (desc: string) => void;
    addTechStack: (item: TechStackItemType) => void;
    removeTechStack: (name: string) => void;
    setTechStack: (items: TechStackItemType[]) => void;
    addFeature: (feature: string) => void;
    removeFeature: (index: number) => void;
    setTargetAudience: (audience: string) => void;
    setConstraints: (constraints: string) => void;
    reset: () => void;
    loadTemplate: (template: {
        projectName: string;
        defaultDescription: string;
        techStack: TechStackItemType[];
        features: string[];
    }) => void;
}
export declare const useWizardStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WizardStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<WizardStore, {
            projectName: string;
            description: string;
            techStack: {
                name: string;
                category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
                version?: string | undefined;
            }[];
            features: string[];
            targetAudience: string;
            constraints: string;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: WizardStore) => void) => () => void;
        onFinishHydration: (fn: (state: WizardStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<WizardStore, {
            projectName: string;
            description: string;
            techStack: {
                name: string;
                category: "frontend" | "backend" | "database" | "hosting" | "ai" | "testing" | "styling" | "other";
                version?: string | undefined;
            }[];
            features: string[];
            targetAudience: string;
            constraints: string;
        }>>;
    };
}>;
export {};
