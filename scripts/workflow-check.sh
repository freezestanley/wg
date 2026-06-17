#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"
VERIFY_SCAFFOLD_SCRIPT="$SCRIPT_DIR/project-verify-scaffold.sh"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"
PAGE_DESIGN_GUARD_SCRIPT="$SCRIPT_DIR/page-design-guard.mjs"
CONTEXT_SUMMARY_SCRIPT="$SCRIPT_DIR/project-context-summary.mjs"
DISCOVERY_GAP_SCRIPT="$SCRIPT_DIR/project-discovery-gap.mjs"

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
  if [ -n "${PROJECT_ROOT:-}" ] && [ -f "$CONTEXT_SUMMARY_SCRIPT" ]; then
    case "$1" in
      *DISCOVERY.md*|*方案尚未确认*)
        echo "PROJECT CONTEXT SUMMARY:" >&2
        node "$CONTEXT_SUMMARY_SCRIPT" "$PROJECT_ROOT" >&2 || true
        if [ -f "$DISCOVERY_GAP_SCRIPT" ]; then
          echo "DISCOVERY GAP:" >&2
          node "$DISCOVERY_GAP_SCRIPT" "$PROJECT_ROOT" >&2 || true
        fi
        ;;
    esac
  fi
  echo "WORKFLOW CHECK FAILED: $1" >&2
  exit 2
}

gate_for_action() {
  MAPPED_GATE=""
  case "$1" in
    start-implementation) MAPPED_GATE="proposal" ;;
    write-code) MAPPED_GATE="implementation" ;;
    start-verification) MAPPED_GATE="verification" ;;
    start-design-review) MAPPED_GATE="designReview" ;;
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
    sh "$SET_GATE_SCRIPT" "$SLUG" session Pass "session-lock 对账通过" >/dev/null
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
}

check_discovery_required_fields() {
  DISCOVERY_FILE="$PROJECT_ROOT/DISCOVERY.md"
  [ -f "$DISCOVERY_FILE" ] || fail "缺少 DISCOVERY.md"
  grep -q '## Design Read' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Design Read"
  grep -q 'DESIGN_VARIANCE' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 DESIGN_VARIANCE"
  grep -q 'MOTION_INTENSITY' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 MOTION_INTENSITY"
  grep -q 'VISUAL_DENSITY' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 VISUAL_DENSITY"
  grep -q 'Atmosphere Layer' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Atmosphere Layer"
  grep -q 'PC' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 PC 适配信息"
  grep -q 'Pad' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Pad 适配信息"
  grep -q 'H5' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 H5 适配信息"
}

check_discovery_ready_content() {
  DISCOVERY_FILE="$PROJECT_ROOT/DISCOVERY.md"
  check_discovery_required_fields
  grep -q '^## Design Read' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 Design Read 区块"
  grep -q '^## 审版检查点' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少审版检查点区块"
  grep -q '首屏焦点' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少首屏焦点结论"
  grep -q '证明区策略' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少证明区策略"
  grep -q '内容节奏' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少内容节奏"
  grep -q 'CTA 收口方式' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 CTA 收口方式"
  grep -q 'H5 首屏优先级' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 H5 首屏优先级"
  grep -q '^## 风格档位' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少风格档位区块"
  grep -q '^## 氛围层策略' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少氛围层策略区块"
  grep -q '^## 适配目标' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少适配目标区块"
  grep -q '^## 交互补全状态' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少交互补全状态区块"
  grep -q '^## 输入素材收集' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少输入素材收集"
  grep -q '^## 图片策略' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少图片策略区块"
  grep -q '^## API / 数据策略' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少 API / 数据策略区块"
  grep -q '^## 适配检查清单' "$DISCOVERY_FILE" || fail "DISCOVERY.md 缺少适配检查清单"
  grep -Eq '当前状态：`(Ready|Ready with Assumptions)`' "$DISCOVERY_FILE" || fail "DISCOVERY.md 当前未标记为 Ready"
}

case "$ACTION" in
  start-implementation)
    [ "$CURRENT_STAGE" = "proposal" ] || fail "当前阶段不是 proposal"
    CONFIRMED=$(json_get "$APPROVAL_FILE" confirmed 2>/dev/null || printf 'false')
    CURRENT_PROPOSAL_GATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'Pending')
    [ "$CONFIRMED" = "true" ] || [ "$CURRENT_PROPOSAL_GATE" = "Exception-Pass" ] || fail "方案尚未确认"
    check_lock_if_needed
    check_scaffold
    check_discovery_ready_content
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
    [ "$CURRENT_STAGE" = "implementation" ] || fail "当前阶段不是 implementation"
    check_scaffold
    sh "$SET_GATE_SCRIPT" "$SLUG" implementation Pass "页面主体与实现前置检查已完成" >/dev/null
    sh "$SET_GATE_SCRIPT" "$SLUG" verification Pending "允许进入 verification 阶段" >/dev/null
    ;;
  start-design-review)
    [ "$CURRENT_STAGE" = "verification" ] || fail "当前阶段不是 verification"
    VERIFY_STATUS=$(json_get "$VERIFICATION_FILE" status 2>/dev/null || printf 'pending')
    [ "$VERIFY_STATUS" = "passed" ] || fail "verification 尚未通过"
    node "$PAGE_DESIGN_GUARD_SCRIPT" "$PROJECT_ROOT" >/dev/null || fail "页面设计反模式检查未通过"
    sh "$SET_GATE_SCRIPT" "$SLUG" designReview Pending "允许进入设计复核" >/dev/null
    ;;
  *)
    echo "Invalid action: $ACTION" >&2
    exit 1
    ;;
esac

echo "WORKFLOW CHECK OK: $SLUG $ACTION"
