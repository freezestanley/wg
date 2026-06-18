#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
TRANSITION_SCRIPT="$SCRIPT_DIR/workflow-transition.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"
COMPACT_REQUEST_SCRIPT="$SCRIPT_DIR/workflow-request-compact.sh"

usage() {
  echo "Usage: $0 <project-slug> <summary>" >&2
  exit 1
}

[ "$#" -eq 2 ] || usage
SLUG=$1
SUMMARY=$2

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
APPROVAL_FILE="$PROJECT_ROOT/.webgen/approval.json"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$APPROVAL_FILE" "$SUMMARY" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const summary = process.argv[3];
const now = new Date().toISOString();
const data = {
  confirmed: true,
  confirmedAt: now,
  source: 'user-message',
  summary
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

sh "$SET_GATE_SCRIPT" "$SLUG" proposal Pass "$SUMMARY" >/dev/null

CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$STATE_FILE")
if [ "$CURRENT_STAGE" = "discovery" ]; then
  sh "$TRANSITION_SCRIPT" "$SLUG" proposal >/dev/null
fi

sh "$SYNC_SCRIPT" "$SLUG" "方案确认已记录" >/dev/null
sh "$COMPACT_REQUEST_SCRIPT" "$SLUG" discovery proposal workflow-record-approval >/dev/null

echo "APPROVAL RECORDED: $SLUG"
