#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
CONFIG_FILE="$WORKSPACE_ROOT/.openclaw/webgen-config.json"

usage() {
  echo "Usage: $0 read <key-path> <default> [env-var-name]" >&2
  exit 1
}

[ "$#" -ge 3 ] && [ "$#" -le 4 ] || usage
ACTION=$1
KEY_PATH=$2
DEFAULT_VALUE=$3
ENV_NAME=${4:-}

[ "$ACTION" = "read" ] || usage

if [ -n "$ENV_NAME" ]; then
  ENV_VALUE=$(printenv "$ENV_NAME" 2>/dev/null || true)
  if [ -n "$ENV_VALUE" ]; then
    printf '%s\n' "$ENV_VALUE"
    exit 0
  fi
fi

if [ ! -f "$CONFIG_FILE" ]; then
  printf '%s\n' "$DEFAULT_VALUE"
  exit 0
fi

node - "$CONFIG_FILE" "$KEY_PATH" "$DEFAULT_VALUE" <<'NODE'
const fs = require("fs");

const [file, keyPath, defaultValue] = process.argv.slice(2);

try {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const value = String(keyPath)
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), data);
  process.stdout.write(String(value === undefined || value === null ? defaultValue : value));
} catch {
  process.stdout.write(String(defaultValue));
}
NODE
