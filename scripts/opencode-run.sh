#!/usr/bin/env bash
# ==============================================================================
# opencode-run.sh — Multi-Model Fallback Runner for OpenCode CLI
#
# Model hierarchy is NOT hardcoded here.
# Single source of truth: config/agent-models.json
# TS mirror: packages/shared/src/config/ai-models.ts
# Override config path via AGENT_MODELS_CONFIG env var.
# Flexy says: no hardcoded model strings in scripts!
# ==============================================================================

set -u
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_FILE="${AGENT_MODELS_CONFIG:-${PROJECT_ROOT}/config/agent-models.json}"

load_models_from_config() {
  local config_path="$1"
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "import json,sys; d=json.load(open(sys.argv[1])); print(d['primary']); [print(m) for m in d.get('fallbacks',[])]" "$config_path"
    return 0
  fi
  if command -v node >/dev/null 2>&1; then
    node -e "const d=require(process.argv[1]); console.log(d.primary); (d.fallbacks||[]).forEach((m)=>console.log(m));" "$config_path"
    return 0
  fi
  if command -v jq >/dev/null 2>&1; then
    jq -r '.primary, (.fallbacks[]?)' "$config_path"
    return 0
  fi
  return 1
}

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ [opencode-run] Model config not found: $CONFIG_FILE" >&2
  echo "   Expected single source of truth at config/agent-models.json." >&2
  exit 1
fi

mapfile -t MODELS < <(load_models_from_config "$CONFIG_FILE" || true)

if [[ "${#MODELS[@]}" -eq 0 ]]; then
  echo "❌ [opencode-run] Failed to load models from: $CONFIG_FILE" >&2
  echo "   Requires python3, node, or jq to parse JSON." >&2
  exit 1
fi

# Parse incoming arguments, stripping any existing --model / -m flags so we control the fallback order
ARGS=()
SKIP_NEXT=0
EXPLICIT_MODEL=""

for arg in "$@"; do
  if [ "$SKIP_NEXT" -eq 1 ]; then
    EXPLICIT_MODEL="$arg"
    SKIP_NEXT=0
    continue
  fi
  case "$arg" in
    --model=*)
      EXPLICIT_MODEL="${arg#*=}"
      ;;
    --model|-m)
      SKIP_NEXT=1
      ;;
    *)
      ARGS+=("$arg")
      ;;
  esac
done

# If an explicit model was passed that is NOT in the default fallback list, try that first
CANDIDATE_MODELS=()
if [ -n "$EXPLICIT_MODEL" ]; then
  CANDIDATE_MODELS+=("$EXPLICIT_MODEL")
fi
for m in "${MODELS[@]}"; do
  if [ "$m" != "$EXPLICIT_MODEL" ]; then
    CANDIDATE_MODELS+=("$m")
  fi
done

TOTAL=${#CANDIDATE_MODELS[@]}
ATTEMPT=1

for model in "${CANDIDATE_MODELS[@]}"; do
  echo "🤖 [opencode-run] (Attempt $ATTEMPT/$TOTAL) Running with model: $model" >&2
  set +e
  opencode run "${ARGS[@]}" --model "$model"
  EXIT_CODE=$?
  set -e
  if [ "$EXIT_CODE" -eq 0 ]; then
    echo "✅ [opencode-run] Success with model: $model" >&2
    exit 0
  fi
  echo "⚠️ [opencode-run] Model $model failed (exit code $EXIT_CODE). Trying fallback..." >&2
  ATTEMPT=$((ATTEMPT + 1))
done

echo "❌ [opencode-run] All candidate models failed." >&2
exit 1
