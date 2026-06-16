#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
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
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
APPROVAL_FILE="$PROJECT_ROOT/.webgen/approval.json"
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"
DELIVERY_FILE="$PROJECT_ROOT/.webgen/checks/delivery.json"
DESIGN_REVIEW_FILE="$PROJECT_ROOT/.webgen/checks/design-review.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$SLUG" "$STATE_FILE" "$APPROVAL_FILE" "$VERIFICATION_FILE" "$DELIVERY_FILE" "$DESIGN_REVIEW_FILE" <<'NODE'
const fs = require('fs');

const [slug, stateFile, approvalFile, verificationFile, deliveryFile, designReviewFile] = process.argv.slice(2);

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const state = readJson(stateFile, {});
const approval = readJson(approvalFile, { confirmed: false, confirmedAt: null, summary: null });
const verification = readJson(verificationFile, { status: 'pending', checkedAt: null, notes: null });
const delivery = readJson(deliveryFile, { status: 'pending', checkedAt: null, missing: [], warnings: [] });
const designReview = readJson(designReviewFile, { status: 'pending', checkedAt: null, notes: null });

const gateOrder = [
  ['route', 'Route Gate'],
  ['session', 'Session Gate'],
  ['proposal', 'Proposal Gate'],
  ['implementation', 'Implementation Gate'],
  ['verification', 'Verification Gate'],
  ['designReview', 'Design Review Gate']
];

const nextStepByStage = {
  routing: ['完成项目路由与 session 对账'],
  discovery: ['补齐 Discovery 信息', '补齐输入素材收集'],
  proposal: ['输出方案并获得确认，或记录直接做例外'],
  implementation: ['继续页面实现', '补齐关键交互与四类状态'],
  verification: ['执行 build / preview / scaffold 校验', '记录验证结果'],
  'design-review': ['执行页面实看与设计复核', '必要时继续优化一轮']
};

const gates = {
  route: 'Pending',
  session: 'Pending',
  proposal: 'Pending',
  implementation: 'Pending',
  verification: 'Pending',
  designReview: 'Pending',
  ...(state.gates || {})
};

const notes = state.notes || {};
const verificationStatus = verification.status !== 'pending'
  ? verification.status
  : gates.verification === 'Pass'
    ? 'passed-by-gate'
    : gates.verification === 'Fail'
      ? 'failed-by-gate'
      : 'pending';
const designReviewStatus = designReview.status !== 'pending'
  ? designReview.status
  : gates.designReview === 'Pass'
    ? 'passed-by-gate'
    : gates.designReview === 'Fail'
      ? 'failed-by-gate'
      : 'pending';
const blockers = [];
for (const [key, label] of gateOrder) {
  if (gates[key] === 'Fail') blockers.push(`${label}: ${notes[key] || '未记录原因'}`);
  if (gates[key] === 'Pending') blockers.push(`${label}: 待完成`);
}

const lines = [];
lines.push(`# Workflow Report / ${slug}`);
lines.push('');
lines.push(`- 当前阶段：${state.currentStage || 'unknown'}`);
lines.push(`- 最近更新时间：${state.updatedAt || '未知'}`);
lines.push(`- 方案确认：${approval.confirmed ? `已确认（${approval.confirmedAt || '时间未知'}）` : gates.proposal === 'Exception-Pass' ? '例外通过' : '待确认'}`);
lines.push(`- 验证状态：${verificationStatus}`);
lines.push(`- 设计复核：${designReviewStatus}`);
lines.push('');
lines.push('## Gates');
for (const [key, label] of gateOrder) {
  lines.push(`- ${label}: ${gates[key]}`);
  if (notes[key]) lines.push(`  - note: ${notes[key]}`);
}
lines.push('');
lines.push('## Blockers');
if (blockers.length) {
  for (const blocker of blockers) lines.push(`- ${blocker}`);
} else {
  lines.push('- 当前无阻塞 Gate');
}
lines.push('');
lines.push('## Next Steps');
for (const item of nextStepByStage[state.currentStage] || ['根据当前阶段继续推进']) {
  lines.push(`- ${item}`);
}
if (delivery.missing && delivery.missing.length) {
  lines.push('');
  lines.push('## Delivery Missing');
  for (const item of delivery.missing) lines.push(`- ${item}`);
}
if (verification.notes) {
  lines.push('');
  lines.push('## Verification Notes');
  lines.push(`- ${verification.notes}`);
}
if (designReview.notes) {
  lines.push('');
  lines.push('## Design Review Notes');
  lines.push(`- ${designReview.notes}`);
}

process.stdout.write(lines.join('\n') + '\n');
NODE
