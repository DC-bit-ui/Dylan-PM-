#!/usr/bin/env bash
# SessionStart hook — surfaces today's context as additionalContext to Claude.
# Output JSON on stdout so Claude Code merges it into the session.
set -euo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
TODAY="$(date +%Y-%m-%d)"
MONTH="$(date +%Y-%m)"

CURRENT_DIR="$ROOT/workspace/current"
LEARNINGS_DIR="$ROOT/memory/learnings/$MONTH"
RETROS_DIR="$ROOT/memory/retros"

# Build a short context payload — what's active, what's recent.
{
  echo "## Session start — $TODAY"
  echo
  echo "### Active workspace"
  if [ -d "$CURRENT_DIR" ] && [ -n "$(ls -A "$CURRENT_DIR" 2>/dev/null)" ]; then
    ls -1 "$CURRENT_DIR" | sed 's/^/- /'
  else
    echo "_(empty — Dylan has nothing actively in flight, or hasn't loaded it)_"
  fi
  echo
  echo "### Recent learnings (this month)"
  if [ -d "$LEARNINGS_DIR" ]; then
    ls -1t "$LEARNINGS_DIR" 2>/dev/null | head -5 | sed 's/^/- /'
  else
    echo "_(none yet)_"
  fi
  echo
  echo "### Latest retros"
  if [ -d "$RETROS_DIR" ]; then
    find "$RETROS_DIR" -type f -name '*.md' 2>/dev/null | sort -r | head -3 | sed "s|^$ROOT/|- |"
  else
    echo "_(none yet)_"
  fi
  echo
  echo "Reminder: read \`CLAUDE.md\` if you haven't this session. Capture learnings as you go."
} > /tmp/claude-session-context.md

CONTEXT=$(jq -Rs . < /tmp/claude-session-context.md)
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$CONTEXT"
