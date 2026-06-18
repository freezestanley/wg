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
  echo "Usage: $0 <project-slug> <passed|failed> <notes> [commands]" >&2
  exit 1
}

[ "$#" -ge 3 ] && [ "$#" -le 4 ] || usage
SLUG=$1
STATUS=$2
NOTES=$3
COMMANDS=${4:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$STATUS" in
  passed|failed) ;;
  *)
    echo "Invalid verification status: $STATUS" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$STATE_FILE")
if [ "$CURRENT_STAGE" = "implementation" ]; then
  sh "$TRANSITION_SCRIPT" "$SLUG" verification >/dev/null
fi

node - "$VERIFICATION_FILE" "$STATUS" "$NOTES" "$COMMANDS" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const status = process.argv[3];
const notes = process.argv[4];
const commandsRaw = process.argv[5] || '';
const now = new Date().toISOString();
const commands = commandsRaw
  ? commandsRaw.split(';;').map((item) => item.trim()).filter(Boolean)
  : [];
const data = {
  status,
  checkedAt: now,
  items: {},
  commands,
  notes
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

if [ "$STATUS" = "passed" ]; then
  sh "$SET_GATE_SCRIPT" "$SLUG" verification Pass "$NOTES" >/dev/null
  sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pending "验证已通过，待页面实看设计复核" >/dev/null
else
  sh "$SET_GATE_SCRIPT" "$SLUG" verification Fail "$NOTES" >/dev/null
  sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pending "验证未通过，需回到实现修复" >/dev/null
fi

CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$STATE_FILE")
if [ "$STATUS" = "passed" ]; then
  :
else
  if [ "$CURRENT_STAGE" = "verification" ]; then
    sh "$TRANSITION_SCRIPT" "$SLUG" implementation >/dev/null
  fi
fi

sh "$SYNC_SCRIPT" "$SLUG" "验证结果已记录：$STATUS" >/dev/null

if [ "$STATUS" = "passed" ]; then
  sh "$COMPACT_REQUEST_SCRIPT" "$SLUG" implementation verification workflow-record-verification >/dev/null
fi

echo "VERIFICATION RECORDED: $SLUG $STATUS"
