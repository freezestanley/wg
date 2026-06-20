#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> [--verbose]" >&2
  exit 1
}

[ "$#" -ge 1 ] && [ "$#" -le 2 ] || usage
SLUG=$1
VERBOSE=0

if [ "$#" -eq 2 ]; then
  [ "$2" = "--verbose" ] || usage
  VERBOSE=1
fi

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
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$SLUG" "$PROJECT_ROOT" "$STATE_FILE" "$APPROVAL_FILE" "$VERIFICATION_FILE" "$DELIVERY_FILE" "$DESIGN_REVIEW_FILE" "$PUBLISH_FILE" "$VERBOSE" <<'NODE'
const fs = require('fs');

const [slug, projectRoot, stateFile, approvalFile, verificationFile, deliveryFile, designReviewFile, publishFile, verboseFlag] = process.argv.slice(2);
const verbose = verboseFlag === '1';

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
const publish = readJson(publishFile, { status: 'pending', checkedAt: null, notes: null, gate: 'Pending' });

const gateOrder = [
  ['route', 'Route Gate'],
  ['session', 'Session Gate'],
  ['proposal', 'Proposal Gate'],
  ['implementation', 'Implementation Gate'],
  ['verification', 'Verification Gate'],
  ['designReview', 'Design Review Gate'],
  ['publish', 'Publish Gate']
];

const nextStepByStage = {
  routing: ['完成项目路由与 session 对账'],
  discovery: ['先看 .webgen/discovery-gap.txt', '一次补齐 Discovery 与输入素材收集缺口'],
  proposal: ['输出方案并获得确认，或记录直接做例外'],
  implementation: ['继续页面实现', '补齐关键交互与四类状态'],
  verification: ['执行 build / preview / scaffold 校验', '记录验证结果'],
  'design-review': ['执行页面实看与设计复核', '必要时继续优化一轮'],
  publish: ['确认用户是否明确回复“发布”', '调用发布脚本并记录结果']
};

const gates = {
  route: 'Pending',
  session: 'Pending',
  proposal: 'Pending',
  implementation: 'Pending',
  verification: 'Pending',
  designReview: 'Pending',
  publish: 'Pending',
  ...(state.gates || {})
};
const awaitingPublishConfirmation = gates.designReview === 'Pass' && gates.publish === 'Pending';

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
const publishStatus = publish.status !== 'pending'
  ? publish.status
  : gates.publish === 'Pass'
    ? 'passed-by-gate'
    : gates.publish === 'Exception-Pass'
      ? 'exception-pass'
      : gates.publish === 'Fail'
        ? 'failed-by-gate'
        : 'pending';
const blockers = [];
for (const [key, label] of gateOrder) {
  if (gates[key] === 'Fail') blockers.push(`${label}: ${notes[key] || '未记录原因'}`);
  if (gates[key] === 'Pending') blockers.push(`${label}: 待完成`);
}

const approvalStatus = approval.confirmed
  ? 'confirmed'
  : gates.proposal === 'Exception-Pass'
    ? 'exception-pass'
    : 'pending';
const nextSteps = awaitingPublishConfirmation
  ? ['确认用户是否明确回复“发布”', '固定追问：当前项目已验收通过，是否立即发布当前构建包？请回复“发布”或“不发布”。']
  : (nextStepByStage[state.currentStage] || ['根据当前阶段继续推进']);

if (!verbose) {
  const lines = [];
  lines.push(`project: ${projectRoot}`);
  lines.push(`stage: ${state.currentStage || 'unknown'}`);
  lines.push(`approval: ${approvalStatus}`);
  lines.push(`verification: ${verificationStatus}`);
  lines.push(`design-review: ${designReviewStatus}`);
  lines.push(`publish: ${publishStatus}`);
  lines.push(`gates: ${gateOrder.map(([key]) => `${key}=${gates[key]}`).join(' ')}`);
  lines.push(`next: ${nextSteps.join('；')}`);
  if (blockers.length) {
    lines.push(`blockers: ${blockers.join('；')}`);
  }
  if (delivery.missing && delivery.missing.length) {
    lines.push(`delivery-missing: ${delivery.missing.join('；')}`);
  }
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(0);
}

const lines = [];
lines.push(`# Workflow Report / ${slug}`);
lines.push('');
lines.push(`- 当前阶段：${state.currentStage || 'unknown'}`);
lines.push(`- 最近更新时间：${state.updatedAt || '未知'}`);
lines.push(`- 方案确认：${approval.confirmed ? `已确认（${approval.confirmedAt || '时间未知'}）` : gates.proposal === 'Exception-Pass' ? '例外通过' : '待确认'}`);
lines.push(`- 验证状态：${verificationStatus}`);
lines.push(`- 设计复核：${designReviewStatus}`);
lines.push(`- 发布状态：${publishStatus}`);
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
for (const item of nextSteps) {
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
if (publish.notes) {
  lines.push('');
  lines.push('## Publish Notes');
  lines.push(`- ${publish.notes}`);
}
if (publish.status !== 'pending') {
  const publishDetails = [];
  if (publish.jobId) publishDetails.push(`- jobId: ${publish.jobId}`);
  if (publish.pollUrl) publishDetails.push(`- pollUrl: ${publish.pollUrl}`);
  if (publish.endpoint) publishDetails.push(`- endpoint: ${publish.endpoint}`);
  if (publish.publishedUrl) publishDetails.push(`- publishedUrl: ${publish.publishedUrl}`);
  if (publish.remoteStatus !== undefined && publish.remoteStatus !== null) {
    publishDetails.push(`- remoteStatus: ${publish.remoteStatus}`);
  }
  if (publishDetails.length) {
    lines.push('');
    lines.push('## Publish Detail');
    for (const item of publishDetails) lines.push(item);
  }
}

process.stdout.write(lines.join('\n') + '\n');
NODE
