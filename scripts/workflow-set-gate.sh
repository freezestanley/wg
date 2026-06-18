#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> <gate> <Pass|Exception-Pass|Pending|Fail> [note]" >&2
  exit 1
}

[ "$#" -ge 3 ] && [ "$#" -le 4 ] || usage
SLUG=$1
GATE=$2
STATUS=$3
NOTE=${4:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$GATE" in
  route|session|proposal|implementation|verification|designReview|publish) ;;
  *)
    echo "Invalid gate: $GATE" >&2
    exit 1
    ;;
esac

case "$STATUS" in
  Pass|Exception-Pass|Pending|Fail) ;;
  *)
    echo "Invalid gate status: $STATUS" >&2
    exit 1
    ;;
esac

STATE_FILE="$PROJECTS_ROOT/$SLUG/.webgen/workflow-state.json"
[ -f "$STATE_FILE" ] || {
  echo "Workflow state not found: $STATE_FILE" >&2
  exit 1
}

node - "$STATE_FILE" "$GATE" "$STATUS" "$NOTE" <<'NODE'
const fs = require('fs');

const [file, gate, status, note] = process.argv.slice(2);
const now = new Date().toISOString();
const defaults = {
  route: 'Pending',
  session: 'Pending',
  proposal: 'Pending',
  implementation: 'Pending',
  verification: 'Pending',
  designReview: 'Pending',
  publish: 'Pending'
};

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
data.gates = { ...defaults, ...(data.gates || {}) };
data.notes = { ...(data.notes || {}) };
data.gates[gate] = status;
if (note) data.notes[gate] = note;
data.updatedAt = now;
fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
NODE

echo "WORKFLOW GATE OK: $SLUG $GATE=$STATUS"
