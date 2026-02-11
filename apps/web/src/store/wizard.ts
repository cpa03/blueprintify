import { create } from "zustand";
import type {
  WizardState,
  WizardStep,
  TechStackItemType,
} from "@blueprint/shared";
import { WIZARD_STEPS } from "../config/constants";
import { wizardStorage } from "../lib/storage";

export interface WizardStore extends WizardState {
  setStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProjectName: (name: string) => void;
  setDescription: (desc: string) => void;
  addTechStack: (item: TechStackItemType) => void;
  removeTechStack: (name: string) => void;
  setTechStack: (items: TechStackItemType[]) => void;
  addFeature: (feature: string) => void;
  removeFeature: (featureOrIndex: string | number) => void;
  clearFeatures: () => void;
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

const STEPS: WizardStep[] = WIZARD_STEPS.map((s) => s.key);

const initialState: WizardState = {
  currentStep: "info",
  projectName: "",
  description: "",
  techStack: [],
  features: [],
  targetAudience: "",
  constraints: "",
};

export const useWizardStore = create<WizardStore>()((set, get) => {
  const loadState = async (): Promise<void> => {
    try {
      const stored = await wizardStorage.get();
      if (stored !== null) {
        const persistedState = stored as Partial<WizardState>;
        set((state) => ({ ...state, ...persistedState }), true);
      }
    } catch {
      console.warn("Failed to load wizard state from storage");
    }
  };

  const saveState = async (): Promise<void> => {
    try {
      const current = get();
      const dataToSave = {
        projectName: current.projectName,
        description: current.description,
        techStack: current.techStack,
        features: current.features,
        targetAudience: current.targetAudience,
        constraints: current.constraints,
      };
      await wizardStorage.set(dataToSave);
    } catch {
      console.warn("Failed to save wizard state to storage");
    }
  };

  void loadState();

  return {
    ...initialState,

    setStep: (step) => {
      set({ currentStep: step });
      void saveState();
    },

    nextStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex < STEPS.length - 1) {
        set({ currentStep: STEPS[currentIndex + 1] });
        void saveState();
      }
    },

    prevStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex > 0) {
        set({ currentStep: STEPS[currentIndex - 1] });
        void saveState();
      }
    },

    setProjectName: (projectName) => {
      set({ projectName });
      void saveState();
    },

    setDescription: (description) => {
      set({ description });
      void saveState();
    },

    addTechStack: (item) => {
      const existing = get().techStack;
      if (!existing.some((t) => t.name === item.name)) {
        set({ techStack: [...existing, item] });
        void saveState();
      }
    },

    removeTechStack: (name) => {
      set({ techStack: get().techStack.filter((t) => t.name !== name) });
      void saveState();
    },

    setTechStack: (techStack) => {
      set({ techStack });
      void saveState();
    },

    addFeature: (feature) => {
      if (feature.trim()) {
        set({ features: [...get().features, feature.trim()] });
        void saveState();
      }
    },

    removeFeature: (featureOrIndex) => {
      if (typeof featureOrIndex === "number") {
        set({
          features: get().features.filter((_, i) => i !== featureOrIndex),
        });
      } else {
        set({ features: get().features.filter((f) => f !== featureOrIndex) });
      }
      void saveState();
    },

    clearFeatures: () => {
      set({ features: [] });
      void saveState();
    },

    setTargetAudience: (targetAudience) => {
      set({ targetAudience });
      void saveState();
    },

    setConstraints: (constraints) => {
      set({ constraints });
      void saveState();
    },

    reset: () => {
      set(initialState);
      void wizardStorage.remove();
    },

    loadTemplate: (template) => {
      const newState = {
        projectName: template.projectName,
        description: template.defaultDescription,
        techStack: template.techStack,
        features: template.features,
        currentStep: "review" as WizardStep,
      };
      set(newState);
      void wizardStorage.set(newState);
    },
  };
});
