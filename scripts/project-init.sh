#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PROJECTS_ROOT="$WORKSPACE_ROOT/projects"
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

TEMPLATE_ROOT="$TEMPLATES_ROOT/$TEMPLATE_ID"
SCAFFOLD_ROOT="$TEMPLATE_ROOT/scaffold"
POST_INIT_ROOT="$TEMPLATE_ROOT/post-init"
PROJECT_ROOT="$PROJECTS_ROOT/$SLUG"
WEBGEN_ROOT="$PROJECT_ROOT/.webgen"

if [ ! -d "$TEMPLATE_ROOT" ] || [ ! -d "$SCAFFOLD_ROOT" ] || [ ! -d "$POST_INIT_ROOT" ]; then
  echo "Template not found or incomplete: $TEMPLATE_ID" >&2
  exit 1
fi

if [ -e "$PROJECT_ROOT" ]; then
  echo "Project already exists: $PROJECT_ROOT" >&2
  exit 1
fi

mkdir -p "$PROJECT_ROOT" "$WEBGEN_ROOT"
cp -R "$SCAFFOLD_ROOT"/. "$PROJECT_ROOT/"

PROJECT_NAME=$(printf '%s\n' "$SLUG" | tr '-' ' ')

render_template() {
  src=$1
  dest=$2
  sed \
    -e "s/{{PROJECT_SLUG}}/$SLUG/g" \
    -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
    "$src" > "$dest"
}

render_template "$POST_INIT_ROOT/PROJECT.md.tpl" "$PROJECT_ROOT/PROJECT.md"
render_template "$POST_INIT_ROOT/DISCOVERY.md.tpl" "$PROJECT_ROOT/DISCOVERY.md"
render_template "$POST_INIT_ROOT/ASSETS.md.tpl" "$PROJECT_ROOT/ASSETS.md"
render_template "$POST_INIT_ROOT/API.md.tpl" "$PROJECT_ROOT/API.md"
render_template "$POST_INIT_ROOT/HANDOFF.md.tpl" "$PROJECT_ROOT/HANDOFF.md"
render_template "$POST_INIT_ROOT/config.json.tpl" "$WEBGEN_ROOT/config.json"

node - "$WEBGEN_ROOT/config.json" "$SLUG" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
const slug = process.argv[3];
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const host = data.preview.host || "127.0.0.1";
const basePort = Number(data.preview.portBase || 4173);
const slugHash = [...slug].reduce((acc, char) => acc + char.charCodeAt(0), 0);
const port = basePort + (slugHash % 200);
const entry = data.preview.entry || "/";

data.preview.port = port;
data.preview.healthcheck = `http://${host}:${port}${entry}`;
data.preview.state = {
  status: "stopped",
  pid: null,
  startedAt: null,
  readyAt: null,
  lastStoppedAt: null,
  lastError: null
};
data.envStatus.lastCheckedAt = new Date().toISOString();

fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
NODE

if [ -x "$SCRIPT_DIR/project-verify-scaffold.sh" ] || [ -f "$SCRIPT_DIR/project-verify-scaffold.sh" ]; then
  sh "$SCRIPT_DIR/project-verify-scaffold.sh" "$SLUG" "$TEMPLATE_ID" >&2
fi

printf '%s\n' "$PROJECT_ROOT"
