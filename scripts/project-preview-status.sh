#!/bin/zsh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"

usage() {
  echo "Usage: $0 <project-slug> [--verbose]" >&2
  exit 1
}

[ "$#" -ge 1 ] && [ "$#" -le 2 ] || usage

VERBOSE=0
if [ "$#" -eq 2 ]; then
  [ "$2" = "--verbose" ] || usage
  VERBOSE=1
fi

if [ "$#" -lt 1 ]; then
  usage
fi

SLUG=$1
PROJECT_ROOT=$(sh "$GUARD_SCRIPT" "$SLUG")
CONFIG_JSON="$PROJECT_ROOT/.webgen/config.json"
PID_FILE="$PROJECT_ROOT/.webgen/preview.pid"

if [ ! -f "$CONFIG_JSON" ]; then
  echo "Missing .webgen/config.json under $PROJECT_ROOT/.webgen" >&2
  exit 1
fi

pid_alive() {
  kill -0 "$1" >/dev/null 2>&1
}

STATUS=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); const preview=data.preview||{}; const state=preview.state||{}; process.stdout.write(JSON.stringify({host:preview.host||'127.0.0.1', port:preview.port, healthcheck:preview.healthcheck, status:state.status||'stopped', pid:state.pid||null, readyAt:state.readyAt||null, startedAt:state.startedAt||null, lastError:state.lastError||null}));" "$CONFIG_JSON")

HOST=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.host);')
PORT=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.port === null ? "" : String(data.port));')
HEALTHCHECK=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.healthcheck || "");')
PID=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.pid === null ? "" : String(data.pid));')
STATE=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.status);')
READY_AT=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.readyAt || "");')
LAST_ERROR=$(printf '%s' "$STATUS" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.lastError || "");')

HTTP_STATUS="unknown"
PID_ALIVE=0

if [ -n "$HEALTHCHECK" ] && curl -fsS "$HEALTHCHECK" >/dev/null 2>&1; then
  HTTP_STATUS="ready"
  PID_ALIVE=1
elif [ -n "$PID" ] && pid_alive "$PID"; then
  HTTP_STATUS="pid-alive-http-unverified"
  PID_ALIVE=1
else
  HTTP_STATUS="unreachable"
fi

URL=${HEALTHCHECK:-}
if [ -z "$URL" ] && [ -n "$PORT" ]; then
  URL="http://${HOST}:${PORT}/"
fi

if [ "$VERBOSE" -eq 1 ]; then
  printf 'Preview status: %s\n' "$STATE"
  printf 'Host: %s\n' "$HOST"
  printf 'Port: %s\n' "${PORT:-unassigned}"
  printf 'Healthcheck: %s\n' "${HEALTHCHECK:-unassigned}"
  printf 'PID: %s\n' "${PID:-none}"
  printf 'HTTP: %s\n' "$HTTP_STATUS"
  printf 'Ready At: %s\n' "${READY_AT:-n/a}"
  if [ -n "$LAST_ERROR" ]; then
    printf 'Last Error: %s\n' "$LAST_ERROR"
  fi
else
  printf 'preview: %s\n' "$STATE"
  printf 'url: %s\n' "${URL:-unassigned}"
  printf 'http: %s\n' "$HTTP_STATUS"
  printf 'pid: %s\n' "${PID:-none}"
  if [ -n "$READY_AT" ]; then
    printf 'ready-at: %s\n' "$READY_AT"
  fi
  if [ -n "$LAST_ERROR" ]; then
    printf 'error: %s\n' "$LAST_ERROR"
  fi
fi

if [ "$PID_ALIVE" -eq 1 ]; then
  exit 0
fi

exit 1
