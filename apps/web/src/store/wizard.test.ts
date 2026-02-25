import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWizardStore } from "./wizard";
import type { WizardStep, TechStackItemType } from "@blueprint/shared";

describe("wizard store", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useWizardStore.getState().reset();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const state = useWizardStore.getState();
      expect(state.currentStep).toBe("info");
      expect(state.projectName).toBe("");
      expect(state.description).toBe("");
      expect(state.techStack).toEqual([]);
      expect(state.features).toEqual([]);
      expect(state.targetAudience).toBe("");
      expect(state.constraints).toBe("");
    });
  });

  describe("setStep", () => {
    it("should set the current step", () => {
      const { setStep } = useWizardStore.getState();
      setStep("stack");
      expect(useWizardStore.getState().currentStep).toBe("stack");
    });

    it("should set to any valid step", () => {
      const { setStep } = useWizardStore.getState();
      const steps: WizardStep[] = [
        "info",
        "stack",
        "features",
        "review",
        "generating",
      ];
      steps.forEach((step) => {
        setStep(step);
        expect(useWizardStore.getState().currentStep).toBe(step);
      });
    });
  });

  describe("nextStep", () => {
    it("should advance to next step", () => {
      const { nextStep } = useWizardStore.getState();
      useWizardStore.setState({ currentStep: "info" });
      nextStep();
      expect(useWizardStore.getState().currentStep).toBe("stack");
    });

    it("should not advance past last step", () => {
      const { nextStep } = useWizardStore.getState();
      useWizardStore.setState({ currentStep: "generating" });
      nextStep();
      expect(useWizardStore.getState().currentStep).toBe("generating");
    });

    it("should advance through all steps", () => {
      const { nextStep } = useWizardStore.getState();
      useWizardStore.setState({ currentStep: "info" });
      nextStep();
      expect(useWizardStore.getState().currentStep).toBe("stack");
      nextStep();
      expect(useWizardStore.getState().currentStep).toBe("features");
      nextStep();
      expect(useWizardStore.getState().currentStep).toBe("review");
    });
  });

  describe("prevStep", () => {
    it("should go to previous step", () => {
      const { prevStep } = useWizardStore.getState();
      useWizardStore.setState({ currentStep: "stack" });
      prevStep();
      expect(useWizardStore.getState().currentStep).toBe("info");
    });

    it("should not go before first step", () => {
      const { prevStep } = useWizardStore.getState();
      useWizardStore.setState({ currentStep: "info" });
      prevStep();
      expect(useWizardStore.getState().currentStep).toBe("info");
    });
  });

  describe("setProjectName", () => {
    it("should set project name", () => {
      const { setProjectName } = useWizardStore.getState();
      setProjectName("My Project");
      expect(useWizardStore.getState().projectName).toBe("My Project");
    });
  });

  describe("setDescription", () => {
    it("should set description", () => {
      const { setDescription } = useWizardStore.getState();
      setDescription("A great project");
      expect(useWizardStore.getState().description).toBe("A great project");
    });
  });

  describe("addTechStack", () => {
    it("should add a tech stack item", () => {
      const { addTechStack } = useWizardStore.getState();
      const item: TechStackItemType = { name: "React", category: "frontend" };
      addTechStack(item);
      expect(useWizardStore.getState().techStack).toContainEqual(item);
    });

    it("should not add duplicate tech stack items", () => {
      const { addTechStack } = useWizardStore.getState();
      const item: TechStackItemType = { name: "React", category: "frontend" };
      addTechStack(item);
      addTechStack(item);
      expect(useWizardStore.getState().techStack).toHaveLength(1);
    });
  });

  describe("removeTechStack", () => {
    it("should remove a tech stack item by name", () => {
      const { addTechStack, removeTechStack } = useWizardStore.getState();
      const item: TechStackItemType = { name: "React", category: "frontend" };
      addTechStack(item);
      removeTechStack("React");
      expect(useWizardStore.getState().techStack).toHaveLength(0);
    });
  });

  describe("setTechStack", () => {
    it("should replace entire tech stack", () => {
      const { setTechStack } = useWizardStore.getState();
      const items: TechStackItemType[] = [
        { name: "React", category: "frontend" as const },
        { name: "Node.js", category: "backend" as const },
      ];
      setTechStack(items);
      expect(useWizardStore.getState().techStack).toEqual(items);
    });
  });

  describe("addFeature", () => {
    it("should add a feature", () => {
      const { addFeature } = useWizardStore.getState();
      addFeature("Dark Mode");
      expect(useWizardStore.getState().features).toContain("Dark Mode");
    });

    it("should trim whitespace from feature", () => {
      const { addFeature } = useWizardStore.getState();
      addFeature("  Dark Mode  ");
      expect(useWizardStore.getState().features).toContain("Dark Mode");
    });

    it("should not add empty feature", () => {
      const { addFeature } = useWizardStore.getState();
      addFeature("   ");
      expect(useWizardStore.getState().features).toHaveLength(0);
    });
  });

  describe("removeFeature", () => {
    it("should remove feature by name", () => {
      const { addFeature, removeFeature } = useWizardStore.getState();
      addFeature("Dark Mode");
      addFeature("Light Mode");
      removeFeature("Dark Mode");
      expect(useWizardStore.getState().features).toEqual(["Light Mode"]);
    });

    it("should remove feature by index", () => {
      const { addFeature, removeFeature } = useWizardStore.getState();
      addFeature("Dark Mode");
      addFeature("Light Mode");
      removeFeature(0);
      expect(useWizardStore.getState().features).toEqual(["Light Mode"]);
    });
  });

  describe("clearFeatures", () => {
    it("should clear all features", () => {
      const { addFeature, clearFeatures } = useWizardStore.getState();
      addFeature("Feature 1");
      addFeature("Feature 2");
      clearFeatures();
      expect(useWizardStore.getState().features).toHaveLength(0);
    });
  });

  describe("setTargetAudience", () => {
    it("should set target audience", () => {
      const { setTargetAudience } = useWizardStore.getState();
      setTargetAudience("Developers");
      expect(useWizardStore.getState().targetAudience).toBe("Developers");
    });
  });

  describe("setConstraints", () => {
    it("should set constraints", () => {
      const { setConstraints } = useWizardStore.getState();
      setConstraints("Must work offline");
      expect(useWizardStore.getState().constraints).toBe("Must work offline");
    });
  });

  describe("reset", () => {
    it("should reset to initial state", () => {
      const {
        setProjectName,
        setDescription,
        addTechStack,
        addFeature,
        setTargetAudience,
        setConstraints,
        reset,
      } = useWizardStore.getState();

      setProjectName("Test Project");
      setDescription("Test Description");
      addTechStack({ name: "React", category: "frontend" });
      addFeature("Test Feature");
      setTargetAudience("Test Audience");
      setConstraints("Test Constraints");

      reset();

      const state = useWizardStore.getState();
      expect(state.currentStep).toBe("info");
      expect(state.projectName).toBe("");
      expect(state.description).toBe("");
      expect(state.techStack).toEqual([]);
      expect(state.features).toEqual([]);
      expect(state.targetAudience).toBe("");
      expect(state.constraints).toBe("");
    });
  });

  describe("loadTemplate", () => {
    it("should load a template and set state", () => {
      const { loadTemplate } = useWizardStore.getState();
      const template = {
        projectName: "Template Project",
        defaultDescription: "Template Description",
        techStack: [
          { name: "React", category: "frontend" as const },
          { name: "Express", category: "backend" as const },
        ],
        features: ["Feature 1", "Feature 2"],
      };

      loadTemplate(template);

      const state = useWizardStore.getState();
      expect(state.projectName).toBe("Template Project");
      expect(state.description).toBe("Template Description");
      expect(state.techStack).toEqual(template.techStack);
      expect(state.features).toEqual(template.features);
      expect(state.currentStep).toBe("review");
    });
  });
});
