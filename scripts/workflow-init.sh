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
WEBGEN_ROOT="$PROJECT_ROOT/.webgen"
CHECKS_ROOT="$WEBGEN_ROOT/checks"
STATE_FILE="$WEBGEN_ROOT/workflow-state.json"
APPROVAL_FILE="$WEBGEN_ROOT/approval.json"
VERIFICATION_FILE="$CHECKS_ROOT/verification.json"
DELIVERY_FILE="$CHECKS_ROOT/delivery.json"
DESIGN_REVIEW_FILE="$CHECKS_ROOT/design-review.json"
PUBLISH_FILE="$CHECKS_ROOT/publish.json"
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
    session: 'Pending',
    proposal: 'Pending',
    implementation: 'Pending',
    verification: 'Pending',
    designReview: 'Pending',
    publish: 'Pending'
  },
  notes: {
    route: '项目已完成路由进入当前 project session',
    session: '待 session-lock 对账',
    proposal: '待方案确认或记录直接做例外'
  },
  history: [
    { stage: 'routing', at: now, by: 'workflow-init' },
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

if [ ! -f "$DESIGN_REVIEW_FILE" ]; then
  printf '%s\n' '{' \
    '  "status": "pending",' \
    '  "checkedAt": null,' \
    '  "notes": null' \
    '}' > "$DESIGN_REVIEW_FILE"
fi

if [ ! -f "$PUBLISH_FILE" ]; then
  printf '%s\n' '{' \
    '  "status": "pending",' \
    '  "gate": "Pending",' \
    '  "userConfirmed": null,' \
    '  "artifact": null,' \
    '  "artifactSha256": null,' \
    '  "endpoint": null,' \
    '  "remoteStatus": null,' \
    '  "releaseId": null,' \
    '  "jobId": null,' \
    '  "pollUrl": null,' \
    '  "publishedUrl": null,' \
    '  "checkedAt": null,' \
    '  "publishedAt": null,' \
    '  "notes": null' \
    '}' > "$PUBLISH_FILE"
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
      ".webgen/context-summary.txt",
      ".webgen/discovery-gap.txt",
      "DISCOVERY.md"
    ],
    "proposal": [
      ".webgen/context-summary.txt",
      ".webgen/discovery-gap.txt",
      "DISCOVERY.md"
    ],
    "implementation": [
      ".webgen/context-summary.txt",
      ".webgen/discovery-gap.txt",
      "DISCOVERY.md",
      "ASSETS.md",
      "API.md",
      "src/generated/",
      "src/components/",
      "src/sections/",
      "src/modules/",
      "src/styles.css",
      "src/styles/"
    ],
    "verification": [
      ".webgen/context-summary.txt",
      ".webgen/discovery-gap.txt",
      "ASSETS.md",
      "HANDOFF.md",
      "src/generated/",
      "src/components/",
      "src/sections/",
      "src/modules/",
      "src/styles.css",
      "src/styles/"
    ],
    "design-review": [
      ".webgen/context-summary.txt",
      ".webgen/discovery-gap.txt",
      "ASSETS.md",
      "HANDOFF.md",
      "src/generated/",
      "src/components/",
      "src/sections/",
      "src/modules/",
      "src/styles.css",
      "src/styles/"
    ],
    "publish": [
      ".webgen/context-summary.txt",
      "PROJECT.md",
      "HANDOFF.md",
      "dist.zip",
      ".webgen/checks/publish.json"
    ]
  }
}
EOF
fi

sh "$SET_GATE_SCRIPT" "$SLUG" route Pass "项目已完成路由进入当前 project session" >/dev/null
sh "$SET_GATE_SCRIPT" "$SLUG" session Pending "待 session-lock 对账" >/dev/null

echo "WORKFLOW INIT OK: $SLUG"
