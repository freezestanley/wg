#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
REGISTRY_SCRIPT="$SCRIPT_DIR/session-registry.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  session-recover.sh list
  session-recover.sh resume <slug>
  session-recover.sh rebind <slug>
  session-recover.sh rebuild-registry
EOF
  exit 1
}

canonical_key() {
  printf 'agent:webgen:proj-%s\n' "$1"
}

validate_slug() {
  case "$1" in
    *[!a-z0-9-]* | "" )
      echo "Invalid project slug: $1" >&2
      exit 1
      ;;
  esac
}

project_root() {
  printf '%s/%s\n' "$PROJECTS_ROOT" "$1"
}

lock_file() {
  printf '%s/.webgen/session-lock.json\n' "$(project_root "$1")"
}

workflow_file() {
  printf '%s/.webgen/workflow-state.json\n' "$(project_root "$1")"
}

ensure_lock_file() {
  file=$(lock_file "$1")
  [ -f "$file" ] || {
    echo "Missing session lock: $file" >&2
    exit 1
  }
}

read_lock_session_key() {
  node -e 'const fs=require("fs"); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file,"utf8")); if(!data.sessionKey){process.exit(2);} process.stdout.write(String(data.sessionKey));' "$1"
}

read_stage() {
  node -e 'const fs=require("fs"); const file=process.argv[1]; if(!fs.existsSync(file)){process.stdout.write("-"); process.exit(0);} const data=JSON.parse(fs.readFileSync(file,"utf8")); process.stdout.write(String(data.currentStage || "-"));' "$1"
}

normalize_lock() {
  slug=$1
  mode=$2
  file=$(lock_file "$slug")
  canonical=$(canonical_key "$slug")

  node - "$file" "$slug" "$canonical" "$mode" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
const slug = process.argv[3];
const canonical = process.argv[4];
const mode = process.argv[5];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

if (data.slug !== slug) {
  console.error(`Lock slug mismatch: expected ${slug}, got ${data.slug || "unknown"}`);
  process.exit(1);
}

const previous = data.sessionKey || "";
const now = new Date().toISOString();

if (mode === "resume") {
  if (previous !== canonical) {
    data.sessionKey = canonical;
    data.migratedFromSessionKey = data.migratedFromSessionKey || previous;
    data.migratedAt = now;
  }
} else if (mode === "rebind") {
  if (previous !== canonical) {
    data.sessionKey = canonical;
    data.reboundFromSessionKey = previous;
    data.reboundAt = now;
  }
} else if (mode === "rebuild") {
  if (previous !== canonical) {
    data.sessionKey = canonical;
    data.migratedFromSessionKey = data.migratedFromSessionKey || previous;
    data.migratedAt = now;
  }
} else {
  console.error(`Unsupported normalize mode: ${mode}`);
  process.exit(1);
}

if (!data.sessionKey) {
  data.sessionKey = canonical;
}

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
NODE

  "$REGISTRY_SCRIPT" set "$slug" "$canonical" >/dev/null
}

list_projects() {
  found=0

  if [ ! -d "$PROJECTS_ROOT" ]; then
    printf 'projects: none\n'
    return 0
  fi

  for dir in "$PROJECTS_ROOT"/*; do
    [ -d "$dir" ] || continue
    slug=$(basename "$dir")
    file="$dir/.webgen/session-lock.json"
    [ -f "$file" ] || continue
    found=1
    session_key=$(read_lock_session_key "$file")
    stage=$(read_stage "$(workflow_file "$slug")")
    printf 'slug: %s\nsessionKey: %s\nstage: %s\n\n' "$slug" "$session_key" "$stage"
  done

  [ "$found" -eq 1 ] || printf 'projects: none\n'
}

rebuild_registry() {
  count=0

  if [ -d "$PROJECTS_ROOT" ]; then
    for dir in "$PROJECTS_ROOT"/*; do
      [ -d "$dir" ] || continue
      slug=$(basename "$dir")
      file="$dir/.webgen/session-lock.json"
      [ -f "$file" ] || continue
      validate_slug "$slug"
      normalize_lock "$slug" rebuild
      count=$((count + 1))
    done
  fi

  printf 'registry: rebuilt\n'
  printf 'projects: %s\n' "$count"
}

[ "$#" -ge 1 ] || usage
ACTION=$1

case "$ACTION" in
  list)
    [ "$#" -eq 1 ] || usage
    list_projects
    ;;
  resume)
    [ "$#" -eq 2 ] || usage
    SLUG=$2
    validate_slug "$SLUG"
    ensure_lock_file "$SLUG"
    normalize_lock "$SLUG" resume
    printf 'sessionKey=%s\nmode=resume:%s\nslug=%s\nsource=lock\n' "$(canonical_key "$SLUG")" "$SLUG" "$SLUG"
    ;;
  rebind)
    [ "$#" -eq 2 ] || usage
    SLUG=$2
    validate_slug "$SLUG"
    ensure_lock_file "$SLUG"
    normalize_lock "$SLUG" rebind
    printf 'rebound: %s\nsessionKey=%s\n' "$SLUG" "$(canonical_key "$SLUG")"
    ;;
  rebuild-registry)
    [ "$#" -eq 1 ] || usage
    rebuild_registry
    ;;
  *)
    usage
    ;;
esac
