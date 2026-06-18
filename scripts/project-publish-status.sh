#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1
PROJECT_ROOT=$(sh "$GUARD_SCRIPT" "$SLUG")
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"

[ -f "$PUBLISH_FILE" ] || {
  echo "Publish state not found: $PUBLISH_FILE" >&2
  exit 1
}

POLL_URL=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(String(d.pollUrl || ""));' "$PUBLISH_FILE")
[ -n "$POLL_URL" ] || {
  echo "Missing pollUrl in $PUBLISH_FILE" >&2
  exit 1
}

set +e
RESPONSE=$(curl -sS "$POLL_URL")
CURL_STATUS=$?
set -e

[ "$CURL_STATUS" -eq 0 ] || {
  echo "Publish status request failed: curl exit $CURL_STATUS" >&2
  exit 1
}

node - "$PUBLISH_FILE" "$SLUG" "$RESPONSE" <<'NODE'
const fs = require("fs");

const [file, slug, responseRaw] = process.argv.slice(2);
const now = new Date().toISOString();
const current = JSON.parse(fs.readFileSync(file, "utf8"));

let response = {};
try {
  response = JSON.parse(responseRaw || "{}");
} catch {
  response = {};
}

const status = response.status || current.status || "queued";
const remoteStatus = status === "published" ? 200 : status === "queued" ? 202 : current.remoteStatus;
const next = {
  ...current,
  status,
  gate: status === "failed" ? "Fail" : current.gate || "Pass",
  remoteStatus,
  releaseId: response.releaseId || current.releaseId || null,
  jobId: response.jobId || current.jobId || null,
  pollUrl: response.pollUrl || current.pollUrl || null,
  publishedUrl: response.url || current.publishedUrl || null,
  checkedAt: now,
  publishedAt: status === "published" ? now : current.publishedAt || null,
  notes: response.message || current.notes || null
};

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
process.stdout.write(`PUBLISH STATUS OK: ${slug} ${status}\n`);
NODE
