#!/bin/zsh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"
STOP_SCRIPT="$SCRIPT_DIR/project-preview-stop.sh"
PREVIEW_MAX=${WEBGEN_PREVIEW_MAX:-8}

usage() {
  cat <<'EOF'
preview-manager.sh list
preview-manager.sh stop <slug>
preview-manager.sh stop-all
preview-manager.sh stop-others <slug>
preview-manager.sh reap
preview-manager.sh running-count
preview-manager.sh gate [slug]
EOF
  exit 1
}

list_slugs() {
  for p in "$PROJECTS_ROOT"/*/; do
    [ -d "$p" ] || continue
    slug=$(basename "$p")
    [ -f "$p/.webgen/config.json" ] || continue
    printf '%s\n' "$slug"
  done
}

project_port() {
  cfg="$PROJECTS_ROOT/$1/.webgen/config.json"
  node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(String((d.preview&&d.preview.port)||""));' "$cfg" 2>/dev/null || true
}

cmd_list() {
  printf '%-26s %-7s %-9s %-8s %s\n' "PROJECT" "PORT" "STATE" "PID" "PORT_OWNER(实际)"
  printf '%-26s %-7s %-9s %-8s %s\n' "-------" "----" "-----" "---" "----------------"
  list_slugs | while IFS= read -r slug; do
    cfg="$PROJECTS_ROOT/$slug/.webgen/config.json"
    pidfile="$PROJECTS_ROOT/$slug/.webgen/preview.pid"
    port=$(project_port "$slug")
    state=$(node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const s=(d.preview&&d.preview.state)||{};process.stdout.write(s.status||"stopped");' "$cfg" 2>/dev/null || echo "?")
    pid=""
    [ -f "$pidfile" ] && pid=$(cat "$pidfile" 2>/dev/null || true)
    owner=""
    [ -n "$port" ] && owner=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | tr '\n' ',' | sed 's/,$//')
    [ -z "$owner" ] && owner="-"
    printf '%-26s %-7s %-9s %-8s %s\n' "$slug" "${port:-?}" "$state" "${pid:--}" "$owner"
  done
}

cmd_stop() {
  slug=$1
  [ -d "$PROJECTS_ROOT/$slug" ] || { echo "No such project: $slug" >&2; exit 1; }
  zsh "$STOP_SCRIPT" "$slug"
}

cmd_stop_all() {
  list_slugs | while IFS= read -r slug; do
    zsh "$STOP_SCRIPT" "$slug" || true
  done
  cmd_reap
}

cmd_stop_others() {
  keep=$1
  list_slugs | while IFS= read -r slug; do
    [ "$slug" = "$keep" ] && continue
    zsh "$STOP_SCRIPT" "$slug" || true
  done
  echo "Kept running: $keep"
}

cmd_reap() {
  list_slugs | while IFS= read -r slug; do
    pidfile="$PROJECTS_ROOT/$slug/.webgen/preview.pid"
    port=$(project_port "$slug")
    [ -n "$port" ] || continue
    tracked=""
    [ -f "$pidfile" ] && tracked=$(cat "$pidfile" 2>/dev/null || true)
    for owner in $(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null); do
      if [ "$owner" != "$tracked" ]; then
        if ps -p "$owner" -o command= 2>/dev/null | grep -q "vite"; then
          kill -9 "$owner" >/dev/null 2>&1 || true
          echo "Reaped orphan vite pid $owner on port $port (project $slug)"
        fi
      fi
    done
  done
  echo "Reap done."
}

running_slugs() {
  list_slugs | while IFS= read -r slug; do
    port=$(project_port "$slug")
    [ -n "$port" ] || continue
    if lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
      printf '%s\n' "$slug"
    fi
  done
}

cmd_running_count() {
  running_slugs | grep -c . || true
}

cmd_gate() {
  want=${1:-}
  current=$(running_slugs)
  count=$(printf '%s\n' "$current" | grep -c . || true)

  already_running=0
  if [ -n "$want" ] && printf '%s\n' "$current" | grep -qx "$want"; then
    already_running=1
  fi

  projected=$count
  if [ "$already_running" -eq 0 ] && [ -n "$want" ]; then
    projected=$((count + 1))
  fi

  if [ "$projected" -le "$PREVIEW_MAX" ]; then
    exit 0
  fi

  echo "GATE_BLOCKED"
  printf '⚠️ 当前已有 %s 个预览服务在运行，再启动新预览会超过上限（%s 个），可能占用过多系统资源。\n' "$count" "$PREVIEW_MAX"
  echo "请先关闭部分预览再继续。当前运行中的预览："
  printf '%s\n' "$current" | while IFS= read -r s; do
    [ -n "$s" ] || continue
    printf '  - %s  (端口 %s)\n' "$s" "$(project_port "$s")"
  done
  exit 10
}

[ "$#" -ge 1 ] || usage
action=$1
shift || true

case "$action" in
  list) cmd_list ;;
  stop) [ "$#" -eq 1 ] || usage; cmd_stop "$1" ;;
  stop-all) cmd_stop_all ;;
  stop-others) [ "$#" -eq 1 ] || usage; cmd_stop_others "$1" ;;
  reap) cmd_reap ;;
  running-count) cmd_running_count ;;
  gate) cmd_gate "${1:-}" ;;
  *) usage ;;
esac
