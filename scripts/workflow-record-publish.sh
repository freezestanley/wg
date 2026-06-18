#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
TRANSITION_SCRIPT="$SCRIPT_DIR/workflow-transition.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"
PUBLISH_SCRIPT="$SCRIPT_DIR/project-publish.sh"

usage() {
  echo "Usage: $0 <project-slug> <publish|skipped> [note]" >&2
  exit 1
}

[ "$#" -ge 2 ] && [ "$#" -le 3 ] || usage
SLUG=$1
ACTION=$2
NOTE=${3:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$ACTION" in
  publish|skipped) ;;
  *)
    echo "Invalid publish action: $ACTION" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

CURRENT_STAGE=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.currentStage);' "$STATE_FILE")
if [ "$CURRENT_STAGE" = "design-review" ]; then
  sh "$TRANSITION_SCRIPT" "$SLUG" publish >/dev/null
fi

if [ "$ACTION" = "skipped" ]; then
  node - "$PUBLISH_FILE" "$NOTE" <<'NODE'
const fs = require("fs");

const [file, notes] = process.argv.slice(2);
const now = new Date().toISOString();
const next = {
  status: "skipped",
  gate: "Exception-Pass",
  userConfirmed: false,
  artifact: null,
  artifactSha256: null,
  endpoint: null,
  remoteStatus: null,
  releaseId: null,
  publishedUrl: null,
  checkedAt: now,
  publishedAt: null,
  notes: notes || "用户选择不发布"
};
fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE
  sh "$SET_GATE_SCRIPT" "$SLUG" publish Exception-Pass "${NOTE:-用户选择不发布}" >/dev/null
  sh "$SYNC_SCRIPT" "$SLUG" "发布已跳过" >/dev/null
  echo "PUBLISH RECORDED: $SLUG skipped"
  exit 0
fi

if sh "$PUBLISH_SCRIPT" "$SLUG" >/dev/null; then
  PUBLISH_STATUS=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.status || "pending");' "$PUBLISH_FILE")
  case "$PUBLISH_STATUS" in
    published|queued)
      sh "$SET_GATE_SCRIPT" "$SLUG" publish Pass "${NOTE:-发布完成}" >/dev/null
      sh "$SYNC_SCRIPT" "$SLUG" "发布结果已记录：$PUBLISH_STATUS" >/dev/null
      echo "PUBLISH RECORDED: $SLUG $PUBLISH_STATUS"
      ;;
    *)
      sh "$SET_GATE_SCRIPT" "$SLUG" publish Fail "${NOTE:-发布失败}" >/dev/null
      sh "$SYNC_SCRIPT" "$SLUG" "发布失败" >/dev/null
      echo "Publish status invalid: $PUBLISH_STATUS" >&2
      exit 1
      ;;
  esac
else
  sh "$SET_GATE_SCRIPT" "$SLUG" publish Fail "${NOTE:-发布失败}" >/dev/null
  sh "$SYNC_SCRIPT" "$SLUG" "发布失败" >/dev/null
  exit 1
fi
