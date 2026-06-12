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
import type { WizardState, WizardStep, TechStackItemType } from "@blueprint/shared";
import { WIZARD_STEP_KEYS } from "@blueprint/shared";
import { WIZARD_STEPS, DEBOUNCE_CONFIG } from "../config/constants";
import { wizardStorage } from "../lib/storage";
import { createPersistedStore, type PersistedStorage } from "./persistence";

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
  currentStep: WIZARD_STEP_KEYS.INFO,
  projectName: "",
  description: "",
  techStack: [],
  features: [],
  targetAudience: "",
  constraints: "",
};
/** Data shape persisted to storage */
type PersistedWizardData = Pick<
  WizardStore,
  "projectName" | "description" | "techStack" | "features" | "targetAudience" | "constraints"
>;

export const useWizardStore = create<WizardStore>()((set, get) => {
  // Use shared persistence utility
  const { loadState, debouncedSave, cancelSave } = createPersistedStore<
    PersistedWizardData,
    WizardStore
  >({
    storage: wizardStorage as PersistedStorage<PersistedWizardData>,
    debounceDelay: DEBOUNCE_CONFIG.WIZARD,
    getPersistData: (state) => ({
      projectName: state.projectName,
      description: state.description,
      techStack: state.techStack,
      features: state.features,
      targetAudience: state.targetAudience,
      constraints: state.constraints,
    }),
  });

  void loadState(set);

  return {
    ...initialState,

    setStep: (step) => {
      set({ currentStep: step });
      debouncedSave(get);
    },

    nextStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex < STEPS.length - 1) {
        set({ currentStep: STEPS[currentIndex + 1] });
        debouncedSave(get);
      }
    },

    prevStep: () => {
      const current = get().currentStep;
      const currentIndex = STEPS.indexOf(current);
      if (currentIndex > 0) {
        set({ currentStep: STEPS[currentIndex - 1] });
        debouncedSave(get);
      }
    },

    setProjectName: (projectName) => {
      set({ projectName });
      debouncedSave(get);
    },

    setDescription: (description) => {
      set({ description });
      debouncedSave(get);
    },

    addTechStack: (item) => {
      const existing = get().techStack;
      if (!existing.some((t) => t.name === item.name)) {
        set({ techStack: [...existing, item] });
        debouncedSave(get);
      }
    },

    removeTechStack: (name) => {
      set({ techStack: get().techStack.filter((t) => t.name !== name) });
      debouncedSave(get);
    },

    setTechStack: (techStack) => {
      set({ techStack });
      debouncedSave(get);
    },

    addFeature: (feature) => {
      if (feature.trim()) {
        set({ features: [...get().features, feature.trim()] });
        debouncedSave(get);
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
      debouncedSave(get);
    },

    clearFeatures: () => {
      set({ features: [] });
      debouncedSave(get);
    },

    setTargetAudience: (targetAudience) => {
      set({ targetAudience });
      debouncedSave(get);
    },

    setConstraints: (constraints) => {
      set({ constraints });
      debouncedSave(get);
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
        currentStep: WIZARD_STEP_KEYS.REVIEW,
      };
      set(newState);
      void wizardStorage.set(newState);
    },
  };
});
