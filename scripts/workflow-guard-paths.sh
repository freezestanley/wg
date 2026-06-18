#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> <path> [path ...]" >&2
  exit 1
}

[ "$#" -ge 2 ] || usage
SLUG=$1
shift

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
STATE_FILE="$PROJECT_ROOT/.webgen/workflow-state.json"
SCOPE_FILE="$PROJECT_ROOT/.webgen/write-scope.json"

[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}
[ -f "$SCOPE_FILE" ] || {
  echo "Write scope not found: $SCOPE_FILE" >&2
  exit 1
}

node - "$PROJECT_ROOT" "$STATE_FILE" "$SCOPE_FILE" "$@" <<'NODE'
const fs = require('fs');
const path = require('path');

const [projectRoot, stateFile, scopeFile, ...targets] = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
const scope = JSON.parse(fs.readFileSync(scopeFile, 'utf8'));
const stage = state.currentStage;
const allowed = (scope.stages && scope.stages[stage]) || [];

if (!allowed.length) {
  console.error(`WORKFLOW PATH GUARD FAILED: 阶段 ${stage} 没有可写路径白名单`);
  process.exit(2);
}

const normalizeRule = (rule) => rule.endsWith('/') ? rule : rule;
const allowedRules = allowed.map(normalizeRule);
const root = path.resolve(projectRoot);

for (const target of targets) {
  const abs = path.resolve(root, target);
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    console.error(`WORKFLOW PATH GUARD FAILED: 路径越界 ${target}`);
    process.exit(3);
  }
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  const ok = allowedRules.some((rule) => {
    const normalized = rule.replace(/\\/g, '/');
    if (normalized.endsWith('/')) return rel.startsWith(normalized);
    return rel === normalized;
  });
  if (!ok) {
    console.error(`WORKFLOW PATH GUARD FAILED: 阶段 ${stage} 不允许写入 ${rel}`);
    process.exit(4);
  }
}

console.log(`WORKFLOW PATH GUARD OK: ${stage}`);
NODE
