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

json_get() {
  node -e 'const fs=require("fs"); const file=process.argv[1]; const key=process.argv[2].split("."); const data=JSON.parse(fs.readFileSync(file,"utf8")); let cur=data; for (const k of key) { if (cur == null || !(k in cur)) process.exit(2); cur=cur[k]; } if (cur === null) process.exit(2); process.stdout.write(String(cur));' "$1" "$2"
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
DELIVERY_FILE="$PROJECT_ROOT/.webgen/checks/delivery.json"

MISSING=""
WARNINGS=""
add_missing() {
  MISSING="$MISSING\n- $1"
}
add_warning() {
  WARNINGS="$WARNINGS\n- $1"
}

[ -f "$STATE_FILE" ] || add_missing "workflow-state.json"
[ -f "$PROJECT_ROOT/PROJECT.md" ] || add_missing "PROJECT.md"
[ -f "$PROJECT_ROOT/DISCOVERY.md" ] || add_missing "DISCOVERY.md"
[ -f "$PROJECT_ROOT/ASSETS.md" ] || add_missing "ASSETS.md"
[ -f "$PROJECT_ROOT/API.md" ] || add_missing "API.md"
[ -f "$PROJECT_ROOT/HANDOFF.md" ] || add_missing "HANDOFF.md"

if [ -f "$STATE_FILE" ]; then
  PROPOSAL_GATE=$(json_get "$STATE_FILE" gates.proposal 2>/dev/null || printf 'pending')
  VERIFY_GATE=$(json_get "$STATE_FILE" gates.verification 2>/dev/null || printf 'pending')
  REVIEW_GATE=$(json_get "$STATE_FILE" gates.designReview 2>/dev/null || printf 'pending')
  [ "$PROPOSAL_GATE" = "Pass" ] || [ "$PROPOSAL_GATE" = "Exception-Pass" ] || add_missing "proposal gate"
  [ "$VERIFY_GATE" = "Pass" ] || add_missing "verification gate"
  [ "$REVIEW_GATE" = "Pass" ] || add_missing "design review gate"
fi

if [ -f "$VERIFICATION_FILE" ]; then
  VERIFY_STATUS=$(json_get "$VERIFICATION_FILE" status 2>/dev/null || printf 'pending')
  [ "$VERIFY_STATUS" = "passed" ] || add_warning "verification log not passed"
else
  add_warning "verification.json missing"
fi

if [ -f "$DESIGN_REVIEW_FILE" ]; then
  REVIEW_STATUS=$(json_get "$DESIGN_REVIEW_FILE" status 2>/dev/null || printf 'pending')
  [ "$REVIEW_STATUS" = "passed" ] || add_warning "design-review log not passed"
else
  add_warning "design-review.json missing"
fi

if [ -n "$MISSING" ]; then
  node - "$DELIVERY_FILE" "$MISSING" "$WARNINGS" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const missingRaw = process.argv[3] || '';
const warningsRaw = process.argv[4] || '';
const missing = missingRaw.split('\n').map((line) => line.trim()).filter(Boolean);
const warnings = warningsRaw.split('\n').map((line) => line.trim()).filter(Boolean);
const data = {
  status: 'failed',
  checkedAt: new Date().toISOString(),
  missing,
  warnings
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE
  printf 'DELIVERY CHECK FAILED:%b\n' "$MISSING" >&2
  exit 2
fi

node - "$DELIVERY_FILE" "$WARNINGS" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const warningsRaw = process.argv[3] || '';
const warnings = warningsRaw.split('\n').map((line) => line.trim()).filter(Boolean);
const data = {
  status: 'passed',
  checkedAt: new Date().toISOString(),
  missing: [],
  warnings
};
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

echo "DELIVERY CHECK OK: $SLUG"
