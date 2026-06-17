#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SESSION_LOCK_SCRIPT="$SCRIPT_DIR/session-lock.sh"
PROJECT_INIT_SCRIPT="$SCRIPT_DIR/project-init.sh"
RESUME_CONTEXT_SCRIPT="$SCRIPT_DIR/project-resume-context.sh"

usage() {
  echo "Usage: $0 <project-slug> <sessionKey> <mode> [template-id]" >&2
  exit 1
}

[ "$#" -ge 3 ] && [ "$#" -le 4 ] || usage
SLUG=$1
SESSION_KEY=$2
MODE=$3
TEMPLATE_ID=${4:-vite-page}

case "$SLUG" in
  *[!a-z0-9-]* | "" )
    echo "Invalid project slug: $SLUG" >&2
    exit 1
    ;;
esac

run_resume_context() {
  sh "$RESUME_CONTEXT_SCRIPT" "$SLUG"
}

case "$MODE" in
  new)
    CHECK_OUTPUT=$(sh "$SESSION_LOCK_SCRIPT" check "$SLUG" "$SESSION_KEY" new) || CHECK_RC=$?
    CHECK_RC=${CHECK_RC:-0}
    if [ "$CHECK_RC" -ne 0 ]; then
      printf '%s\n' "$CHECK_OUTPUT" >&2
      exit "$CHECK_RC"
    fi
    if [ "$CHECK_OUTPUT" != "LOCK_ABSENT" ]; then
      printf '%s\n' "$CHECK_OUTPUT" >&2
      exit 2
    fi

    sh "$PROJECT_INIT_SCRIPT" "$SLUG" "$TEMPLATE_ID" >/dev/null
    sh "$SESSION_LOCK_SCRIPT" init "$SLUG" "$SESSION_KEY" >/dev/null

    printf 'entry: new\n'
    run_resume_context
    ;;
  resume:*)
    if [ "$MODE" != "resume:$SLUG" ]; then
      echo "Resume mode does not match slug: $MODE vs $SLUG" >&2
      exit 1
    fi

    CHECK_OUTPUT=$(sh "$SESSION_LOCK_SCRIPT" check "$SLUG" "$SESSION_KEY" "$MODE") || CHECK_RC=$?
    CHECK_RC=${CHECK_RC:-0}
    if [ "$CHECK_RC" -ne 0 ]; then
      printf '%s\n' "$CHECK_OUTPUT" >&2
      exit "$CHECK_RC"
    fi

    printf 'entry: resume\n'
    run_resume_context
    ;;
  *)
    echo "Invalid mode: $MODE" >&2
    exit 1
    ;;
esac
