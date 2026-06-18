#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
ASSERT_SCRIPT="$SCRIPT_DIR/workflow-assert-delivery-ready.sh"
TRANSITION_SCRIPT="$SCRIPT_DIR/workflow-transition.sh"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"
PREVIEW_MANAGER_SCRIPT="$SCRIPT_DIR/preview-manager.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1

sh "$ASSERT_SCRIPT" "$SLUG" >/dev/null
CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$PROJECTS_ROOT/$SLUG/.webgen/workflow-state.json")
if [ "$CURRENT_STAGE" = "verification" ]; then
  sh "$TRANSITION_SCRIPT" "$SLUG" design-review >/dev/null
fi
sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pass "交付前设计复核与文档检查通过" >/dev/null
sh "$SYNC_SCRIPT" "$SLUG" "交付 gate 已通过" >/dev/null
zsh "$PREVIEW_MANAGER_SCRIPT" stop-others "$SLUG" >/dev/null 2>&1 || true

echo "WORKFLOW DELIVER OK: $SLUG"
