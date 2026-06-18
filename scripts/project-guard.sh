#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)

usage() {
  echo "Usage: $0 <project-slug> [path]" >&2
  exit 1
}

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  usage
fi

SLUG=$1

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"

if [ "$#" -eq 1 ]; then
  printf '%s\n' "$PROJECT_ROOT"
  exit 0
fi

TARGET_INPUT=$2
TARGET_DIR=$(dirname "$TARGET_INPUT")
TARGET_BASE=$(basename "$TARGET_INPUT")
TARGET_DIR_REAL=$(CDPATH= cd -- "$TARGET_DIR" 2>/dev/null && pwd) || {
  echo "Target directory does not exist: $TARGET_DIR" >&2
  exit 1
}
TARGET_REAL="$TARGET_DIR_REAL/$TARGET_BASE"

case "$TARGET_REAL" in
  "$PROJECT_ROOT" | "$PROJECT_ROOT"/* )
    printf '%s\n' "$TARGET_REAL"
    ;;
  * )
    echo "Refusing path outside project root: $TARGET_REAL" >&2
    exit 1
    ;;
esac
