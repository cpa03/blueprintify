import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  WizardState,
  WizardStep,
  TechStackItemType,
  Template,
} from "@blueprint/shared";

interface WizardStore extends WizardState {
  template: Template | null;
  // Actions
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
  setTemplate: (template: Template) => void;
  reset: () => void;
  loadTemplate: (template: Template) => void;
}

const STEPS: WizardStep[] = [
  "info",
  "stack",
  "features",
  "review",
  "generating",
];

const initialState: WizardState & { template: Template | null } = {
  currentStep: "info",
  projectName: "",
  description: "",
  techStack: [],
  features: [],
  targetAudience: "",
  constraints: "",
  template: null,
};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
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
      setTemplate: (template) => set({ template }),

      reset: () => set(initialState),

      loadTemplate: (template) => {
        set({
          projectName: template.projectName,
          description: template.defaultDescription,
          techStack: template.techStack,
          features: template.features,
          template: template,
          currentStep: "review",
        });
      },
    }),
    {
      name: "blueprint-wizard",
      partialize: (state) => ({
        projectName: state.projectName,
        description: state.description,
        techStack: state.techStack,
        features: state.features,
        targetAudience: state.targetAudience,
        constraints: state.constraints,
      }),
    },
  ),
);
