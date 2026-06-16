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
LOG_FILE="$PROJECT_ROOT/.webgen/preview.log"

if [ ! -f "$CONFIG_JSON" ]; then
  echo "Missing .webgen/config.json under $PROJECT_ROOT/.webgen" >&2
  exit 1
fi

read_json_field() {
  file=$1
  expr=$2
  node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); const value=(function(){ return $expr; })(); if (value === undefined || value === null) process.exit(2); process.stdout.write(String(value));" "$file"
}

pid_alive() {
  kill -0 "$1" >/dev/null 2>&1
}

kill_pid() {
  kill -9 "$1" >/dev/null 2>&1 || true
}

emit_preview_failure() {
  reason=$1
  url=${2:-unassigned}
  note=${3:-}
  printf 'preview: failed\n' >&2
  printf 'reason: %s\n' "$reason" >&2
  printf 'url: %s\n' "$url" >&2
  printf 'log: %s\n' "$LOG_FILE" >&2
  if [ -n "$note" ]; then
    printf 'note: %s\n' "$note" >&2
  fi
  printf 'next: sh scripts/project-preview-status.sh %s --verbose\n' "$SLUG" >&2
}

emit_preview_blocked() {
  printf 'preview: blocked\n' >&2
  printf 'reason: preview-gate\n' >&2
  printf 'next: zsh scripts/preview-manager.sh stop-others %s 或 WEBGEN_PREVIEW_GATE=0 sh scripts/project-preview.sh %s\n' "$SLUG" "$SLUG" >&2
}

PREPARED=$(node - "$CONFIG_JSON" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const preview = data.preview || {};
const host = preview.host || "127.0.0.1";
const startPort = Number(preview.port || preview.portBase || 4173);
const entry = preview.entry || "/";
const proxyTarget =
  (preview.proxy && preview.proxy["/api"] && preview.proxy["/api"].target) ||
  (data.apis && data.apis.baseUrl) ||
  "";

process.stdout.write(JSON.stringify({ host, startPort, entry, proxyTarget }));
NODE
)

