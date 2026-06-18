#!/bin/zsh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
STOP_SCRIPT="$SCRIPT_DIR/project-preview-stop.sh"
CONFIG_SCRIPT="$SCRIPT_DIR/webgen-config.sh"
PREVIEW_MAX=$(sh "$CONFIG_SCRIPT" read preview.max 8 WEBGEN_PREVIEW_MAX)
PREVIEW_TTL_MINUTES=$(sh "$CONFIG_SCRIPT" read preview.ttlMinutes 60 WEBGEN_PREVIEW_TTL_MINUTES)
REGISTRY_DIR="$WORKSPACE_ROOT/.openclaw"
REGISTRY_FILE="$REGISTRY_DIR/preview-registry.json"

usage() {
  cat <<'EOF'
preview-manager.sh list
preview-manager.sh pin <slug>
preview-manager.sh unpin <slug>
preview-manager.sh stop <slug>
preview-manager.sh stop-all
preview-manager.sh stop-others <slug>
preview-manager.sh reap
preview-manager.sh gc
preview-manager.sh ensure-capacity [slug]
preview-manager.sh running-count
preview-manager.sh gate [slug]
preview-manager.sh limits
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

project_state() {
  cfg="$PROJECTS_ROOT/$1/.webgen/config.json"
  node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const s=(d.preview&&d.preview.state)||{};process.stdout.write(String(s.status||"stopped"));' "$cfg" 2>/dev/null || true
}

project_pid() {
  pidfile="$PROJECTS_ROOT/$1/.webgen/preview.pid"
  [ -f "$pidfile" ] && cat "$pidfile" 2>/dev/null || true
}

ensure_registry() {
  mkdir -p "$REGISTRY_DIR"
  if [ ! -f "$REGISTRY_FILE" ]; then
    printf '{\n  "items": []\n}\n' > "$REGISTRY_FILE"
  fi
}

registry_upsert() {
  ensure_registry
  slug=$1
  pinned_override=${2:-__KEEP__}
  node - "$REGISTRY_FILE" "$PROJECTS_ROOT" "$slug" "$pinned_override" <<'NODE'
const fs = require("fs");
const path = require("path");

const [registryFile, projectsRoot, slug, pinnedOverride] = process.argv.slice(2);
const now = new Date().toISOString();
const projectRoot = path.join(projectsRoot, slug);
const configFile = path.join(projectRoot, ".webgen", "config.json");
const pidFile = path.join(projectRoot, ".webgen", "preview.pid");

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const registry = readJson(registryFile, { items: [] });
const config = readJson(configFile, {});
const preview = config.preview || {};
const state = preview.state || {};
const pid = fs.existsSync(pidFile) ? String(fs.readFileSync(pidFile, "utf8")).trim() : "";

const existingIndex = Array.isArray(registry.items)
  ? registry.items.findIndex((item) => item && item.slug === slug)
  : -1;
const existing = existingIndex >= 0 ? registry.items[existingIndex] : {};
const pinned = pinnedOverride === "__KEEP__"
  ? Boolean(existing && existing.pinned)
  : pinnedOverride === "true";

const item = {
  slug,
  port: preview.port || null,
  pid: pid || null,
  healthcheck: preview.healthcheck || null,
  status: state.status || "stopped",
  startedAt: state.startedAt || existing.startedAt || null,
  readyAt: state.readyAt || existing.readyAt || null,
  lastSeenAt: now,
  pinned
};

if (!Array.isArray(registry.items)) registry.items = [];
if (existingIndex >= 0) registry.items[existingIndex] = item;
else registry.items.push(item);

fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2) + "\n");
NODE
}

registry_remove() {
  ensure_registry
  slug=$1
  node - "$REGISTRY_FILE" "$slug" <<'NODE'
const fs = require("fs");
const [registryFile, slug] = process.argv.slice(2);
let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
} catch {
  registry = { items: [] };
}
registry.items = Array.isArray(registry.items)
  ? registry.items.filter((item) => item && item.slug !== slug)
  : [];
fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2) + "\n");
NODE
}

