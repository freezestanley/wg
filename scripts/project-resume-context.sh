#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"
SUMMARY_SCRIPT="$SCRIPT_DIR/project-context-summary.mjs"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1
PROJECT_ROOT=$(sh "$GUARD_SCRIPT" "$SLUG")
SUMMARY_FILE="$PROJECT_ROOT/.webgen/context-summary.txt"

if [ -f "$SUMMARY_FILE" ]; then
  SUMMARY=$(cat "$SUMMARY_FILE")
else
  SUMMARY=$(node "$SUMMARY_SCRIPT" "$PROJECT_ROOT")
fi

stage=$(printf '%s\n' "$SUMMARY" | sed -n 's/^stage: //p' | head -n 1)
discovery=$(printf '%s\n' "$SUMMARY" | sed -n 's/^discovery: //p' | head -n 1)
route=$(printf '%s\n' "$SUMMARY" | sed -n 's/^route: //p' | head -n 1)
session=$(printf '%s\n' "$SUMMARY" | sed -n 's/^session: //p' | head -n 1)
proposal=$(printf '%s\n' "$SUMMARY" | sed -n 's/^proposal: //p' | head -n 1)
implementation=$(printf '%s\n' "$SUMMARY" | sed -n 's/^implementation: //p' | head -n 1)
verification=$(printf '%s\n' "$SUMMARY" | sed -n 's/^verification: //p' | head -n 1)
design_review=$(printf '%s\n' "$SUMMARY" | sed -n 's/^designReview: //p' | head -n 1)

printf 'project: %s\n' "$PROJECT_ROOT"
printf 'stage: %s\n' "${stage:-unknown}"
printf 'discovery: %s\n' "${discovery:-Missing}"
printf 'gates: route=%s session=%s proposal=%s implementation=%s verification=%s designReview=%s\n' \
  "${route:-Pending}" "${session:-Pending}" "${proposal:-Pending}" "${implementation:-Pending}" "${verification:-Pending}" "${design_review:-Pending}"

NEXT_ITEMS=".webgen/context-summary.txt"

case "$stage" in
  discovery|proposal|"")
    NEXT_ITEMS="$NEXT_ITEMS, PROJECT.md, HANDOFF.md"
    ;;
  implementation)
    NEXT_ITEMS="$NEXT_ITEMS, HANDOFF.md, PROJECT.md, API.md"
    ;;
  verification|design-review)
    NEXT_ITEMS="$NEXT_ITEMS, HANDOFF.md, PROJECT.md, ASSETS.md, API.md"
    ;;
  *)
    NEXT_ITEMS="$NEXT_ITEMS, PROJECT.md"
    ;;
esac

case "$discovery" in
  "Ready"|"Ready with Assumptions")
    ;;
  *)
    NEXT_ITEMS="$NEXT_ITEMS, DISCOVERY.md"
    ;;
esac

printf 'next: %s\n' "$NEXT_ITEMS"
