#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"
VERIFY_SCAFFOLD_SCRIPT="$SCRIPT_DIR/project-verify-scaffold.sh"
DELIVERY_ASSERT_SCRIPT="$SCRIPT_DIR/workflow-assert-delivery-ready.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"

usage() {
  echo "Usage: $0 <project-slug> <action> [sessionKey]" >&2
  exit 1
}

json_get() {
  node -e 'const fs=require("fs"); const file=process.argv[1]; const key=process.argv[2].split("."); const data=JSON.parse(fs.readFileSync(file,"utf8")); let cur=data; for (const k of key) { if (cur == null || !(k in cur)) process.exit(2); cur=cur[k]; } if (cur === null) process.exit(2); process.stdout.write(String(cur));' "$1" "$2"
}

fail() {
  if [ -f "$STATE_FILE" ]; then
    gate_for_action "${ACTION:-}" || true
    if [ -n "${MAPPED_GATE:-}" ]; then
      sh "$SET_GATE_SCRIPT" "$SLUG" "$MAPPED_GATE" Fail "$1" >/dev/null 2>&1 || true
    fi
  fi
  echo "WORKFLOW CHECK FAILED: $1" >&2
  exit 2
}

gate_for_action() {
  MAPPED_GATE=""
  case "$1" in
    propose-plan) MAPPED_GATE="discovery" ;;
    start-implementation) MAPPED_GATE="proposal" ;;
    write-code) MAPPED_GATE="implementation" ;;
    start-verification) MAPPED_GATE="verification" ;;
    deliver) MAPPED_GATE="delivery" ;;
  esac
}