registry_pinned() {
  ensure_registry
  slug=$1
  node -e 'const fs=require("fs");const [file,slug]=process.argv.slice(1);let data={items:[]};try{data=JSON.parse(fs.readFileSync(file,"utf8"));}catch{}const item=(data.items||[]).find((entry)=>entry&&entry.slug===slug);process.stdout.write(item&&item.pinned?"true":"false");' "$REGISTRY_FILE" "$slug"
}

registry_prune_missing() {
  ensure_registry
  node - "$REGISTRY_FILE" "$PROJECTS_ROOT" <<'NODE'
const fs = require("fs");
const path = require("path");
const [registryFile, projectsRoot] = process.argv.slice(2);
let registry = { items: [] };
try {
  registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
} catch {}
const items = Array.isArray(registry.items) ? registry.items : [];
registry.items = items.filter((item) => {
  if (!item || !item.slug) return false;
  return fs.existsSync(path.join(projectsRoot, item.slug, ".webgen", "config.json"));
});
fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2) + "\n");
NODE
}

active_slugs() {
  list_slugs | while IFS= read -r slug; do
    state=$(project_state "$slug")
    case "$state" in
      running|starting)
        printf '%s\n' "$slug"
        ;;
    esac
  done
}

capacity_candidates() {
  ensure_registry
  keep=${1:-}
  node - "$REGISTRY_FILE" "$keep" <<'NODE'
const fs = require("fs");
const [registryFile, keep] = process.argv.slice(2);
let registry = { items: [] };
try {
  registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
} catch {}
const items = Array.isArray(registry.items) ? registry.items : [];
items
  .filter((item) => item && item.slug && item.slug !== keep && !item.pinned && item.status !== "stopped")
  .sort((a, b) => {
    const left = Date.parse(a.lastSeenAt || a.startedAt || 0) || 0;
    const right = Date.parse(b.lastSeenAt || b.startedAt || 0) || 0;
    return left - right;
  })
  .forEach((item) => process.stdout.write(item.slug + "\n"));
NODE
}

expired_slugs() {
  ensure_registry
  node - "$REGISTRY_FILE" "$PREVIEW_TTL_MINUTES" <<'NODE'
const fs = require("fs");
const [registryFile, ttlRaw] = process.argv.slice(2);
const ttlMinutes = Number(ttlRaw || 60);
const cutoff = Date.now() - (ttlMinutes * 60 * 1000);
let registry = { items: [] };
try {
  registry = JSON.parse(fs.readFileSync(registryFile, "utf8"));
} catch {}
const items = Array.isArray(registry.items) ? registry.items : [];
for (const item of items) {
  if (!item || !item.slug || item.pinned || item.status === "stopped") continue;
  const seen = Date.parse(item.lastSeenAt || item.startedAt || 0) || 0;
  if (seen > 0 && seen < cutoff) process.stdout.write(item.slug + "\n");
}
NODE
}

cmd_list() {
  ensure_registry
  registry_prune_missing
  printf '%-26s %-7s %-9s %-8s %-8s %s\n' "PROJECT" "PORT" "STATE" "PID" "PIN" "PORT_OWNER(实际)"
  printf '%-26s %-7s %-9s %-8s %-8s %s\n' "-------" "----" "-----" "---" "---" "----------------"
  list_slugs | while IFS= read -r slug; do
    cfg="$PROJECTS_ROOT/$slug/.webgen/config.json"
    pidfile="$PROJECTS_ROOT/$slug/.webgen/preview.pid"
    port=$(project_port "$slug")
    state=$(node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));const s=(d.preview&&d.preview.state)||{};process.stdout.write(s.status||"stopped");' "$cfg" 2>/dev/null || echo "?")
    pid=""
    [ -f "$pidfile" ] && pid=$(cat "$pidfile" 2>/dev/null || true)
    owner=""
    pin=$(registry_pinned "$slug")
    [ -n "$port" ] && owner=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | tr '\n' ',' | sed 's/,$//')
    [ -z "$owner" ] && owner="-"
    printf '%-26s %-7s %-9s %-8s %-8s %s\n' "$slug" "${port:-?}" "$state" "${pid:--}" "${pin/true/pinned}" "$owner"
  done
}

