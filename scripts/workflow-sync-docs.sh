#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> [note]" >&2
  exit 1
}

[ "$#" -ge 1 ] && [ "$#" -le 2 ] || usage
SLUG=$1
NOTE=${2:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
PROJECT_FILE="$PROJECT_ROOT/PROJECT.md"
HANDOFF_FILE="$PROJECT_ROOT/HANDOFF.md"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
APPROVAL_FILE="$PROJECT_ROOT/.webgen/approval.json"
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"
DELIVERY_FILE="$PROJECT_ROOT/.webgen/checks/delivery.json"
DESIGN_REVIEW_FILE="$PROJECT_ROOT/.webgen/checks/design-review.json"
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"
SUMMARY_FILE="$PROJECT_ROOT/.webgen/context-summary.txt"
SUMMARY_SCRIPT="$SCRIPT_DIR/project-context-summary.mjs"
DISCOVERY_GAP_FILE="$PROJECT_ROOT/.webgen/discovery-gap.txt"
DISCOVERY_GAP_SCRIPT="$SCRIPT_DIR/project-discovery-gap.mjs"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$PROJECT_FILE" "$HANDOFF_FILE" "$STATE_FILE" "$APPROVAL_FILE" "$VERIFICATION_FILE" "$DELIVERY_FILE" "$DESIGN_REVIEW_FILE" "$PUBLISH_FILE" "$NOTE" <<'NODE'
const fs = require('fs');
const [projectFile, handoffFile, stateFile, approvalFile, verificationFile, deliveryFile, designReviewFile, publishFile, note] = process.argv.slice(2);

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const replaceSection = (content, heading, replacement) => {
  const marker = `## ${heading}`;
  const start = content.indexOf(marker);
  if (start === -1) return content;
  const afterHeading = content.indexOf('\n\n', start);
  if (afterHeading === -1) return content;
  const bodyStart = afterHeading + 2;
  const rest = content.slice(bodyStart);
  const nextOffset = rest.search(/^## /m);
  const bodyEnd = nextOffset === -1 ? content.length : bodyStart + nextOffset;
  return `${content.slice(0, bodyStart)}${replacement.trimEnd()}\n\n${content.slice(bodyEnd).replace(/^\n+/, '')}`;
};

const nextStepByStage = {
  discovery: ['- 先看 .webgen/discovery-gap.txt', '- 一次补齐 Discovery 与输入素材收集缺口'],
  proposal: ['- 完成方案确认或记录直接做例外', '- 通过 Proposal Gate 后进入实现'],
  implementation: ['- 继续页面实现', '- 完成后进入 verification'],
  verification: ['- 完成预览/构建验证', '- 记录验证结果'],
  'design-review': ['- 完成页面实看设计复核', '- 记录是否还需继续优化'],
  publish: ['- 确认用户是否明确回复“发布”', '- 记录发布结果']
};

const state = readJson(stateFile, { currentStage: 'unknown', updatedAt: null, gates: {}, notes: {} });
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
const approval = readJson(approvalFile, { confirmed: false });
const verification = readJson(verificationFile, { status: 'pending', checkedAt: null, notes: null });
const delivery = readJson(deliveryFile, { status: 'pending', checkedAt: null });
const designReview = readJson(designReviewFile, { status: 'pending', checkedAt: null, notes: null });
const publish = readJson(publishFile, { status: 'pending', checkedAt: null, notes: null, gate: 'Pending' });
const awaitingPublishConfirmation = gates.designReview === 'Pass' && gates.publish === 'Pending';

const approvalText = approval.confirmed
  ? `已确认（${approval.confirmedAt || '时间未知'}）`
  : gates.proposal === 'Exception-Pass'
    ? '例外通过（按直接做 / 合理假设执行）'
    : gates.proposal === 'Pass'
      ? '已通过 Proposal Gate'
      : '待确认';

const verificationText = verification.status === 'passed'
  ? `已通过（${verification.checkedAt || '时间未知'}）`
  : verification.status === 'failed'
    ? `失败（${verification.checkedAt || '时间未知'}）`
    : gates.verification === 'Pass'
      ? '已通过 Verification Gate'
      : gates.verification === 'Fail'
        ? '未通过 Verification Gate'
        : '待确认';

const designReviewText = designReview.status === 'passed'
  ? `已完成（${designReview.checkedAt || '时间未知'}）`
  : designReview.status === 'failed'
    ? `未通过（${designReview.checkedAt || '时间未知'}）`
    : gates.designReview === 'Pass'
      ? '已通过 Design Review Gate'
      : gates.designReview === 'Fail'
        ? '未通过 Design Review Gate'
        : '待确认';
const publishText = publish.status === 'published'
  ? `已发布（${publish.publishedAt || publish.checkedAt || '时间未知'}）`
  : publish.status === 'queued'
    ? `已入队（${publish.checkedAt || '时间未知'}）`
    : publish.status === 'skipped'
      ? '已跳过发布'
      : publish.status === 'failed'
        ? `发布失败（${publish.checkedAt || '时间未知'}）`
        : awaitingPublishConfirmation
          ? '待确认（当前项目已验收通过，先确认用户是否发布）'
        : gates.publish === 'Exception-Pass'
          ? '用户选择不发布'
          : gates.publish === 'Pass'
            ? '已通过 Publish Gate'
            : gates.publish === 'Fail'
              ? '未通过 Publish Gate'
              : '待确认';

const nextSteps = awaitingPublishConfirmation
  ? [
      '- 当前项目已验收通过，先确认用户是否发布',
      '- 固定追问：当前项目已验收通过，是否立即发布当前构建包？请回复“发布”或“不发布”。'
    ]
  : (nextStepByStage[state.currentStage] || ['- 根据当前阶段继续推进']);

if (fs.existsSync(projectFile)) {
  let project = fs.readFileSync(projectFile, 'utf8');
  project = replaceSection(project, 'Workflow 状态', [
    `- 当前阶段：\`${state.currentStage}\``,
    `- 方案确认：${approvalText}`,
    `- 验证状态：${verificationText}`,
    `- 设计复核：${designReviewText}`,
    `- 发布状态：${publishText}`
  ].join('\n'));
  project = replaceSection(project, 'Gate 状态', [
    `- Route Gate：\`${gates.route}\``,
    `- Session Gate：\`${gates.session}\``,
    `- Proposal Gate：\`${gates.proposal}\``,
    `- Implementation Gate：\`${gates.implementation}\``,
    `- Verification Gate：\`${gates.verification}\``,
    `- Design Review Gate：\`${gates.designReview}\``,
    `- Publish Gate：\`${gates.publish}\``
  ].join('\n'));
  project = replaceSection(project, '最近进展', [
    `- workflow 阶段已更新为 \`${state.currentStage}\`。`,
    note ? `- 最近动作：${note}` : `- 最近动作：状态同步完成。`
  ].join('\n'));
  fs.writeFileSync(projectFile, project);
}

if (fs.existsSync(handoffFile)) {
  let handoff = fs.readFileSync(handoffFile, 'utf8');
  handoff = replaceSection(handoff, '当前状态', [
    `- workflow：\`${state.currentStage}\``,
    `- 方案确认：${approvalText}`,
    `- 验证状态：${verificationText}`,
    `- 设计复核：${designReviewText}`,
    `- 发布状态：${publishText}`
  ].join('\n'));
  handoff = replaceSection(handoff, '当前 Workflow / Gates', [
    `- 当前阶段：\`${state.currentStage}\``,
    `- Proposal Gate：\`${gates.proposal}\``,
    `- Verification Gate：\`${gates.verification}\``,
    `- Design Review Gate：\`${gates.designReview}\``,
    `- Publish Gate：\`${gates.publish}\``
  ].join('\n'));
  handoff = replaceSection(handoff, '最近改动', [
    note ? `- ${note}` : '- workflow 状态已同步',
    `- 最近同步时间：${state.updatedAt || '未知'}`
  ].join('\n'));
  handoff = replaceSection(handoff, '下一步', nextSteps.join('\n'));
  fs.writeFileSync(handoffFile, handoff);
}
NODE

if [ -f "$SUMMARY_SCRIPT" ]; then
  node "$SUMMARY_SCRIPT" "$PROJECT_ROOT" > "$SUMMARY_FILE"
fi

if [ -f "$DISCOVERY_GAP_SCRIPT" ]; then
  node "$DISCOVERY_GAP_SCRIPT" "$PROJECT_ROOT" > "$DISCOVERY_GAP_FILE"
fi

echo "WORKFLOW DOCS SYNC OK: $SLUG"
