#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"
CONFIG_SCRIPT="$SCRIPT_DIR/webgen-config.sh"
PACKAGE_SCRIPT="$SCRIPT_DIR/project-package.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1
PROJECT_ROOT=$(sh "$GUARD_SCRIPT" "$SLUG")
PUBLISH_FILE="$PROJECT_ROOT/.webgen/checks/publish.json"
ARTIFACT="$PROJECT_ROOT/dist.zip"

ENABLED=$(sh "$CONFIG_SCRIPT" read publish.enabled false)

write_failed() {
  node - "$PUBLISH_FILE" "$ARTIFACT" "$1" <<'NODE'
const fs = require("fs");

const [file, artifact, notes] = process.argv.slice(2);
const now = new Date().toISOString();
const next = {
  status: "failed",
  gate: "Fail",
  userConfirmed: true,
  artifact,
  artifactSha256: null,
  endpoint: null,
  remoteStatus: null,
  releaseId: null,
  jobId: null,
  pollUrl: null,
  publishedUrl: null,
  checkedAt: now,
  publishedAt: null,
  notes
};
fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE
}

[ "$ENABLED" = "true" ] || {
  write_failed "publish.enabled=false"
  echo "Publish disabled in ./config.js" >&2
  exit 1
}

if [ ! -f "$ARTIFACT" ]; then
  sh "$PACKAGE_SCRIPT" "$SLUG" >/dev/null
fi

[ -f "$ARTIFACT" ] || {
  write_failed "dist.zip missing"
  echo "Missing dist.zip under $PROJECT_ROOT" >&2
  exit 1
}

node - "$PUBLISH_FILE" "$SLUG" "$ARTIFACT" <<'NODE'
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const [file, slug, artifact] = process.argv.slice(2);
const now = new Date().toISOString();
const buffer = fs.readFileSync(artifact);
const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

const next = {
  status: "queued",
  gate: "Pass",
  userConfirmed: true,
  artifact,
  artifactSha256: sha256,
  endpoint: null,
  remoteStatus: null,
  releaseId: null,
  jobId: null,
  pollUrl: null,
  publishedUrl: null,
  checkedAt: now,
  publishedAt: null,
  notes: "publish signal emitted"
};

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
process.stdout.write(`WEBGEN_PUBLISH|slug=${slug}|distZipFilepath=${artifact}|sha256=${sha256}|sentAt=${now}\n`);
NODE
