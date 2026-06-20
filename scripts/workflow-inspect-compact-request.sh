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
REQUEST_FILE="$PROJECT_ROOT/.webgen/compact-request.json"
SUMMARY_FILE="$PROJECT_ROOT/.webgen/context-summary.txt"
GAP_FILE="$PROJECT_ROOT/.webgen/discovery-gap.txt"

[ -f "$REQUEST_FILE" ] || {
  echo "Compact request not found: $REQUEST_FILE" >&2
  exit 1
}
[ -f "$SUMMARY_FILE" ] || {
  echo "Compact summary not found: $SUMMARY_FILE" >&2
  exit 1
}
[ -f "$GAP_FILE" ] || {
  echo "Compact gap not found: $GAP_FILE" >&2
  exit 1
}

node - "$SLUG" "$REQUEST_FILE" "$SUMMARY_FILE" "$GAP_FILE" <<'NODE'
const fs = require("fs");

const [slug, requestFile, summaryFile, gapFile] = process.argv.slice(2);
const request = JSON.parse(fs.readFileSync(requestFile, "utf8"));
const fromStage = request.fromStage || "unknown";
const toStage = request.toStage || "unknown";
const status = request.status || "pending";
const requestedBy = request.requestedBy || "unknown";
const requestedAt = request.requestedAt || "";
const reason = request.reason || "";
const note = request.note || "";

const lines = [
  `status: ${status}`,
  `requestedBy: ${requestedBy}`,
  `transition: ${fromStage} -> ${toStage}`,
  `summary: ${summaryFile}`,
  `gap: ${gapFile}`,
  `carry: context-summary, discovery-gap`,
  `drop: workflow-chat-history, full-docs, shell-logs, unrelated-code`
];

if (requestedAt) {
  lines.push(`requestedAt: ${requestedAt}`);
}
if (reason) {
  lines.push(`reason: ${reason}`);
}
if (note) {
  lines.push(`note: ${note}`);
}

if (status === "pending") {
  lines.push(`next: run /compact then sh scripts/workflow-handle-compact.sh ${slug} done`);
} else {
  lines.push(`next: compact already ${status}`);
}

process.stdout.write(`${lines.join("\n")}\n`);
NODE
