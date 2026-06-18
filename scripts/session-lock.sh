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
  session-lock.sh init <slug> <sessionKey>
  session-lock.sh get <slug>
  session-lock.sh check <slug> <sessionKey> [mode]
EOF
  exit 1
}

[ "$#" -ge 2 ] || usage
ACTION=$1
SLUG=$2

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
LOCK_FILE="$PROJECT_ROOT/.webgen/session-lock.json"

read_lock_field() {
  node -e 'const fs=require("fs"); const f=process.argv[1]; const k=process.argv[2]; const d=JSON.parse(fs.readFileSync(f,"utf8")); if(d[k]===undefined||d[k]===null) process.exit(2); process.stdout.write(String(d[k]));' "$1" "$2"
}

case "$ACTION" in
  init)
    [ "$#" -eq 3 ] || usage
    SESSION_KEY=$3
    mkdir -p "$PROJECT_ROOT/.webgen"
    if [ -f "$LOCK_FILE" ]; then
      echo "Lock already exists: $LOCK_FILE" >&2
      exit 1
    fi
    node -e 'const fs=require("fs"); const file=process.argv[1]; const slug=process.argv[2]; const sessionKey=process.argv[3]; fs.writeFileSync(file, JSON.stringify({slug, sessionKey, boundAt:new Date().toISOString()}, null, 2)+"\n");' "$LOCK_FILE" "$SLUG" "$SESSION_KEY"
    "$REGISTRY_SCRIPT" set "$SLUG" "$SESSION_KEY" >/dev/null
    printf '%s\n' "$LOCK_FILE"
    ;;
  get)
    [ "$#" -eq 2 ] || usage
    [ -f "$LOCK_FILE" ] || exit 2
    cat "$LOCK_FILE"
    ;;
  check)
    [ "$#" -ge 3 ] && [ "$#" -le 4 ] || usage
    SESSION_KEY=$3
    MODE=${4:-new}
    if [ ! -f "$LOCK_FILE" ]; then
      printf 'LOCK_ABSENT\n'
      exit 0
    fi
    LOCK_SLUG=$(read_lock_field "$LOCK_FILE" slug)
    LOCK_SESSION=$(read_lock_field "$LOCK_FILE" sessionKey)
    if [ "$LOCK_SLUG" != "$SLUG" ]; then
      printf 'LOCK_MISMATCH slug=%s sessionKey=%s\n' "$LOCK_SLUG" "$LOCK_SESSION"
      exit 3
    fi
    if [ "$LOCK_SESSION" != "$SESSION_KEY" ]; then
      printf 'LOCK_SESSION_MISMATCH slug=%s sessionKey=%s\n' "$LOCK_SLUG" "$LOCK_SESSION"
      exit 5
    fi
    if [ "$MODE" = "new" ]; then
      printf 'LOCK_EXISTS_SAME slug=%s sessionKey=%s\n' "$LOCK_SLUG" "$LOCK_SESSION"
      exit 4
    fi
    printf 'LOCK_MATCH slug=%s sessionKey=%s\n' "$LOCK_SLUG" "$LOCK_SESSION"
    ;;
  *)
    usage
    ;;
esac
