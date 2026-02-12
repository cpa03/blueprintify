import { create } from "zustand";
import type {
  WizardState,
  WizardStep,
  TechStackItemType,
} from "@blueprint/shared";
import { WIZARD_STEPS } from "../config/constants";
import { wizardStorage } from "../lib/storage";

// Debounce utility for performance optimization
function createDebouncedSaver<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): { debounced: T; flush: () => void; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: unknown[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  }) as T;

  const flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn();
      timeoutId = null;
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debounced, flush, cancel };
}

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

  // Create debounced save function for consistency with editor store
  const { debounced: debouncedSave, cancel: cancelSave } = createDebouncedSaver(
    saveState,
    300, // 300ms delay for wizard - slightly faster as changes are less frequent
  );

  void loadState();

  return {
    ...initialState,

    setStep: (step) => {
      set({ currentStep: step });
      debouncedSave();
    },

    nextStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex < STEPS.length - 1) {
        set({ currentStep: STEPS[currentIndex + 1] });
        debouncedSave();
      }
    },

    prevStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex > 0) {
        set({ currentStep: STEPS[currentIndex - 1] });
        debouncedSave();
      }
    },

    setProjectName: (projectName) => {
      set({ projectName });
      debouncedSave();
    },

    setDescription: (description) => {
      set({ description });
      debouncedSave();
    },

    addTechStack: (item) => {
      const existing = get().techStack;
      if (!existing.some((t) => t.name === item.name)) {
        set({ techStack: [...existing, item] });
        debouncedSave();
      }
    },

    removeTechStack: (name) => {
      set({ techStack: get().techStack.filter((t) => t.name !== name) });
      debouncedSave();
    },

    setTechStack: (techStack) => {
      set({ techStack });
      debouncedSave();
    },

    addFeature: (feature) => {
      if (feature.trim()) {
        set({ features: [...get().features, feature.trim()] });
        debouncedSave();
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
      debouncedSave();
    },

    clearFeatures: () => {
      set({ features: [] });
      debouncedSave();
    },

    setTargetAudience: (targetAudience) => {
      set({ targetAudience });
      debouncedSave();
    },

    setConstraints: (constraints) => {
      set({ constraints });
      debouncedSave();
    },

    reset: () => {
      cancelSave();
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
