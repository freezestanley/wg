#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1
PROJECT_ROOT=$(sh "$PROJECT_GUARD_SCRIPT" "$SLUG")
CONFIG_JSON="$PROJECT_ROOT/.webgen/config.json"

[ -f "$CONFIG_JSON" ] || {
  echo "Missing .webgen/config.json under $PROJECT_ROOT/.webgen" >&2
  exit 1
}

HEALTHCHECK=$(node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(data.preview.healthcheck || "");' "$CONFIG_JSON")
[ -n "$HEALTHCHECK" ] || {
  echo "Preview healthcheck missing. Start preview first." >&2
  exit 2
}

curl -fsS "$HEALTHCHECK" >/dev/null 2>&1 || {
  echo "Preview not healthy: $HEALTHCHECK" >&2
  exit 2
}

node "$SCRIPT_DIR/project-design-review-cdp.mjs" "$PROJECT_ROOT" "$HEALTHCHECK"
