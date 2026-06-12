import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWizardStore } from "./wizard";
import type { WizardStep, TechStackItemType } from "@blueprint/shared";
import { WIZARD_STEP_KEYS } from "@blueprint/shared";

// Mock the storage module
vi.mock("../lib/storage", () => ({
  wizardStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the persistence module
vi.mock("./persistence", () => ({
  createPersistedStore: vi.fn(() => ({
    loadState: vi.fn(),
    debouncedSave: vi.fn(),
    cancelSave: vi.fn(),
    flushSave: vi.fn(),
  })),
}));

// Mock constants
vi.mock("../config/constants", () => ({
  WIZARD_STEPS: [
    { key: "info", label: "Project Info", icon: "📝", shortcut: "1" },
    { key: "stack", label: "Tech Stack", icon: "⚙️", shortcut: "2" },
    { key: "features", label: "Features", icon: "✨", shortcut: "3" },
    { key: "review", label: "Review", icon: "👀", shortcut: "4" },
    { key: "generating", label: "Generate", icon: "🚀", shortcut: "5" },
  ],
  DEBOUNCE_CONFIG: {
    WIZARD: 300,
    EDITOR: 300,
  },
}));

describe("wizard store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useWizardStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useWizardStore.getState();

      expect(state.currentStep).toBe(WIZARD_STEP_KEYS.INFO);
      expect(state.projectName).toBe("");
      expect(state.description).toBe("");
      expect(state.techStack).toEqual([]);
      expect(state.features).toEqual([]);
      expect(state.targetAudience).toBe("");
      expect(state.constraints).toBe("");
    });
  });

  describe("setStep", () => {
    it("should set current step to specified value", () => {
      const { setStep } = useWizardStore.getState();

      setStep(WIZARD_STEP_KEYS.STACK);

      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.STACK);
    });

    it("should allow setting to any valid wizard step", () => {
      const { setStep } = useWizardStore.getState();
      const steps: WizardStep[] = [
        WIZARD_STEP_KEYS.INFO,
        WIZARD_STEP_KEYS.STACK,
        WIZARD_STEP_KEYS.FEATURES,
        WIZARD_STEP_KEYS.REVIEW,
        WIZARD_STEP_KEYS.GENERATING,
      ];

      steps.forEach((step) => {
        setStep(step);
        expect(useWizardStore.getState().currentStep).toBe(step);
      });
    });
  });

  describe("nextStep", () => {
    it("should advance to next step when not on last step", () => {
      const { nextStep } = useWizardStore.getState();

      nextStep();

      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.STACK);
    });

    it("should not advance beyond last step", () => {
      const { setStep, nextStep } = useWizardStore.getState();

      // Go to last step
      setStep(WIZARD_STEP_KEYS.GENERATING);

      nextStep();

      // Should still be on generating (last step)
      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.GENERATING);
    });
  });

  describe("prevStep", () => {
    it("should return to previous step when not on first step", () => {
      const { setStep, prevStep } = useWizardStore.getState();

      setStep(WIZARD_STEP_KEYS.STACK);
      prevStep();

      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.INFO);
    });

    it("should not go before first step", () => {
      const { prevStep } = useWizardStore.getState();

      prevStep();

      // Should still be on info (first step)
      expect(useWizardStore.getState().currentStep).toBe(WIZARD_STEP_KEYS.INFO);
    });
  });

  describe("setProjectName", () => {
    it("should update project name", () => {
      const { setProjectName } = useWizardStore.getState();

      setProjectName("My Awesome Project");

      expect(useWizardStore.getState().projectName).toBe("My Awesome Project");
    });
  });

  describe("setDescription", () => {
    it("should update description", () => {
      const { setDescription } = useWizardStore.getState();

      setDescription("This is a test project description");

      expect(useWizardStore.getState().description).toBe("This is a test project description");
    });
  });

  describe("techStack actions", () => {
    const mockTechStackItem: TechStackItemType = {
      name: "React",
      category: "frontend",
    };

    it("addTechStack should add item to empty array", () => {
      const { addTechStack } = useWizardStore.getState();

      addTechStack(mockTechStackItem);

      expect(useWizardStore.getState().techStack).toContainEqual(mockTechStackItem);
    });

    it("addTechStack should not add duplicate items", () => {
      const { addTechStack } = useWizardStore.getState();

      addTechStack(mockTechStackItem);
      addTechStack(mockTechStackItem);

      const techStack = useWizardStore.getState().techStack;
      expect(techStack.filter((t) => t.name === "React")).toHaveLength(1);
    });

    it("removeTechStack should remove item by name", () => {
      const { addTechStack, removeTechStack } = useWizardStore.getState();

      addTechStack(mockTechStackItem);
      removeTechStack("React");

      expect(useWizardStore.getState().techStack).toEqual([]);
    });

    it("setTechStack should replace entire tech stack", () => {
      const { setTechStack } = useWizardStore.getState();
      const newTechStack: TechStackItemType[] = [
        { name: "Vue", category: "frontend" },
        { name: "Node.js", category: "backend" },
      ];

      setTechStack(newTechStack);

      expect(useWizardStore.getState().techStack).toEqual(newTechStack);
    });
  });

  describe("feature actions", () => {
    it("addFeature should add feature to empty array", () => {
      const { addFeature } = useWizardStore.getState();

      addFeature("User Authentication");

      expect(useWizardStore.getState().features).toContain("User Authentication");
    });

    it("addFeature should trim whitespace from feature", () => {
      const { addFeature } = useWizardStore.getState();

      addFeature("  Feature with spaces  ");

      expect(useWizardStore.getState().features).toContain("Feature with spaces");
    });

    it("addFeature should not add empty feature", () => {
      const { addFeature } = useWizardStore.getState();

      addFeature("   ");

      expect(useWizardStore.getState().features).toEqual([]);
    });

    it("removeFeature by string should remove matching feature", () => {
      const { addFeature, removeFeature } = useWizardStore.getState();

      addFeature("Feature A");
      addFeature("Feature B");
      removeFeature("Feature A");

      expect(useWizardStore.getState().features).not.toContain("Feature A");
      expect(useWizardStore.getState().features).toContain("Feature B");
    });

    it("removeFeature by index should remove feature at index", () => {
      const { addFeature, removeFeature } = useWizardStore.getState();

      addFeature("Feature A");
      addFeature("Feature B");
      removeFeature(0);

      expect(useWizardStore.getState().features).toEqual(["Feature B"]);
    });

    it("clearFeatures should remove all features", () => {
      const { addFeature, clearFeatures } = useWizardStore.getState();

      addFeature("Feature A");
      addFeature("Feature B");
      clearFeatures();

      expect(useWizardStore.getState().features).toEqual([]);
    });
  });

  describe("setTargetAudience", () => {
    it("should update target audience", () => {
      const { setTargetAudience } = useWizardStore.getState();

      setTargetAudience("Developers");

      expect(useWizardStore.getState().targetAudience).toBe("Developers");
    });
  });

  describe("setConstraints", () => {
    it("should update constraints", () => {
      const { setConstraints } = useWizardStore.getState();

      setConstraints("Must be mobile-responsive");

      expect(useWizardStore.getState().constraints).toBe("Must be mobile-responsive");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      const {
        setProjectName,
        setDescription,
        addTechStack,
        addFeature,
        setTargetAudience,
        setConstraints,
        reset,
      } = useWizardStore.getState();

      // Modify state
      setProjectName("Test Project");
      setDescription("Test description");
      addTechStack({ name: "React", category: "frontend" });
      addFeature("Test Feature");
      setTargetAudience("Test Audience");
      setConstraints("Test Constraints");

      // Reset
      reset();

      // Verify reset
      const state = useWizardStore.getState();
      expect(state.projectName).toBe("");
      expect(state.description).toBe("");
      expect(state.techStack).toEqual([]);
      expect(state.features).toEqual([]);
      expect(state.targetAudience).toBe("");
      expect(state.constraints).toBe("");
    });
  });

  describe("loadTemplate", () => {
    it("should load template and set state", () => {
      const { loadTemplate } = useWizardStore.getState();
      const template = {
        projectName: "E-commerce Platform",
        defaultDescription: "A full-featured e-commerce platform",
        techStack: [
          { name: "React", category: "frontend" as const },
          { name: "Node.js", category: "backend" as const },
        ],
        features: ["Shopping Cart", "User Auth", "Payment Processing"],
      };

      loadTemplate(template);

      const state = useWizardStore.getState();
      expect(state.projectName).toBe("E-commerce Platform");
      expect(state.description).toBe("A full-featured e-commerce platform");
      expect(state.techStack).toEqual(template.techStack);
      expect(state.features).toEqual(template.features);
      expect(state.currentStep).toBe(WIZARD_STEP_KEYS.REVIEW);
    });
  });
});
