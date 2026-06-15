#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"

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

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$PROJECT_FILE" "$HANDOFF_FILE" "$STATE_FILE" "$APPROVAL_FILE" "$VERIFICATION_FILE" "$DELIVERY_FILE" "$NOTE" <<'NODE'
const fs = require('fs');
const [projectFile, handoffFile, stateFile, approvalFile, verificationFile, deliveryFile, note] = process.argv.slice(2);

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
  discovery: ['- 完成 Discovery', '- 输出方案并等待确认'],
  proposal: ['- 完成方案确认或记录直接做例外', '- 通过 Proposal Gate 后进入实现'],
  implementation: ['- 继续页面实现', '- 完成后进入 verification'],
  'asset-api-sync': ['- 对齐素材 / API / 文档', '- 完成后进入 verification'],
  verification: ['- 完成预览/构建验证', '- 记录验证结果'],
  delivery: ['- 整理交付说明', '- 正式交付项目']
};

const state = readJson(stateFile, { currentStage: 'unknown', updatedAt: null, gates: {}, notes: {} });
const gates = {
  route: 'Pending',
  session: 'Pending',
  scaffold: 'Pending',
  discovery: 'Pending',
  assetInput: 'Pending',
  proposal: 'Pending',
  implementation: 'Pending',
  verification: 'Pending',
  delivery: 'Pending',
  ...(state.gates || {})
};
const approval = readJson(approvalFile, { confirmed: false });
const verification = readJson(verificationFile, { status: 'pending', checkedAt: null, notes: null });
const delivery = readJson(deliveryFile, { status: 'pending', checkedAt: null });

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

const deliveryText = delivery.status === 'passed'
  ? `已就绪（${delivery.checkedAt || '时间未知'}）`
  : delivery.status === 'failed'
    ? `未就绪（${delivery.checkedAt || '时间未知'}）`
    : gates.delivery === 'Pass'
      ? '已通过 Delivery Gate'
      : gates.delivery === 'Fail'
        ? '未通过 Delivery Gate'
        : '待确认';

if (fs.existsSync(projectFile)) {
  let project = fs.readFileSync(projectFile, 'utf8');
  project = replaceSection(project, 'Workflow 状态', [
    `- 当前阶段：\`${state.currentStage}\``,
    `- 方案确认：${approvalText}`,
    `- 验证状态：${verificationText}`,
    `- 交付状态：${deliveryText}`
  ].join('\n'));
  project = replaceSection(project, 'Gate 状态', [
    `- Route Gate：\`${gates.route}\``,
    `- Session Gate：\`${gates.session}\``,
    `- Scaffold Gate：\`${gates.scaffold}\``,
    `- Discovery Gate：\`${gates.discovery}\``,
    `- Asset Input Gate：\`${gates.assetInput}\``,
    `- Proposal Gate：\`${gates.proposal}\``,
    `- Implementation Gate：\`${gates.implementation}\``,
    `- Verification Gate：\`${gates.verification}\``,
    `- Delivery Gate：\`${gates.delivery}\``
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
    `- 验证状态：${verificationText}`
  ].join('\n'));
  handoff = replaceSection(handoff, '当前 Workflow / Gates', [
    `- 当前阶段：\`${state.currentStage}\``,
    `- Discovery Gate：\`${gates.discovery}\``,
    `- Asset Input Gate：\`${gates.assetInput}\``,
    `- Proposal Gate：\`${gates.proposal}\``,
    `- Verification Gate：\`${gates.verification}\``,
    `- Delivery Gate：\`${gates.delivery}\``
  ].join('\n'));
  handoff = replaceSection(handoff, '最近改动', [
    note ? `- ${note}` : '- workflow 状态已同步',
    `- 最近同步时间：${state.updatedAt || '未知'}`
  ].join('\n'));
  handoff = replaceSection(handoff, '下一步', (nextStepByStage[state.currentStage] || ['- 根据当前阶段继续推进']).join('\n'));
  fs.writeFileSync(handoffFile, handoff);
}
NODE

echo "WORKFLOW DOCS SYNC OK: $SLUG"
