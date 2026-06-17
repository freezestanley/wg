#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK_SCRIPT="$SCRIPT_DIR/workflow-check.sh"
TRANSITION_SCRIPT="$SCRIPT_DIR/workflow-transition.sh"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"
COMPACT_REQUEST_SCRIPT="$SCRIPT_DIR/workflow-request-compact.sh"

usage() {
  echo "Usage: $0 <project-slug> [sessionKey]" >&2
  exit 1
}

[ "$#" -ge 1 ] && [ "$#" -le 2 ] || usage
SLUG=$1
SESSION_KEY=${2:-}

if [ -n "$SESSION_KEY" ]; then
  sh "$CHECK_SCRIPT" "$SLUG" start-implementation "$SESSION_KEY" >/dev/null
else
  sh "$CHECK_SCRIPT" "$SLUG" start-implementation >/dev/null
fi
sh "$TRANSITION_SCRIPT" "$SLUG" implementation >/dev/null
sh "$SYNC_SCRIPT" "$SLUG" "已进入 implementation 阶段" >/dev/null
sh "$COMPACT_REQUEST_SCRIPT" "$SLUG" proposal implementation workflow-enter-implementation >/dev/null

echo "WORKFLOW ENTER IMPLEMENTATION OK: $SLUG"
