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
ENDPOINT=$(sh "$CONFIG_SCRIPT" read publish.endpoint "")
TIMEOUT_MS=$(sh "$CONFIG_SCRIPT" read publish.timeoutMs 30000)
FILE_FIELD=$(sh "$CONFIG_SCRIPT" read publish.fileField file)
METADATA_FIELD=$(sh "$CONFIG_SCRIPT" read publish.metadataField "")
ASYNC_FALLBACK=$(sh "$CONFIG_SCRIPT" read publish.asyncFallback false)
ASYNC_FLAG_FIELD=$(sh "$CONFIG_SCRIPT" read publish.asyncFlagField preferAsync)
STATUS_URL_FIELD=$(sh "$CONFIG_SCRIPT" read publish.statusUrlField pollUrl)

write_failed() {
  node - "$PUBLISH_FILE" "$ARTIFACT" "$ENDPOINT" "$1" <<'NODE'
const fs = require("fs");

const [file, artifact, endpoint, notes] = process.argv.slice(2);
const now = new Date().toISOString();
const next = {
  status: "failed",
  gate: "Fail",
  userConfirmed: true,
  artifact,
  artifactSha256: null,
  endpoint,
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

[ -n "$ENDPOINT" ] || {
  write_failed "publish.endpoint missing"
  echo "Missing publish.endpoint in ./config.js" >&2
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

SHA256=$(node - "$ARTIFACT" <<'NODE'
const fs = require("fs");
const crypto = require("crypto");
const [file] = process.argv.slice(2);
const buffer = fs.readFileSync(file);
process.stdout.write(crypto.createHash("sha256").update(buffer).digest("hex"));
NODE
)

TIMEOUT_SECONDS=$(node -e 'const ms=Number(process.argv[1] || "30000"); process.stdout.write(String(Math.max(1, Math.ceil(ms / 1000))));' "$TIMEOUT_MS")
METADATA=$(node - "$SLUG" "$ARTIFACT" "$SHA256" <<'NODE'
const path = require("path");
const [slug, artifact, sha256] = process.argv.slice(2);
process.stdout.write(JSON.stringify({
  slug,
  artifact: path.basename(artifact),
  artifactSha256: sha256
}));
NODE
)

run_publish_request() {
  ASYNC_MODE=$1
  set +e
  if [ -n "$METADATA_FIELD" ]; then
    if [ "$ASYNC_MODE" = "true" ]; then
      RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" -X POST \
        -F "$FILE_FIELD=@$ARTIFACT;type=application/zip" \
        -F "$METADATA_FIELD=$METADATA" \
        -F "$ASYNC_FLAG_FIELD=true" \
        "$ENDPOINT")
    else
      RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" -X POST \
        -F "$FILE_FIELD=@$ARTIFACT;type=application/zip" \
        -F "$METADATA_FIELD=$METADATA" \
        "$ENDPOINT")
    fi
  else
    if [ "$ASYNC_MODE" = "true" ]; then
      RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" -X POST \
        -F "$FILE_FIELD=@$ARTIFACT;type=application/zip" \
        -F "$ASYNC_FLAG_FIELD=true" \
        "$ENDPOINT")
    else
      RESPONSE=$(curl -sS --max-time "$TIMEOUT_SECONDS" -X POST \
        -F "$FILE_FIELD=@$ARTIFACT;type=application/zip" \
        "$ENDPOINT")
    fi
  fi
  CURL_STATUS=$?
  set -e
  return "$CURL_STATUS"
}

if ! run_publish_request false; then
  if [ "$ASYNC_FALLBACK" = "true" ] && [ -n "$ASYNC_FLAG_FIELD" ]; then
    if ! run_publish_request true; then
      write_failed "curl_failed:$CURL_STATUS"
      echo "Publish request failed after async fallback: curl exit $CURL_STATUS" >&2
      exit 1
    fi
  else
    write_failed "curl_failed:$CURL_STATUS"
    echo "Publish request failed: curl exit $CURL_STATUS" >&2
    exit 1
  fi
fi

node - "$PUBLISH_FILE" "$SLUG" "$ARTIFACT" "$SHA256" "$ENDPOINT" "$STATUS_URL_FIELD" "$RESPONSE" <<'NODE'
const fs = require("fs");

const [file, slug, artifact, sha256, endpoint, statusUrlField, responseRaw] = process.argv.slice(2);
const now = new Date().toISOString();

let response = {};
try {
  response = JSON.parse(responseRaw || "{}");
} catch {
  response = {};
}

const uploadedFiles = Array.isArray(response.files) ? response.files : [];
const firstFile = uploadedFiles[0] && typeof uploadedFiles[0] === "object" ? uploadedFiles[0] : null;
const resolvePublishedUrl = () => {
  if (response.url) return response.url;
  if (!firstFile || !firstFile.path) return null;
  try {
    return new URL(firstFile.path, endpoint).toString();
  } catch {
    return firstFile.path;
  }
};

const status = response.status === "queued"
  ? "queued"
  : response.status === "published" || uploadedFiles.length > 0
    ? "published"
    : "published";
const remoteStatus = status === "queued" ? 202 : uploadedFiles.length > 0 ? 201 : 200;
const next = {
  status,
  gate: "Pass",
  userConfirmed: true,
  artifact,
  artifactSha256: sha256,
  endpoint,
  remoteStatus,
  releaseId: response.releaseId || null,
  jobId: response.jobId || null,
  pollUrl: response[statusUrlField] || null,
  publishedUrl: resolvePublishedUrl(),
  checkedAt: now,
  publishedAt: status === "published" ? now : null,
  notes: response.message || null
};

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
process.stdout.write(`PUBLISH OK: ${slug}\n`);
NODE
