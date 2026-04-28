#!/usr/bin/env bash
# PreCompact hook — reminds Claude to distil the session into memory before
# the conversation gets compressed.
set -euo pipefail

REMINDER="About to compact context. Before continuing: scan this session for anything not yet captured (decisions, preferences, business facts, stakeholders) and append them to the right memory/ file. Do this NOW, then proceed."

printf '{"hookSpecificOutput":{"hookEventName":"PreCompact","additionalContext":%s}}\n' \
  "$(printf '%s' "$REMINDER" | jq -Rs .)"
