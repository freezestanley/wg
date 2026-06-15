#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
REGISTRY_FILE="$WORKSPACE_ROOT/.openclaw/webgen-session-registry.json"

usage() {
  cat <<'EOF' >&2
Usage:
  session-registry.sh get <slug>
  session-registry.sh set <slug> <sessionKey>
  session-registry.sh list
EOF
  exit 1
}

mkdir -p "$(dirname "$REGISTRY_FILE")"
[ -f "$REGISTRY_FILE" ] || printf '{}\n' > "$REGISTRY_FILE"

[ "$#" -ge 1 ] || usage
ACTION=$1
shift || true

case "$ACTION" in
  get)
    [ "$#" -eq 1 ] || usage
    SLUG=$1
    node -e 'const fs=require("fs"); const f=process.argv[1]; const slug=process.argv[2]; const d=JSON.parse(fs.readFileSync(f,"utf8")); const v=d[slug]; if(!v) process.exit(2); process.stdout.write(String(v));' "$REGISTRY_FILE" "$SLUG"
    ;;
  set)
    [ "$#" -eq 2 ] || usage
    SLUG=$1
    SESSION_KEY=$2
    node -e 'const fs=require("fs"); const f=process.argv[1]; const slug=process.argv[2]; const sessionKey=process.argv[3]; const d=JSON.parse(fs.readFileSync(f,"utf8")); d[slug]=sessionKey; fs.writeFileSync(f, JSON.stringify(d, null, 2)+"\n");' "$REGISTRY_FILE" "$SLUG" "$SESSION_KEY"
    printf '%s\n' "$REGISTRY_FILE"
    ;;
  list)
    [ "$#" -eq 0 ] || usage
    cat "$REGISTRY_FILE"
    ;;
  *)
    usage
    ;;
esac
