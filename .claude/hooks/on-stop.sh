#!/usr/bin/env bash
# Stop hook — nudges Claude to capture learnings before ending.
# Returns a non-blocking reminder via stdout JSON.
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TODAY="$(date +%Y-%m-%d)"
MONTH="$(date +%Y-%m)"
LEARNINGS_DIR="$ROOT/memory/learnings/$MONTH"
RETROS_DIR="$ROOT/memory/retros"

# Has the session already produced a learning today? If yes, stay quiet.
HAS_LEARNING_TODAY=0
if [ -d "$LEARNINGS_DIR" ]; then
  if find "$LEARNINGS_DIR" -name "${TODAY}*.md" -type f 2>/dev/null | grep -q .; then
    HAS_LEARNING_TODAY=1
  fi
fi
if [ -d "$RETROS_DIR" ]; then
  if find "$RETROS_DIR" -name "${TODAY}*.md" -type f 2>/dev/null | grep -q .; then
    HAS_LEARNING_TODAY=1
  fi
fi

if [ "$HAS_LEARNING_TODAY" -eq 0 ]; then
  REMINDER="Before stopping: did anything notable happen this session? If so, capture it. Add a learning under memory/learnings/$MONTH/ or a retro under memory/retros/. If nothing notable, just say so and stop."
  # Decision "block" here re-prompts Claude with the reason. Use sparingly; only on first stop.
  printf '{"decision":"block","reason":%s}\n' "$(printf '%s' "$REMINDER" | jq -Rs .)"
else
  # Nothing to do.
  exit 0
fi
