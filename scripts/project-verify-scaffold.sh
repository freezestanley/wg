#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PATHS_SCRIPT="$SCRIPT_DIR/webgen-paths.sh"
PROJECTS_ROOT=$(sh "$PATHS_SCRIPT" projects-root)
TEMPLATES_ROOT="$WORKSPACE_ROOT/templates"

usage() {
  echo "Usage: $0 <project-slug> <template-id>" >&2
  exit 1
}

if [ "$#" -ne 2 ]; then
  usage
fi

SLUG=$1
TEMPLATE_ID=$2

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

SCAFFOLD_ROOT="$TEMPLATES_ROOT/$TEMPLATE_ID/scaffold"
MANIFEST_FILE="$TEMPLATES_ROOT/$TEMPLATE_ID/scaffold-manifest.txt"
PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"

if [ ! -d "$SCAFFOLD_ROOT" ]; then
  echo "Template scaffold not found: $SCAFFOLD_ROOT" >&2
  exit 1
fi

if [ ! -d "$PROJECT_ROOT" ]; then
  echo "Project not found: $PROJECT_ROOT" >&2
  exit 1
fi

MISSING=0
MISSING_LIST=""

check_rel() {
  rel=$1
  if [ ! -f "$PROJECT_ROOT/$rel" ]; then
    MISSING=1
    MISSING_LIST="$MISSING_LIST\n  - $rel"
  fi
}

if [ -f "$MANIFEST_FILE" ]; then
  while IFS= read -r rel || [ -n "$rel" ]; do
    [ -n "$rel" ] || continue
    check_rel "$rel"
  done < "$MANIFEST_FILE"
else
  SCAFFOLD_ABS=$(CDPATH= cd -- "$SCAFFOLD_ROOT" && pwd)
  for rel in $(cd "$SCAFFOLD_ABS" && find . -type f | sed 's|^\./||'); do
    check_rel "$rel"
  done
fi

if [ "$MISSING" -ne 0 ]; then
  echo "SCAFFOLD VERIFY FAILED: project '$SLUG' is missing scaffold files copied from template '$TEMPLATE_ID':" >&2
  printf "$MISSING_LIST\n" >&2
  echo "" >&2
  echo "Fix: regenerate scaffold via 'sh scripts/project-init.sh $SLUG $TEMPLATE_ID'" >&2
  echo "or copy the missing files from '$SCAFFOLD_ROOT'. Do NOT hand-trim the scaffold." >&2
  exit 2
fi

echo "SCAFFOLD VERIFY OK: project '$SLUG' matches template '$TEMPLATE_ID' scaffold file set."
exit 0
