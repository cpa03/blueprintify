/**
 * Wizard State Management Store
 *
 * Manages the multi-step wizard flow for project configuration.
 * Provides persistent state via localStorage with debounced auto-save.
 *
 * Features:
 * - Step navigation (info → stack → features → review → generating)
 * - Project configuration (name, description, tech stack, features)
 * - Template loading for quick-start
 * - Automatic state persistence with backup/recovery
 *
 * @see docs/user-guide.md - Wizard usage documentation
 * @see apps/web/src/lib/storage.ts - Persistence layer
 */

import { create } from "zustand";
import type {
  WizardState,
  WizardStep,
  TechStackItemType,
} from "@blueprint/shared";
import { createDebouncedSaver } from "@blueprint/shared";
import { WIZARD_STEPS, DEBOUNCE_CONFIG } from "../config/constants";
import { wizardStorage } from "../lib/storage";

/**
 * Extended wizard store interface with actions for state manipulation.
 *
 * @extends WizardState - Base state from shared types
 * @property setStep - Navigate to a specific wizard step
 * @property nextStep - Advance to the next step in sequence
 * @property prevStep - Return to the previous step
 * @property setProjectName - Update project name field
 * @property setDescription - Update project description field
 * @property addTechStack - Add a technology to the selected stack
 * @property removeTechStack - Remove a technology from the stack
 * @property setTechStack - Replace entire tech stack selection
 * @property addFeature - Add a feature to the feature list
 * @property removeFeature - Remove a feature by name or index
 * @property clearFeatures - Clear all features
 * @property setTargetAudience - Update target audience field
 * @property setConstraints - Update constraints field
 * @property reset - Reset store to initial state and clear storage
 * @property loadTemplate - Load a pre-configured template
 */
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
  /**
   * Loads persisted state from localStorage on store initialization.
   * Merges stored state with initial state to handle schema migrations.
   */
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

  /** Debounced save prevents excessive localStorage writes on rapid updates */
  const { debounced: debouncedSave, cancel: cancelSave } = createDebouncedSaver(
    saveState,
    DEBOUNCE_CONFIG.WIZARD,
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
