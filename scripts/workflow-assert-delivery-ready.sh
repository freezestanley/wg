#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"
VERIFY_SCAFFOLD_SCRIPT="$SCRIPT_DIR/project-verify-scaffold.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

json_get() {
  node -e 'const fs=require("fs"); const file=process.argv[1]; const key=process.argv[2].split("."); const data=JSON.parse(fs.readFileSync(file,"utf8")); let cur=data; for (const k of key) { if (cur == null || !(k in cur)) process.exit(2); cur=cur[k]; } if (cur === null) process.exit(2); process.stdout.write(String(cur));' "$1" "$2"
}

[ "$#" -eq 1 ] || usage
SLUG=$1

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
CONFIG_FILE="$PROJECT_ROOT/.webgen/config.json"
APPROVAL_FILE="$PROJECT_ROOT/.webgen/approval.json"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"
DELIVERY_FILE="$PROJECT_ROOT/.webgen/checks/delivery.json"
DISCOVERY_FILE="$PROJECT_ROOT/DISCOVERY.md"

MISSING=""
add_missing() {
  MISSING="$MISSING\n- $1"
}

[ -f "$STATE_FILE" ] || add_missing "workflow-state.json"
[ -f "$VERIFICATION_FILE" ] || add_missing "verification.json"
[ -f "$DISCOVERY_FILE" ] || add_missing "DISCOVERY.md"
[ -f "$PROJECT_ROOT/PROJECT.md" ] || add_missing "PROJECT.md"
[ -f "$PROJECT_ROOT/ASSETS.md" ] || add_missing "ASSETS.md"
[ -f "$PROJECT_ROOT/API.md" ] || add_missing "API.md"
[ -f "$PROJECT_ROOT/HANDOFF.md" ] || add_missing "HANDOFF.md"

PROPOSAL_GATE_STATE="pending"
if [ -f "$STATE_FILE" ]; then
  PROPOSAL_GATE_STATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'pending')
fi

if [ -f "$APPROVAL_FILE" ]; then
  CONFIRMED=$(json_get "$APPROVAL_FILE" confirmed 2>/dev/null || printf 'false')
  if [ "$CONFIRMED" != "true" ]; then
    [ "$PROPOSAL_GATE_STATE" = "Exception-Pass" ] || add_missing "approval confirmed"
  fi
else
  [ "$PROPOSAL_GATE_STATE" = "Exception-Pass" ] || add_missing "approval.json"
fi

if [ -f "$VERIFICATION_FILE" ]; then
  VERIFY_STATUS=$(json_get "$VERIFICATION_FILE" status 2>/dev/null || printf 'pending')
  [ "$VERIFY_STATUS" = "passed" ] || add_missing "verification passed"
fi

