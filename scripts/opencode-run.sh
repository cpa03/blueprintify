#!/usr/bin/env bash
# ==============================================================================
# opencode-run.sh — Multi-Model Fallback Runner for OpenCode CLI
#
# Execution hierarchy:
#   1. opencode/muse-spark-1.3-contributor-free  (Primary)
#   2. opencode/mimo-v2.6-flash-free             (Fallback 1)
#   3. opencode/nemotron-3-ultra-free            (Fallback 2)
# ==============================================================================

set -u

MODELS=(
  "opencode/muse-spark-1.3-contributor-free"
  "opencode/mimo-v2.6-flash-free"
  "opencode/nemotron-3-ultra-free"
)

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
