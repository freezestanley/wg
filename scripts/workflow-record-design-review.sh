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
  echo "Usage: $0 <project-slug> <passed|failed> <notes>" >&2
  exit 1
}

[ "$#" -eq 3 ] || usage
SLUG=$1
STATUS=$2
NOTES=$3

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$STATUS" in
  passed|failed) ;;
  *)
    echo "Invalid design review status: $STATUS" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
DESIGN_REVIEW_FILE="$PROJECT_ROOT/.webgen/checks/design-review.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$STATE_FILE")
if [ "$CURRENT_STAGE" = "verification" ]; then
  sh "$TRANSITION_SCRIPT" "$SLUG" design-review >/dev/null
fi

node - "$DESIGN_REVIEW_FILE" "$STATUS" "$NOTES" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const status = process.argv[3];
const notes = process.argv[4];
const data = {
  status,
  checkedAt: new Date().toISOString(),
  notes
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

if [ "$STATUS" = "passed" ]; then
  sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pass "$NOTES" >/dev/null
else
  sh "$SET_GATE_SCRIPT" "$SLUG" designReview Fail "$NOTES" >/dev/null
fi

sh "$SYNC_SCRIPT" "$SLUG" "设计复核结果已记录：$STATUS" >/dev/null

if [ "$STATUS" = "passed" ]; then
  sh "$COMPACT_REQUEST_SCRIPT" "$SLUG" verification design-review workflow-record-design-review >/dev/null
fi

echo "DESIGN REVIEW RECORDED: $SLUG $STATUS"