if [ -f "$DISCOVERY_FILE" ]; then
  grep -q '## Design Read' "$DISCOVERY_FILE" || add_missing "DISCOVERY Design Read"
  grep -q 'DESIGN_VARIANCE' "$DISCOVERY_FILE" || add_missing "DISCOVERY DESIGN_VARIANCE"
  grep -q 'MOTION_INTENSITY' "$DISCOVERY_FILE" || add_missing "DISCOVERY MOTION_INTENSITY"
  grep -q 'VISUAL_DENSITY' "$DISCOVERY_FILE" || add_missing "DISCOVERY VISUAL_DENSITY"
  grep -q 'PC' "$DISCOVERY_FILE" || add_missing "DISCOVERY PC"
  grep -q 'Pad' "$DISCOVERY_FILE" || add_missing "DISCOVERY Pad"
  grep -q 'H5' "$DISCOVERY_FILE" || add_missing "DISCOVERY H5"
  ! grep -q '^- 页面类型 / 受众 / 风格语言 / 设计体系：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Design Read ready"
  ! grep -q '^- DESIGN_VARIANCE：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY DESIGN_VARIANCE ready"
  ! grep -q '^- MOTION_INTENSITY：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY MOTION_INTENSITY ready"
  ! grep -q '^- VISUAL_DENSITY：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY VISUAL_DENSITY ready"
  ! grep -q '^- PC：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY PC ready"
  ! grep -q '^- Pad：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Pad ready"
  ! grep -q '^- H5：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY H5 ready"
  ! grep -q '^- 触屏 hover 替代策略：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY hover 替代 ready"
  ! grep -q '^- Loading：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Loading ready"
  ! grep -q '^- Empty：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Empty ready"
  ! grep -q '^- Error：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Error ready"
  ! grep -q '^- Active Feedback：.*待确认' "$DISCOVERY_FILE" || add_missing "DISCOVERY Active Feedback ready"
  grep -q '\[x\] 已确认 `PC / Pad / H5` 的主要使用任务' "$DISCOVERY_FILE" || add_missing "DISCOVERY checklist PC / Pad / H5"
  grep -q '\[x\] 已确认主要断点或内容驱动断点' "$DISCOVERY_FILE" || add_missing "DISCOVERY checklist breakpoints"
  grep -q '\[x\] 已确认 Pad 横竖屏处理方式' "$DISCOVERY_FILE" || add_missing "DISCOVERY checklist pad orientation"
  grep -q '\[x\] 已确认 H5 首屏信息优先级' "$DISCOVERY_FILE" || add_missing "DISCOVERY checklist h5 first screen"
  grep -q '\[x\] 已确认触屏设备的 hover 替代策略' "$DISCOVERY_FILE" || add_missing "DISCOVERY checklist hover fallback"
  grep -Eq '当前状态：`(Ready|Ready with Assumptions)`' "$DISCOVERY_FILE" || add_missing "DISCOVERY Ready"
  grep -q '## 状态门' "$DISCOVERY_FILE" || add_missing "DISCOVERY gates"
fi

if [ -f "$STATE_FILE" ]; then
  DELIVERY_GATE=$(json_get "$STATE_FILE" gates.delivery 2>/dev/null || printf 'pending')
  PROPOSAL_GATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'pending')
  VERIFY_GATE=$(json_get "$STATE_FILE" gates.verification 2>/dev/null || printf 'pending')
  [ "$PROPOSAL_GATE" = "Pass" ] || [ "$PROPOSAL_GATE" = "Exception-Pass" ] || add_missing "proposal gate"
  [ "$VERIFY_GATE" = "Pass" ] || add_missing "verification gate"
  case "$DELIVERY_GATE" in
    Pass|Pending) ;;
    *) add_missing "delivery gate state" ;;
  esac
fi

if [ -f "$CONFIG_FILE" ]; then
  TEMPLATE_ID=$(json_get "$CONFIG_FILE" project.template 2>/dev/null || printf '')
  if [ -n "$TEMPLATE_ID" ]; then
    if ! sh "$VERIFY_SCAFFOLD_SCRIPT" "$SLUG" "$TEMPLATE_ID" >/dev/null 2>&1; then
      add_missing "scaffold verify"
    fi
  else
    add_missing "template id"
  fi
else
  add_missing "config.json"
fi

if [ -n "$MISSING" ]; then
  node - "$DELIVERY_FILE" "$MISSING" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const missingRaw = process.argv[3] || '';
const missing = missingRaw.split('\n').map((line) => line.trim()).filter(Boolean);
const data = {
  status: 'failed',
  checkedAt: new Date().toISOString(),
  missing,
  warnings: []
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE
  printf 'DELIVERY CHECK FAILED:%b\n' "$MISSING" >&2
  exit 2
fi

node - "$DELIVERY_FILE" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const data = {
  status: 'passed',
  checkedAt: new Date().toISOString(),
  missing: [],
  warnings: []
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

sh "$SET_GATE_SCRIPT" "$SLUG" delivery Pass "交付自检门通过" >/dev/null

echo "DELIVERY CHECK OK: $SLUG"