[ "$#" -ge 2 ] && [ "$#" -le 3 ] || usage
SLUG=$1
ACTION=$2
SESSION_KEY=${3:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
CONFIG_FILE="$PROJECT_ROOT/.webgen/config.json"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
APPROVAL_FILE="$PROJECT_ROOT/.webgen/approval.json"
LOCK_FILE="$PROJECT_ROOT/.webgen/session-lock.json"
SCAFFOLD_FILE="$PROJECT_ROOT/.webgen/checks/scaffold.json"
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"

[ -f "$STATE_FILE" ] || fail "缺少 workflow-state.json"
CURRENT_STAGE=$(json_get "$STATE_FILE" currentStage)

check_lock_if_needed() {
  if [ -n "$SESSION_KEY" ]; then
    [ -f "$LOCK_FILE" ] || fail "缺少 session-lock.json"
    LOCK_SESSION=$(json_get "$LOCK_FILE" sessionKey)
    [ "$LOCK_SESSION" = "$SESSION_KEY" ] || fail "sessionKey 不匹配"
  fi
}

check_scaffold() {
  [ -f "$CONFIG_FILE" ] || fail "缺少 .webgen/config.json"
  TEMPLATE_ID=$(json_get "$CONFIG_FILE" project.template)
  sh "$VERIFY_SCAFFOLD_SCRIPT" "$SLUG" "$TEMPLATE_ID" >/dev/null
  node - "$SCAFFOLD_FILE" "$TEMPLATE_ID" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const templateId = process.argv[3];
const data = {
  status: 'passed',
  templateId,
  checkedAt: new Date().toISOString()
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE
  sh "$SET_GATE_SCRIPT" "$SLUG" scaffold Pass "scaffold 校验通过：$TEMPLATE_ID" >/dev/null
}

check_discovery_required_fields() {
  DISCOVERY_FILE="$PROJECT_ROOT/DISCOVERY.md"
  [ -f "$DISCOVERY_FILE" ] || fail "缺少 DISCOVERY.md"
  grep -q '## Design Read' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Design Read"
  grep -q 'DESIGN_VARIANCE' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 DESIGN_VARIANCE"
  grep -q 'MOTION_INTENSITY' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 MOTION_INTENSITY"
  grep -q 'VISUAL_DENSITY' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 VISUAL_DENSITY"
  grep -q 'PC' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 PC 适配信息"
  grep -q 'Pad' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Pad 适配信息"
  grep -q 'H5' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 H5 适配信息"
}

check_discovery_ready_content() {
  DISCOVERY_FILE="$PROJECT_ROOT/DISCOVERY.md"
  check_discovery_required_fields
  grep -q '^## Design Read' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Design Read 区块"
  grep -q '^- 页面类型 / 受众 / 风格语言 / 设计体系：' "$DISCOVERY_FILE" || fail "Design Read 未填写"
  ! grep -q '^- 页面类型 / 受众 / 风格语言 / 设计体系：.*待确认' "$DISCOVERY_FILE" || fail "Design Read 仍为待确认"
  ! grep -q '^- DESIGN_VARIANCE：.*待确认' "$DISCOVERY_FILE" || fail "DESIGN_VARIANCE 仍为待确认"
  ! grep -q '^- MOTION_INTENSITY：.*待确认' "$DISCOVERY_FILE" || fail "MOTION_INTENSITY 仍为待确认"
  ! grep -q '^- VISUAL_DENSITY：.*待确认' "$DISCOVERY_FILE" || fail "VISUAL_DENSITY 仍为待确认"
  ! grep -q '^- PC：.*待确认' "$DISCOVERY_FILE" || fail "PC 适配策略仍为待确认"
  ! grep -q '^- Pad：.*待确认' "$DISCOVERY_FILE" || fail "Pad 适配策略仍为待确认"
  ! grep -q '^- H5：.*待确认' "$DISCOVERY_FILE" || fail "H5 适配策略仍为待确认"
  ! grep -q '^- 触屏 hover 替代策略：.*待确认' "$DISCOVERY_FILE" || fail "触屏 hover 替代策略仍为待确认"
  ! grep -q '^- Loading：.*待确认' "$DISCOVERY_FILE" || fail "Loading 状态仍为待确认"
  ! grep -q '^- Empty：.*待确认' "$DISCOVERY_FILE" || fail "Empty 状态仍为待确认"
  ! grep -q '^- Error：.*待确认' "$DISCOVERY_FILE" || fail "Error 状态仍为待确认"
  ! grep -q '^- Active Feedback：.*待确认' "$DISCOVERY_FILE" || fail "Active Feedback 状态仍为待确认"
  grep -q '\[x\] 已确认 `PC / Pad / H5` 的主要使用任务' "$DISCOVERY_FILE" || fail "适配检查清单未完成 PC / Pad / H5"
  grep -q '\[x\] 已确认主要断点或内容驱动断点' "$DISCOVERY_FILE" || fail "适配检查清单未完成断点策略"
  grep -q '\[x\] 已确认 Pad 横竖屏处理方式' "$DISCOVERY_FILE" || fail "适配检查清单未完成 Pad 横竖屏"
  grep -q '\[x\] 已确认 H5 首屏信息优先级' "$DISCOVERY_FILE" || fail "适配检查清单未完成 H5 首屏优先级"
  grep -q '\[x\] 已确认触屏设备的 hover 替代策略' "$DISCOVERY_FILE" || fail "适配检查清单未完成 hover 替代策略"
  grep -Eq '当前状态：`(Ready|Ready with Assumptions)`' "$DISCOVERY_FILE" || fail "DISCOVERY.md 当前未标记为 Ready"
  grep -q '## 输入素材收集' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少输入素材收集"
  grep -q '### 文案素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少文案素材"
  grep -q '### 图片素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少图片素材"
  grep -q '### API 与数据素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 API 与数据素材"
  grep -q '### 品牌视觉素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少品牌视觉素材"
  grep -q '### 业务附件素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少业务附件素材"
  grep -q '### 运行与交付素材' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少运行与交付素材"
}

case "$ACTION" in
  propose-plan)
    [ "$CURRENT_STAGE" = "discovery" ] || fail "当前阶段不是 discovery"
    sh "$SET_GATE_SCRIPT" "$SLUG" discovery Pending "允许进入 proposal 前检查" >/dev/null
    ;;
  start-implementation)
    [ "$CURRENT_STAGE" = "proposal" ] || fail "当前阶段不是 proposal"
    CONFIRMED=$(json_get "$APPROVAL_FILE" confirmed 2>/dev/null || printf 'false')
    CURRENT_PROPOSAL_GATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'Pending')
    [ "$CONFIRMED" = "true" ] || [ "$CURRENT_PROPOSAL_GATE" = "Exception-Pass" ] || fail "方案尚未确认"
    check_lock_if_needed
    check_scaffold
    check_discovery_ready_content
    sh "$SET_GATE_SCRIPT" "$SLUG" discovery Pass "Discovery 信息与适配策略已齐备" >/dev/null
    sh "$SET_GATE_SCRIPT" "$SLUG" assetInput Pass "输入素材收集已满足进入实现条件" >/dev/null
    if [ "$CURRENT_PROPOSAL_GATE" = "Exception-Pass" ]; then
      sh "$SET_GATE_SCRIPT" "$SLUG" proposal Exception-Pass "按直接做 / 合理假设通过 Proposal Gate" >/dev/null
    else
      sh "$SET_GATE_SCRIPT" "$SLUG" proposal Pass "方案已确认，可进入 implementation" >/dev/null
    fi
    ;;
  write-code)
    [ "$CURRENT_STAGE" = "implementation" ] || fail "当前阶段不是 implementation"
    CONFIRMED=$(json_get "$APPROVAL_FILE" confirmed 2>/dev/null || printf 'false')
    CURRENT_PROPOSAL_GATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'Pending')
    [ "$CONFIRMED" = "true" ] || [ "$CURRENT_PROPOSAL_GATE" = "Exception-Pass" ] || fail "方案尚未确认"
    check_lock_if_needed
    check_scaffold
    sh "$SET_GATE_SCRIPT" "$SLUG" implementation Pending "实现进行中，允许写页面代码" >/dev/null
    ;;
  start-verification)
    [ "$CURRENT_STAGE" = "implementation" ] || [ "$CURRENT_STAGE" = "asset-api-sync" ] || fail "当前阶段不是 implementation / asset-api-sync"
    check_scaffold
    sh "$SET_GATE_SCRIPT" "$SLUG" implementation Pass "页面主体与实现前置检查已完成" >/dev/null
    sh "$SET_GATE_SCRIPT" "$SLUG" verification Pending "允许进入 verification 阶段" >/dev/null
    ;;
  deliver)
    sh "$DELIVERY_ASSERT_SCRIPT" "$SLUG" >/dev/null
    sh "$SET_GATE_SCRIPT" "$SLUG" delivery Pass "交付检查通过，可进入最终交付" >/dev/null
    ;;
  *)
    echo "Invalid action: $ACTION" >&2
    exit 1
    ;;
esac

echo "WORKFLOW CHECK OK: $SLUG $ACTION"
