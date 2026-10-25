import { describe, it, expect } from "vitest";
import { GENERATION_PHASE_LABELS, GENERATION_PHASE_PERCENTAGES } from "./content";
import { PERCENT_SCALE } from "@blueprint/shared/config";

describe("GENERATION_PHASE_PERCENTAGES — Iteration 205 additions", () => {
  it("defines the complete phase as the full percent scale", () => {
    expect(GENERATION_PHASE_PERCENTAGES.COMPLETE).toBe(PERCENT_SCALE);
  });

  it("defines the remaining phase percentages", () => {
    expect(GENERATION_PHASE_PERCENTAGES.ERROR).toBe(0);
    expect(GENERATION_PHASE_PERCENTAGES.STARTING).toBe(5);
    expect(GENERATION_PHASE_PERCENTAGES.GENERATING_BLUEPRINT).toBe(30);
    expect(GENERATION_PHASE_PERCENTAGES.GENERATING_TASKS).toBe(65);
    expect(GENERATION_PHASE_PERCENTAGES.IN_PROGRESS).toBe(45);
  });

  it("keeps every percentage inside the 0-100 percent domain", () => {
    for (const percent of Object.values(GENERATION_PHASE_PERCENTAGES)) {
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(PERCENT_SCALE);
    }
  });

  it("pairs one-to-one with GENERATION_PHASE_LABELS so a label can never ship without its percent", () => {
    // COMPLETE_ARIA is label-only (no progress-bar percent), so it is exempt from pairing.
    const LABEL_ONLY_KEYS = ["COMPLETE_ARIA"];
    const labelKeys = Object.keys(GENERATION_PHASE_LABELS)
      .filter((key) => !LABEL_ONLY_KEYS.includes(key))
      .sort();
    const percentKeys = Object.keys(GENERATION_PHASE_PERCENTAGES).sort();
    expect(percentKeys).toEqual(labelKeys);
  });
});
