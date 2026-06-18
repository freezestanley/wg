#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> <done|skipped> [note]" >&2
  exit 1
}

[ "$#" -ge 2 ] && [ "$#" -le 3 ] || usage
SLUG=$1
STATUS=$2
NOTE=${3:-}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$STATUS" in
  done|skipped) ;;
  *)
    echo "Invalid compact status: $STATUS" >&2
    exit 1
    ;;
esac

REQUEST_FILE="$PROJECTS_ROOT/$SLUG/.webgen/compact-request.json"
[ -f "$REQUEST_FILE" ] || {
  echo "Compact request not found: $REQUEST_FILE" >&2
  exit 1
}

node - "$REQUEST_FILE" "$STATUS" "$NOTE" <<'NODE'
const fs = require("fs");

const [file, status, note] = process.argv.slice(2);
const now = new Date().toISOString();
const existing = JSON.parse(fs.readFileSync(file, "utf8"));

const next = {
  ...existing,
  status,
  handledAt: now
};

if (note) {
  next.note = note;
} else {
  delete next.note;
}

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE

echo "COMPACT HANDLED: $SLUG $STATUS"
