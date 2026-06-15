#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REGISTRY_SCRIPT="$SCRIPT_DIR/session-registry.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  session-key.sh new <slug>
  session-key.sh resume <slug>
EOF
  exit 1
}

[ "$#" -eq 2 ] || usage
ACTION=$1
SLUG=$2

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

case "$ACTION" in
  new)
    printf 'agent:webgen:proj-%s\n' "$SLUG"
    ;;
  resume)
    "$REGISTRY_SCRIPT" get "$SLUG"
    ;;
  *)
    usage
    ;;
esac
