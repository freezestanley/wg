#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

function usage() {
  console.error("Usage: node scripts/skill-eval-record.mjs <run-dir> <grading-json> <timing-json>");
  process.exit(1);
}

const [, , runDirArg, gradingArg, timingArg] = process.argv;

if (!runDirArg || !gradingArg || !timingArg) usage();

const runDir = path.resolve(runDirArg);
let grading;
let timing;

try {
  grading = JSON.parse(gradingArg);
} catch (error) {
  console.error("Invalid grading json");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

try {
  timing = JSON.parse(timingArg);
} catch (error) {
  console.error("Invalid timing json");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

mkdirSync(runDir, { recursive: true });

const nextGrading = {
  expectations: Array.isArray(grading?.expectations) ? grading.expectations : []
};

const durationMs = timing?.duration_ms ?? null;
const nextTiming = {
  total_tokens: timing?.total_tokens ?? null,
  duration_ms: durationMs,
  total_duration_seconds:
    typeof durationMs === "number" && Number.isFinite(durationMs)
      ? durationMs / 1000
      : timing?.total_duration_seconds ?? null
};

writeFileSync(path.join(runDir, "grading.json"), `${JSON.stringify(nextGrading, null, 2)}\n`);
writeFileSync(path.join(runDir, "timing.json"), `${JSON.stringify(nextTiming, null, 2)}\n`);

process.stdout.write(`Recorded eval results at ${runDir}\n`);
