import { describe, expect, it } from "vitest";
import {
  AGENT_MODEL_HIERARCHY,
  AGENT_MODEL_IDS,
  AGENT_MODEL_SHORT_NAMES,
  getAgentModelFallbackList,
} from "./ai-models.js";

describe("AGENT_MODEL_HIERARCHY", () => {
  it("defines primary + 2 fallbacks in order", () => {
    expect(AGENT_MODEL_HIERARCHY).toHaveLength(3);
    expect(AGENT_MODEL_HIERARCHY[0]).toBe(AGENT_MODEL_IDS.PRIMARY);
    expect(AGENT_MODEL_HIERARCHY[1]).toBe(AGENT_MODEL_IDS.FALLBACK_1);
    expect(AGENT_MODEL_HIERARCHY[2]).toBe(AGENT_MODEL_IDS.FALLBACK_2);
  });

  it("stays in sync with config/agent-models.json single source", () => {
    // Keep in sync with config/agent-models.json (verified by scripts/validate-models.mjs)
    expect(AGENT_MODEL_IDS.PRIMARY).toBe("opencode/muse-spark-1.3-contributor-free");
    expect(AGENT_MODEL_IDS.FALLBACK_1).toBe("opencode/mimo-v2.6-flash-free");
    expect(AGENT_MODEL_IDS.FALLBACK_2).toBe("opencode/nemotron-3-ultra-free");
    expect(AGENT_MODEL_SHORT_NAMES.PRIMARY).toBe("muse-spark-1.3-contributor-free");
    expect(AGENT_MODEL_SHORT_NAMES.FALLBACK_1).toBe("mimo-v2.6-flash-free");
    expect(AGENT_MODEL_SHORT_NAMES.FALLBACK_2).toBe("nemotron-3-ultra-free");
  });

  it("short names match full ids suffix", () => {
    expect(AGENT_MODEL_IDS.PRIMARY.endsWith(AGENT_MODEL_SHORT_NAMES.PRIMARY)).toBe(true);
    expect(AGENT_MODEL_IDS.FALLBACK_1.endsWith(AGENT_MODEL_SHORT_NAMES.FALLBACK_1)).toBe(true);
    expect(AGENT_MODEL_IDS.FALLBACK_2.endsWith(AGENT_MODEL_SHORT_NAMES.FALLBACK_2)).toBe(true);
  });
});

describe("getAgentModelFallbackList", () => {
  it("returns hierarchy when no override", () => {
    expect(getAgentModelFallbackList()).toEqual([...AGENT_MODEL_HIERARCHY]);
  });

  it("puts unknown explicit model first", () => {
    const custom = "opencode/custom-model-free";
    expect(getAgentModelFallbackList(custom)[0]).toBe(custom);
    expect(getAgentModelFallbackList(custom)).toHaveLength(4);
  });

  it("does not duplicate known model", () => {
    expect(getAgentModelFallbackList(AGENT_MODEL_IDS.PRIMARY)).toEqual([...AGENT_MODEL_HIERARCHY]);
  });
});
