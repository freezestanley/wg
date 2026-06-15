#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

if [ "$#" -ne 1 ]; then
  usage
fi

SLUG=$1
PROJECT_ROOT=$(sh "$GUARD_SCRIPT" "$SLUG")
CONFIG_JSON="$PROJECT_ROOT/.webgen/config.json"

if [ ! -f "$CONFIG_JSON" ]; then
  echo "Missing .webgen/config.json under $PROJECT_ROOT/.webgen" >&2
  exit 1
fi

BUILD_CMD=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(String(data.deps.commands.build));" "$CONFIG_JSON")

(
  cd "$PROJECT_ROOT"
  sh -c "$BUILD_CMD"
)

ARTIFACT_DIR="$PROJECT_ROOT/dist"
if [ ! -d "$ARTIFACT_DIR" ]; then
  echo "Build completed but dist/ was not found under $PROJECT_ROOT" >&2
  exit 1
fi

node -e "const fs=require('fs'); const file=process.argv[1]; const data=JSON.parse(fs.readFileSync(file, 'utf8')); data.envStatus.nodeInstalled=true; data.envStatus.lastCheckedAt=new Date().toISOString(); data.envStatus.lastBuildAt=new Date().toISOString(); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');" "$CONFIG_JSON"

printf 'Artifact directory: %s\n' "$ARTIFACT_DIR"
printf 'Next actions:\n'
printf -- '- Verify preview output if needed\n'
printf -- '- Package or send dist/ contents to the user\n'
