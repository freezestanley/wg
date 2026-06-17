#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_GUARD_SCRIPT="$SCRIPT_DIR/project-guard.sh"

usage() {
  echo "Usage: $0 <project-slug>" >&2
  exit 1
}

[ "$#" -eq 1 ] || usage
SLUG=$1
PROJECT_ROOT=$(sh "$PROJECT_GUARD_SCRIPT" "$SLUG")
CONFIG_JSON="$PROJECT_ROOT/.webgen/config.json"
REPORT_FILE="$PROJECT_ROOT/.webgen/checks/design-review-cdp.json"

[ -f "$CONFIG_JSON" ] || {
  echo "Missing .webgen/config.json under $PROJECT_ROOT/.webgen" >&2
  exit 1
}

mkdir -p "$PROJECT_ROOT/.webgen/checks"

REQUESTED=$(node - "$CONFIG_JSON" "${WEBGEN_CDP_SCREENSHOT_REQUESTED:-}" <<'NODE'
const fs = require("fs");

const file = process.argv[2];
const envValue = process.argv[3] || "";

const parseBool = (value) => {
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
};

const envParsed = envValue ? parseBool(envValue) : null;
if (envParsed !== null) {
  process.stdout.write(envParsed ? "true" : "false");
  process.exit(0);
}

try {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  process.stdout.write(data.review && data.review.cdpScreenshotRequested ? "true" : "false");
} catch {
  process.stdout.write("false");
}
NODE
)

write_skip_report() {
  reason=$1
  attempted=$2
  message=$3
  node - "$REPORT_FILE" "$reason" "$attempted" "$message" "$REQUESTED" <<'NODE'
const fs = require("fs");

const [file, reason, attemptedRaw, message, requestedRaw] = process.argv.slice(2);

let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  existing = {};
}

const next = {
  ...existing,
  status: "skipped",
  requested: requestedRaw === "true",
  attempted: attemptedRaw === "true",
  checkedAt: new Date().toISOString(),
  reason,
  message
};

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE
}

mark_pass_report() {
  node - "$REPORT_FILE" "$REQUESTED" <<'NODE'
const fs = require("fs");

const [file, requestedRaw] = process.argv.slice(2);

let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  existing = {};
}

const next = {
  ...existing,
  status: "passed",
  requested: requestedRaw === "true",
  attempted: true,
  checkedAt: new Date().toISOString()
};

fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
NODE
}

ALREADY_ATTEMPTED=$(node - "$REPORT_FILE" <<'NODE'
const fs = require("fs");
const file = process.argv[2];

try {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  process.stdout.write(data.attempted === true ? "true" : "false");
} catch {
  process.stdout.write("false");
}
NODE
)

if [ "$REQUESTED" != "true" ]; then
  write_skip_report "not-requested" "false" "CDP screenshot review is disabled by default."
  echo "DESIGN REVIEW CDP SKIPPED: not-requested"
  exit 0
fi

if [ "$ALREADY_ATTEMPTED" = "true" ]; then
  echo "DESIGN REVIEW CDP SKIPPED: already-attempted"
  exit 0
fi

HEALTHCHECK=$(node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(data.preview.healthcheck || "");' "$CONFIG_JSON")
[ -n "$HEALTHCHECK" ] || {
  write_skip_report "preview-unavailable" "true" "Preview healthcheck missing. Start preview first."
  echo "DESIGN REVIEW CDP SKIPPED: preview-unavailable"
  exit 0
}

curl -fsS "$HEALTHCHECK" >/dev/null 2>&1 || {
  write_skip_report "preview-unavailable" "true" "Preview not healthy: $HEALTHCHECK"
  echo "DESIGN REVIEW CDP SKIPPED: preview-unavailable"
  exit 0
}

if OUTPUT=$(node "$SCRIPT_DIR/project-design-review-cdp.mjs" "$PROJECT_ROOT" "$HEALTHCHECK" 2>&1); then
  mark_pass_report
  printf '%s\n' "$OUTPUT"
  exit 0
fi

write_skip_report "cdp-failed-once" "true" "$OUTPUT"
echo "DESIGN REVIEW CDP SKIPPED: cdp-failed-once"
exit 0
