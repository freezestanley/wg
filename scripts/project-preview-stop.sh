#!/bin/zsh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"
PREVIEW_MANAGER_SCRIPT="$SCRIPT_DIR/preview-manager.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

if [ "$#" -ne 1 ]; then
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

kill_pid() {
  kill -9 "$1" >/dev/null 2>&1 || true
}

PID=""
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
fi

if [ -n "$PID" ] && pid_alive "$PID"; then
  kill_pid "$PID"
fi

rm -f "$PID_FILE"

node -e "const fs=require('fs'); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); const now=new Date().toISOString(); data.preview.state={...(data.preview.state||{}), status:'stopped', pid:null, lastStoppedAt:now, lastError:null}; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON"
zsh "$PREVIEW_MANAGER_SCRIPT" untrack "$SLUG" >/dev/null 2>&1 || true

printf 'Preview stopped for %s\n' "$SLUG"
