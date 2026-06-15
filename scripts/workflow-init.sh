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
WEBGEN_ROOT="$PROJECT_ROOT/.webgen"
CHECKS_ROOT="$WEBGEN_ROOT/checks"
STATE_FILE="$WEBGEN_ROOT/workflow-state.json"
APPROVAL_FILE="$WEBGEN_ROOT/approval.json"
VERIFICATION_FILE="$CHECKS_ROOT/verification.json"
DELIVERY_FILE="$CHECKS_ROOT/delivery.json"
SCAFFOLD_FILE="$CHECKS_ROOT/scaffold.json"
SCOPE_FILE="$WEBGEN_ROOT/write-scope.json"
SET_GATE_SCRIPT="$SCRIPT_DIR/workflow-set-gate.sh"

[ -d "$PROJECT_ROOT" ] || {
  echo "Project not found: $PROJECT_ROOT" >&2
  exit 1
}

mkdir -p "$CHECKS_ROOT"

if [ ! -f "$STATE_FILE" ]; then
  node - "$STATE_FILE" "$SLUG" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const slug = process.argv[3];
const now = new Date().toISOString();
const data = {
  slug,
  currentStage: 'discovery',
  updatedAt: now,
  gates: {
    route: 'Pass',
    session: 'Pass',
    scaffold: 'Pass',
    discovery: 'Pending',
    assetInput: 'Pending',
    proposal: 'Pending',
    implementation: 'Pending',
    verification: 'Pending',
    delivery: 'Pending'
  },
  notes: {
    route: '项目已完成路由进入当前 project session',
    session: 'session lock 已自检通过或待 init 后写入',
    scaffold: '项目模板初始化完成并通过基础校验'
  },
  history: [
    { stage: 'routing', at: now, by: 'workflow-init' },
    { stage: 'session-check', at: now, by: 'workflow-init' },
    { stage: 'init', at: now, by: 'workflow-init' },
    { stage: 'discovery', at: now, by: 'workflow-init' }
  ]
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE
fi

if [ ! -f "$APPROVAL_FILE" ]; then
  printf '%s\n' '{' \
    '  "confirmed": false,' \
    '  "confirmedAt": null,' \
    '  "source": null,' \
    '  "summary": null' \
    '}' > "$APPROVAL_FILE"
fi

if [ ! -f "$VERIFICATION_FILE" ]; then
  printf '%s\n' '{' \
    '  "status": "pending",' \
    '  "checkedAt": null,' \
    '  "items": {},' \
    '  "commands": [],' \
    '  "notes": null' \
    '}' > "$VERIFICATION_FILE"
fi

if [ ! -f "$DELIVERY_FILE" ]; then
  printf '%s\n' '{' \
    '  "status": "pending",' \
    '  "checkedAt": null,' \
    '  "missing": [],' \
    '  "warnings": []' \
    '}' > "$DELIVERY_FILE"
fi

if [ ! -f "$SCAFFOLD_FILE" ]; then
  printf '%s\n' '{' \
    '  "status": "pending",' \
    '  "templateId": null,' \
    '  "checkedAt": null' \
    '}' > "$SCAFFOLD_FILE"
fi

if [ ! -f "$SCOPE_FILE" ]; then
  cat > "$SCOPE_FILE" <<'EOF'
{
  "stages": {
    "discovery": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md"
    ],
    "proposal": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md"
    ],
    "implementation": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md",
      "index.html",
      "vite.config.js",
      "src/",
      "docs/api/"
    ],
    "asset-api-sync": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md",
      "src/",
      "docs/api/"
    ],
    "verification": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md",
      "src/",
      "docs/api/"
    ],
    "delivery": [
      "PROJECT.md",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "HANDOFF.md",
      "docs/api/"
    ]
  }
}
EOF
fi

sh "$SET_GATE_SCRIPT" "$SLUG" route Pass "项目已完成路由进入当前 project session" >/dev/null
sh "$SET_GATE_SCRIPT" "$SLUG" session Pass "session lock 已自检通过或待 init 后写入" >/dev/null
sh "$SET_GATE_SCRIPT" "$SLUG" scaffold Pass "项目模板初始化完成并通过基础校验" >/dev/null

echo "WORKFLOW INIT OK: $SLUG"
