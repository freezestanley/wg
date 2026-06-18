#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"

usage() {
  echo "Usage: $0 <project-slug> <next-stage>" >&2
  exit 1
}

[ "$#" -eq 2 ] || usage
SLUG=$1
NEXT_STAGE=$2

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$NEXT_STAGE" in
  routing|discovery|proposal|implementation|verification|design-review|publish) ;;
  *)
    echo "Invalid next stage: $NEXT_STAGE" >&2
    exit 1
    ;;
esac

STATE_FILE="$PROJECTS_ROOT/$SLUG/.webgen/workflow-state.json"
[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$STATE_FILE" "$NEXT_STAGE" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const nextStage = process.argv[3];
const now = new Date().toISOString();
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const defaultGates = {
  route: 'Pending',
  session: 'Pending',
  proposal: 'Pending',
  implementation: 'Pending',
  verification: 'Pending',
  designReview: 'Pending',
  publish: 'Pending'
};
data.gates = { ...defaultGates, ...(data.gates || {}) };
data.notes = data.notes || {};
const currentStage = data.currentStage;
const allowed = {
  routing: ['discovery'],
  discovery: ['proposal'],
  proposal: ['implementation'],
  implementation: ['verification'],
  verification: ['implementation', 'design-review'],
  'design-review': ['implementation', 'publish'],
  publish: ['design-review']
};
if (!allowed[currentStage]) {
  console.error(`Unknown current stage: ${currentStage}`);
  process.exit(2);
}
if (currentStage === nextStage) {
  process.stdout.write(`WORKFLOW STAGE UNCHANGED: ${currentStage}\n`);
  process.exit(0);
}
if (!allowed[currentStage].includes(nextStage)) {
  console.error(`Illegal workflow transition: ${currentStage} -> ${nextStage}`);
  process.exit(3);
}
data.currentStage = nextStage;
data.updatedAt = now;
data.history = Array.isArray(data.history) ? data.history : [];
data.history.push({ stage: nextStage, at: now, by: 'workflow-transition' });
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
process.stdout.write(`WORKFLOW STAGE OK: ${currentStage} -> ${nextStage}\n`);
NODE

case "$NEXT_STAGE" in
  discovery)
    sh "$SET_GATE_SCRIPT" "$SLUG" session Pending "待完成 session 对账或项目初始化后的锁定" >/dev/null
    ;;
  proposal)
    sh "$SET_GATE_SCRIPT" "$SLUG" proposal Pending "已进入 proposal 阶段，待确认方案或记录例外" >/dev/null
    ;;
  implementation)
    sh "$SET_GATE_SCRIPT" "$SLUG" implementation Pending "已进入 implementation 阶段，待完成页面主体与交互" >/dev/null
    ;;
  verification)
    sh "$SET_GATE_SCRIPT" "$SLUG" verification Pending "已进入 verification 阶段，待完成实际验证" >/dev/null
    ;;
  design-review)
    sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pending "已进入 design-review 阶段，待完成页面实看复核" >/dev/null
    ;;
  publish)
    sh "$SET_GATE_SCRIPT" "$SLUG" publish Pending "已进入 publish 阶段，待确认是否发布或记录发布结果" >/dev/null
    ;;
esac