cmd_pin() {
  slug=$1
  [ -d "$PROJECTS_ROOT/$slug" ] || { echo "No such project: $slug" >&2; exit 1; }
  registry_upsert "$slug" true
  printf 'pinned: %s\n' "$slug"
}

cmd_unpin() {
  slug=$1
  [ -d "$PROJECTS_ROOT/$slug" ] || { echo "No such project: $slug" >&2; exit 1; }
  registry_upsert "$slug" false
  printf 'unpinned: %s\n' "$slug"
}

cmd_touch() {
  slug=$1
  [ -d "$PROJECTS_ROOT/$slug" ] || { echo "No such project: $slug" >&2; exit 1; }
  registry_upsert "$slug"
  printf 'tracked: %s\n' "$slug"
}

cmd_untrack() {
  slug=$1
  registry_remove "$slug"
  printf 'untracked: %s\n' "$slug"
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
    [ "$(registry_pinned "$slug")" = "true" ] && continue
    zsh "$STOP_SCRIPT" "$slug" || true
  done
  echo "Kept running: $keep"
}

cmd_reap() {
  ensure_registry
  registry_prune_missing
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
    registry_upsert "$slug"
  done
  echo "Reap done."
}

cmd_running_count() {
  active_slugs | grep -c . || true
}

cmd_limits() {
  printf 'preview-max: %s\n' "$PREVIEW_MAX"
  printf 'preview-ttl-minutes: %s\n' "$PREVIEW_TTL_MINUTES"
}

cmd_gc() {
  ensure_registry
  registry_prune_missing
  expired=$(expired_slugs || true)
  if [ -n "$expired" ]; then
    printf '%s\n' "$expired" | while IFS= read -r slug; do
      [ -n "$slug" ] || continue
      zsh "$STOP_SCRIPT" "$slug" >/dev/null 2>&1 || true
      printf 'gc-stopped: %s\n' "$slug"
    done
  fi
  echo "GC done."
}

cmd_ensure_capacity() {
  registry_prune_missing
  keep=${1:-}
  count=$(active_slugs | grep -c . || true)
  if [ "$count" -le "$PREVIEW_MAX" ]; then
    printf 'capacity: ok (%s/%s)\n' "$count" "$PREVIEW_MAX"
    exit 0
  fi

  candidates=$(capacity_candidates "$keep" || true)
  if [ -n "$candidates" ]; then
    printf '%s\n' "$candidates" | while IFS= read -r slug; do
      [ -n "$slug" ] || continue
      current=$(active_slugs | grep -c . || true)
      [ "$current" -le "$PREVIEW_MAX" ] && break
      zsh "$STOP_SCRIPT" "$slug" >/dev/null 2>&1 || true
      printf 'capacity-stopped: %s\n' "$slug"
    done
  fi

  final_count=$(active_slugs | grep -c . || true)
  if [ "$final_count" -le "$PREVIEW_MAX" ]; then
    printf 'capacity: ok (%s/%s)\n' "$final_count" "$PREVIEW_MAX"
    exit 0
  fi

  printf 'capacity: blocked (%s/%s)\n' "$final_count" "$PREVIEW_MAX"
  exit 10
}

cmd_gate() {
  want=${1:-}
  current=$(active_slugs)
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
  pin) [ "$#" -eq 1 ] || usage; cmd_pin "$1" ;;
  unpin) [ "$#" -eq 1 ] || usage; cmd_unpin "$1" ;;
  touch) [ "$#" -eq 1 ] || usage; cmd_touch "$1" ;;
  untrack) [ "$#" -eq 1 ] || usage; cmd_untrack "$1" ;;
  stop) [ "$#" -eq 1 ] || usage; cmd_stop "$1" ;;
  stop-all) cmd_stop_all ;;
  stop-others) [ "$#" -eq 1 ] || usage; cmd_stop_others "$1" ;;
  reap) cmd_reap ;;
  gc) cmd_gc ;;
  ensure-capacity) cmd_ensure_capacity "${1:-}" ;;
  running-count) cmd_running_count ;;
  gate) cmd_gate "${1:-}" ;;
  limits) cmd_limits ;;
  *) usage ;;
esac