HOST=$(printf '%s' "$PREPARED" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.host);')
START_PORT=$(printf '%s' "$PREPARED" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(String(data.startPort));')
ENTRY=$(printf '%s' "$PREPARED" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.entry);')
PROXY_TARGET=$(printf '%s' "$PREPARED" | node -e 'const data=JSON.parse(require("fs").readFileSync(0,"utf8")); process.stdout.write(data.proxyTarget || "");')
DEV_CMD=$(read_json_field "$CONFIG_JSON" "data.deps.commands.dev")
PREVIEW_RUNTIME=$(read_json_field "$CONFIG_JSON" "data.preview.runtime")
LAUNCH_CMD=$DEV_CMD

if [ "$PREVIEW_RUNTIME" = "vite" ] && [ -x "$PROJECT_ROOT/node_modules/.bin/vite" ]; then
  LAUNCH_CMD="./node_modules/.bin/vite"
fi

if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  OLD_HEALTHCHECK=$(read_json_field "$CONFIG_JSON" "data.preview.healthcheck")
  if pid_alive "$OLD_PID" && curl -fsS "$OLD_HEALTHCHECK" >/dev/null 2>&1; then
    zsh "$PREVIEW_MANAGER_SCRIPT" touch "$SLUG" >/dev/null 2>&1 || true
    printf 'Preview already running: %s\n' "$OLD_HEALTHCHECK"
    exit 0
  fi

  kill_pid "$OLD_PID"
  rm -f "$PID_FILE"
fi

zsh "$PREVIEW_MANAGER_SCRIPT" reap >/dev/null 2>&1 || true
zsh "$PREVIEW_MANAGER_SCRIPT" gc >/dev/null 2>&1 || true
CAPACITY_OUT=$(zsh "$PREVIEW_MANAGER_SCRIPT" ensure-capacity "$SLUG" 2>/dev/null) || CAPACITY_RC=$?
if [ "${CAPACITY_RC:-0}" -eq 10 ]; then
  emit_preview_blocked
  if [ -n "$CAPACITY_OUT" ]; then
    printf 'note: %s\n' "$CAPACITY_OUT" >&2
  fi
  exit 10
fi

if [ "${WEBGEN_PREVIEW_GATE:-1}" != "0" ]; then
  GATE_OUT=$(zsh "$SCRIPT_DIR/preview-manager.sh" gate "$SLUG" 2>/dev/null) || GATE_RC=$?
  if [ "${GATE_RC:-0}" -eq 10 ]; then
    emit_preview_blocked
    if [ -n "$GATE_OUT" ]; then
      printf 'note: %s\n' "$GATE_OUT" >&2
    fi
    exit 10
  fi
fi

port_offset=0
while [ "$port_offset" -lt 20 ]; do
  PORT=$((START_PORT + port_offset))
  HEALTHCHECK="http://${HOST}:${PORT}${ENTRY}"

  node -e "const fs=require('fs'); const file=process.argv[1]; const port=Number(process.argv[2]); const healthcheck=process.argv[3]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); const now=new Date().toISOString(); data.preview.port=port; data.preview.healthcheck=healthcheck; data.preview.state={...(data.preview.state||{}), status:'starting', pid:null, startedAt:now, readyAt:null, lastError:null}; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON" "$PORT" "$HEALTHCHECK"

  (
    cd "$PROJECT_ROOT"
    python3 - "$PROJECT_ROOT" "$LAUNCH_CMD" "$LOG_FILE" "$PID_FILE" "$HOST" "$PORT" "$PROXY_TARGET" <<'PY'
import os
import subprocess
import sys

project_root, dev_cmd, log_file, pid_file, host, port, proxy_target = sys.argv[1:]
env = os.environ.copy()
env["HOST"] = host
env["PORT"] = port
env["CI"] = "1"
if proxy_target:
    env["VITE_API_PROXY_TARGET"] = proxy_target

with open(log_file, "wb", buffering=0) as log_handle:
    proc = subprocess.Popen(
        ["/bin/sh", "-lc", dev_cmd],
        cwd=project_root,
        stdin=subprocess.DEVNULL,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )

with open(pid_file, "w", encoding="utf-8") as pid_handle:
    pid_handle.write(f"{proc.pid}\n")
PY
  )

  PID=$(cat "$PID_FILE")

  attempt=0
  while [ "$attempt" -lt 30 ]; do
    if ! pid_alive "$PID"; then
      if rg -q "EADDRINUSE|Address already in use" "$LOG_FILE" 2>/dev/null; then
        kill_pid "$PID"
        rm -f "$PID_FILE"
        break
      fi

      node -e "const fs=require('fs'); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); data.preview.state={...(data.preview.state||{}), status:'error', pid:null, lastError:'preview process exited before healthcheck became ready'}; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON"
      rm -f "$PID_FILE"
      emit_preview_failure "exited-before-ready" "$HEALTHCHECK" "preview process exited before healthcheck became ready"
      exit 1
    fi

    if curl -fsS "$HEALTHCHECK" >/dev/null 2>&1; then
      node -e "const fs=require('fs'); const file=process.argv[1]; const pid=Number(process.argv[2]); const now=new Date().toISOString(); const data=JSON.parse(fs.readFileSync(file, 'utf8')); data.preview.state={...(data.preview.state||{}), status:'running', pid, readyAt:now, lastError:null}; data.envStatus.nodeInstalled=true; data.envStatus.lastCheckedAt=now; data.envStatus.lastPreviewAt=now; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON" "$PID"
      zsh "$PREVIEW_MANAGER_SCRIPT" touch "$SLUG" >/dev/null 2>&1 || true
      printf 'Preview ready: %s\n' "$HEALTHCHECK"
      exit 0
    fi

    attempt=$((attempt + 1))
    sleep 1
  done

  if [ ! -f "$PID_FILE" ]; then
    port_offset=$((port_offset + 1))
    continue
  fi

  kill_pid "$PID"
  rm -f "$PID_FILE"
  node -e "const fs=require('fs'); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); data.preview.state={...(data.preview.state||{}), status:'error', pid:null, lastError:'healthcheck timeout after 30 seconds'}; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON"
  emit_preview_failure "healthcheck-timeout" "$HEALTHCHECK" "healthcheck timeout after 30 seconds"
  exit 1
done

node -e "const fs=require('fs'); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); data.preview.state={...(data.preview.state||{}), status:'error', pid:null, lastError:'all candidate preview ports were exhausted'}; fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON"
emit_preview_failure "ports-exhausted" "http://${HOST}:${START_PORT}${ENTRY}" "all candidate preview ports were exhausted"
exit 1
