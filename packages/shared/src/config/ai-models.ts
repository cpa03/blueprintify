/**
 * Agent Model Hierarchy
 * Single source of truth (TS mirror) for OpenCode agent model fallback order.
 * Canonical file: config/agent-models.json — keep values in sync.
 * Flexy says: No hardcoded "opencode/muse-spark" / "mimo" / "nemotron" strings elsewhere!
 * Usage: import { AGENT_MODEL_HIERARCHY, getAgentModelFallbackList } from "@blueprint/shared";
 *        getAgentModelFallbackList() => [primary, ...fallbacks]
 */

export const AGENT_MODEL_IDS = {
  /** Primary model — highest quality contributor tier */
  PRIMARY: "opencode/muse-spark-1.3-contributor-free",
  /** Fallback 1 — fast flash tier */
  FALLBACK_1: "opencode/mimo-v2.6-flash-free",
  /** Fallback 2 — ultra reasoning tier */
  FALLBACK_2: "opencode/nemotron-3-ultra-free",
} as const;

export type AgentModelId = (typeof AGENT_MODEL_IDS)[keyof typeof AGENT_MODEL_IDS];

/**
 * Ordered fallback hierarchy: primary first, then fallbacks.
 * Used by scripts/opencode-run.sh (via config/agent-models.json) and CI.
 */
export const AGENT_MODEL_HIERARCHY: readonly AgentModelId[] = [
  AGENT_MODEL_IDS.PRIMARY,
  AGENT_MODEL_IDS.FALLBACK_1,
  AGENT_MODEL_IDS.FALLBACK_2,
] as const;

/**
 * Short model names without the `opencode/` prefix.
 * Used by agent frontmatter (`model.default`) which omits the prefix.
 */
export const AGENT_MODEL_SHORT_NAMES = {
  PRIMARY: "muse-spark-1.3-contributor-free",
  FALLBACK_1: "mimo-v2.6-flash-free",
  FALLBACK_2: "nemotron-3-ultra-free",
} as const;

/**
 * Returns the ordered candidate model list.
 * If an explicit model is provided and not already in the hierarchy,
 * it is tried first (mirrors scripts/opencode-run.sh behavior).
 *
 * @param explicitModel - Optional explicit `--model` override.
 * @returns Ordered list of models to attempt.
 */
export function getAgentModelFallbackList(explicitModel?: string): string[] {
  if (!explicitModel) {
    return [...AGENT_MODEL_HIERARCHY];
  }
  if ((AGENT_MODEL_HIERARCHY as readonly string[]).includes(explicitModel)) {
    return [...AGENT_MODEL_HIERARCHY];
  }
  return [explicitModel, ...AGENT_MODEL_HIERARCHY];
}
