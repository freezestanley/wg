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
VERIFICATION_FILE="$PROJECT_ROOT/.webgen/checks/verification.json"
DELIVERY_FILE="$PROJECT_ROOT/.webgen/checks/delivery.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$STATE_FILE" "$VERIFICATION_FILE" "$DELIVERY_FILE" <<'NODE'
const fs = require('fs');
const [stateFile, verificationFile, deliveryFile] = process.argv.slice(2);
const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

const state = readJson(stateFile, {});
const verification = readJson(verificationFile, { status: 'pending' });
const delivery = readJson(deliveryFile, { status: 'pending' });
const stage = state.currentStage || 'unknown';
const gates = state.gates || {};

let progress = '';
switch (stage) {
  case 'routing': progress = '路由中'; break;
  case 'session-check': progress = 'session 自检中'; break;
  case 'init': progress = '脚手架初始化中'; break;
  case 'discovery': progress = '信息收集中'; break;
  case 'proposal': progress = '方案确认中'; break;
  case 'implementation': progress = '页面实现中'; break;
  case 'asset-api-sync': progress = '素材与 API 对齐中'; break;
  case 'verification': progress = verification.status === 'passed' ? '验证已完成' : '验证中'; break;
  case 'delivery': progress = delivery.status === 'passed' || gates.delivery === 'Pass' ? '交付中' : '交付准备中'; break;
  default: progress = stage;
}

const enteredDelivery = stage === 'delivery' || gates.delivery === 'Pass';
const blocked = Object.values(gates).includes('Fail');

process.stdout.write(`${progress} / ${enteredDelivery ? '已进入交付' : '尚未进入交付'} / ${blocked ? '有阻塞' : '无阻塞'}\n`);
NODE
