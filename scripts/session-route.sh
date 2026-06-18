#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SESSION_KEY_SCRIPT="$SCRIPT_DIR/session-key.sh"
REGISTRY_SCRIPT="$SCRIPT_DIR/session-registry.sh"
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  cat <<'EOF' >&2
Usage:
  session-route.sh new <slug>
  session-route.sh resume <slug>
  session-route.sh envelope new <slug>
  session-route.sh envelope resume <slug>
  session-route.sh bind <slug> <sessionKey>
EOF
  exit 1
}

normalize_project_key() {
  slug=$1
  key=${2:-}
  canonical="agent:webgen:proj-$slug"

  case "$key" in
    "$canonical")
      printf '%s\n' "$key"
      ;;
    "")
      return 1
      ;;
    *)
      legacy_lock="$PROJECTS_ROOT/$slug/.webgen/session-lock.json"
      if [ -f "$legacy_lock" ]; then
        node - "$legacy_lock" "$slug" "$canonical" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
const slug = process.argv[3];
const canonical = process.argv[4];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

if (data.slug === slug && data.sessionKey !== canonical) {
  const previous = data.sessionKey;
  data.sessionKey = canonical;
  data.migratedFromSessionKey = data.migratedFromSessionKey || previous;
  data.migratedAt = new Date().toISOString();
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
NODE
      fi
      "$REGISTRY_SCRIPT" set "$slug" "$canonical" >/dev/null
      printf '%s\n' "$canonical"
      ;;
  esac
}

[ "$#" -ge 2 ] || usage
ACTION=$1

case "$ACTION" in
  new)
    [ "$#" -eq 2 ] || usage
    SLUG=$2
    "$SESSION_KEY_SCRIPT" new "$SLUG"
    ;;
  resume)
    [ "$#" -eq 2 ] || usage
    SLUG=$2
    RAW_KEY=$($SESSION_KEY_SCRIPT resume "$SLUG")
    normalize_project_key "$SLUG" "$RAW_KEY"
    ;;
  envelope)
    [ "$#" -eq 3 ] || usage
    MODE=$2
    SLUG=$3
    if [ "$MODE" = "new" ]; then
      KEY=$($SESSION_KEY_SCRIPT new "$SLUG")
      printf 'sessionKey=%s\nmode=new\nslug=%s\n' "$KEY" "$SLUG"
    elif [ "$MODE" = "resume" ]; then
      RAW_KEY=$($SESSION_KEY_SCRIPT resume "$SLUG")
      KEY=$(normalize_project_key "$SLUG" "$RAW_KEY")
      printf 'sessionKey=%s\nmode=resume:%s\nslug=%s\n' "$KEY" "$SLUG" "$SLUG"
    else
      usage
    fi
    ;;
  bind)
    [ "$#" -eq 3 ] || usage
    SLUG=$2
    SESSION_KEY=$3
    "$REGISTRY_SCRIPT" set "$SLUG" "$SESSION_KEY"
    ;;
  *)
    usage
    ;;
esac
