#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

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
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"
DESIGN_REVIEW_FILE="$PROJECT_ROOT/.webgen/checks/design-review.json"
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$STATE_FILE" "$VERIFICATION_FILE" "$DESIGN_REVIEW_FILE" "$PUBLISH_FILE" <<'NODE'
const fs = require('fs');
const [stateFile, verificationFile, designReviewFile, publishFile] = process.argv.slice(2);
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const state = readJson(stateFile, {});
const verification = readJson(verificationFile, { status: 'pending' });
const designReview = readJson(designReviewFile, { status: 'pending' });
const publish = readJson(publishFile, { status: 'pending' });
const stage = state.currentStage || 'unknown';
const gates = state.gates || {};

let progress = '';
switch (stage) {
  case 'routing': progress = '路由中'; break;
  case 'discovery': progress = '信息收集中'; break;
  case 'proposal': progress = '方案确认中'; break;
  case 'implementation': progress = '页面实现中'; break;
  case 'verification': progress = verification.status === 'passed' ? '验证已完成' : '验证中'; break;
  case 'design-review': progress = designReview.status === 'passed' ? '设计复核已完成' : '设计复核中'; break;
  case 'publish': progress = publish.status === 'published' ? '发布已完成' : publish.status === 'queued' ? '发布排队中' : publish.status === 'skipped' ? '发布已跳过' : '发布中'; break;
  default: progress = stage;
}

const finishedReview = stage === 'design-review' && (designReview.status === 'passed' || gates.designReview === 'Pass');
const blocked = Object.values(gates).includes('Fail');

process.stdout.write(`${progress} / ${finishedReview ? '已完成设计复核' : '尚未完成设计复核'} / ${blocked ? '有阻塞' : '无阻塞'}\n`);
NODE
