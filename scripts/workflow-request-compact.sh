#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> <from-stage> <to-stage> <requested-by> [reason]" >&2
  exit 1
}

[ "$#" -ge 4 ] && [ "$#" -le 5 ] || usage
SLUG=$1
FROM_STAGE=$2
TO_STAGE=$3
REQUESTED_BY=$4
REASON=${5:-stage-transition}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
REQUEST_FILE="$PROJECT_ROOT/.webgen/compact-request.json"
SUMMARY_FILE="$PROJECT_ROOT/.webgen/context-summary.txt"
GAP_FILE="$PROJECT_ROOT/.webgen/discovery-gap.txt"

[ -f "$SUMMARY_FILE" ] || {
  echo "Compact request requires context summary: $SUMMARY_FILE" >&2
  exit 1
}
[ -f "$GAP_FILE" ] || {
  echo "Compact request requires discovery gap: $GAP_FILE" >&2
  exit 1
}

node - "$REQUEST_FILE" "$FROM_STAGE" "$TO_STAGE" "$REQUESTED_BY" "$REASON" <<'NODE'
const fs = require("fs");

const [file, fromStage, toStage, requestedBy, reason] = process.argv.slice(2);
const now = new Date().toISOString();

let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  existing = {};
}

const next = {
  ...existing,
  requested: true,
  requestedAt: now,
  requestedBy,
  fromStage,
  toStage,
  reason,
  status: "pending"
};

delete next.handledAt;
delete next.note;

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE

echo "COMPACT REQUESTED: $SLUG $FROM_STAGE->$TO_STAGE"
