#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CHECK_SCRIPT="$SCRIPT_DIR/workflow-check.sh"
GUARD_SCRIPT="$SCRIPT_DIR/workflow-guard-paths.sh"
COMMAND_GUARD_SCRIPT="$SCRIPT_DIR/workflow-guard-command.mjs"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"

usage() {
  echo "Usage: $0 <project-slug> <target-path> [target-path ...] -- <command> [args...]" >&2
  exit 1
}

[ "$#" -ge 4 ] || usage
SLUG=$1
shift

TARGETS=""
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--" ]; then
    shift
    break
  fi
  TARGETS="$TARGETS
$1"
  shift
done

[ -n "$TARGETS" ] || usage
[ "$#" -ge 1 ] || usage

TARGET_LIST=$(printf '%b' "$TARGETS" | sed '/^$/d')

sh "$CHECK_SCRIPT" "$SLUG" write-code >/dev/null
# shellcheck disable=SC2086
sh "$GUARD_SCRIPT" "$SLUG" $TARGET_LIST >/dev/null
node "$COMMAND_GUARD_SCRIPT" "$@" >/dev/null
"$@"
sh "$SYNC_SCRIPT" "$SLUG" "执行实现命令：$*" >/dev/null

echo "WORKFLOW WRITE OK: $SLUG"
