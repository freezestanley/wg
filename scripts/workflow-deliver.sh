#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ASSERT_SCRIPT="$SCRIPT_DIR/workflow-assert-delivery-ready.sh"
TRANSITION_SCRIPT="$SCRIPT_DIR/workflow-transition.sh"
SYNC_SCRIPT="$SCRIPT_DIR/workflow-sync-docs.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1

sh "$ASSERT_SCRIPT" "$SLUG" >/dev/null
sh "$TRANSITION_SCRIPT" "$SLUG" delivery >/dev/null
sh "$SYNC_SCRIPT" "$SLUG" "交付 gate 已通过" >/dev/null

echo "WORKFLOW DELIVER OK: $SLUG"
