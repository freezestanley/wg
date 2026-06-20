#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
CONFIG_SCRIPT="$SCRIPT_DIR/webgen-config.sh"

usage() {
  cat <<'EOF' >&2
Usage:
  webgen-paths.sh workspace-root
  webgen-paths.sh legacy-projects-root
  webgen-paths.sh projects-root
  webgen-paths.sh project-root <slug>
  webgen-paths.sh resolve <path>
EOF
  exit 1
}

resolve_path() {
  node - "$WORKSPACE_ROOT" "$1" <<'NODE'
const os = require("os");
const path = require("path");

const [workspaceRoot, rawInput] = process.argv.slice(2);
let input = String(rawInput || "");

if (!input) {
  process.exit(2);
}

if (input === "~") {
  input = os.homedir();
} else if (input.startsWith("~/")) {
  input = path.join(os.homedir(), input.slice(2));
}

const homeRelativeWorkspace = path.relative(os.homedir(), workspaceRoot);
const normalizedInput = path.normalize(input);
const looksLikeHomeRelativeWorkspaceMirror =
  !path.isAbsolute(normalizedInput) &&
  homeRelativeWorkspace &&
  (
    normalizedInput === homeRelativeWorkspace ||
    normalizedInput.startsWith(`${homeRelativeWorkspace}${path.sep}`)
  );

const resolved = path.isAbsolute(normalizedInput)
  ? normalizedInput
  : looksLikeHomeRelativeWorkspaceMirror
    ? path.resolve(os.homedir(), normalizedInput)
    : path.resolve(workspaceRoot, normalizedInput);

process.stdout.write(resolved);
NODE
}

[ "$#" -ge 1 ] || usage
ACTION=$1

case "$ACTION" in
  workspace-root)
    printf '%s\n' "$WORKSPACE_ROOT"
    ;;
  legacy-projects-root)
    printf '%s\n' "$WORKSPACE_ROOT/projects"
    ;;
  projects-root)
    RAW_PROJECTS_ROOT=$(sh "$CONFIG_SCRIPT" read paths.projectsRoot projects WEBGEN_PROJECTS_ROOT)
    resolve_path "$RAW_PROJECTS_ROOT"
    printf '\n'
    ;;
  project-root)
    [ "$#" -eq 2 ] || usage
    SLUG=$2
    case "$SLUG" in
      *[!a-z0-9-]* | "" )
        echo "Invalid project slug: $SLUG" >&2
        exit 1
        ;;
    esac
    ROOT=$(sh "$0" projects-root)
    printf '%s/%s\n' "$ROOT" "$SLUG"
    ;;
  resolve)
    [ "$#" -eq 2 ] || usage
    resolve_path "$2"
    printf '\n'
    ;;
  *)
    usage
    ;;
esac
