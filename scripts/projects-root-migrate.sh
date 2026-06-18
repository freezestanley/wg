#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"

usage() {
  echo "Usage: $0 <source-root> <target-root>" >&2
  exit 1
}

[ "$#" -eq 2 ] || usage

SOURCE_ROOT=$(sh "$PATHS_SCRIPT" resolve "$1")
TARGET_ROOT=$(sh "$PATHS_SCRIPT" resolve "$2")

[ "$SOURCE_ROOT" != "$TARGET_ROOT" ] || {
  echo "Source and target roots are the same: $SOURCE_ROOT" >&2
  exit 1
}

[ -d "$SOURCE_ROOT" ] || {
  echo "Source root not found: $SOURCE_ROOT" >&2
  exit 1
}

mkdir -p "$TARGET_ROOT"

MIGRATED=0
for dir in "$SOURCE_ROOT"/*; do
  [ -d "$dir" ] || continue
  slug=$(basename "$dir")
  target="$TARGET_ROOT/$slug"

  if [ -e "$target" ]; then
    echo "Target project already exists: $target" >&2
    exit 1
  fi

  mv "$dir" "$target"
  printf 'migrated: %s -> %s\n' "$slug" "$target"
  MIGRATED=1
done

if [ "$MIGRATED" -eq 0 ]; then
  echo "No projects found under $SOURCE_ROOT"
fi
