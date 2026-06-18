#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function usage() {
  console.error("Usage: node scripts/skill-eval-init.mjs <skill-dir> [iteration-number]");
  process.exit(1);
}

const [, , skillDirArg, iterationArg = "1"] = process.argv;

if (!skillDirArg) usage();

const skillDir = path.resolve(skillDirArg);
const evalsFile = path.join(skillDir, "evals", "evals.json");
const iterationNumber = String(iterationArg);
const iterationDirName = `iteration-${iterationNumber}`;
const workspaceRoot = `${skillDir}-workspace`;
const iterationRoot = path.join(workspaceRoot, iterationDirName);

let evalConfig;
try {
  evalConfig = JSON.parse(readFileSync(evalsFile, "utf8"));
} catch (error) {
  console.error(`Failed to read evals file: ${evalsFile}`);
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const evals = Array.isArray(evalConfig?.evals) ? evalConfig.evals : [];
if (evals.length === 0) {
  console.error(`No evals found in ${evalsFile}`);
  process.exit(1);
}

mkdirSync(iterationRoot, { recursive: true });

for (const item of evals) {
  const evalId = item?.id;
  const evalName = `eval-${evalId}`;
  const evalRoot = path.join(iterationRoot, evalName);
  const configurations = ["with_skill", "without_skill"];

  for (const configuration of configurations) {
    const runRoot = path.join(evalRoot, configuration);
    mkdirSync(path.join(runRoot, "outputs"), { recursive: true });
    writeFileSync(
      path.join(runRoot, "grading.json"),
      `${JSON.stringify({ expectations: [] }, null, 2)}\n`
    );
    writeFileSync(
      path.join(runRoot, "timing.json"),
      `${JSON.stringify({ total_tokens: null, duration_ms: null, total_duration_seconds: null }, null, 2)}\n`
    );
  }

  const metadata = {
    eval_id: evalId,
    eval_name: evalName,
    prompt: item?.prompt ?? "",
    assertions: []
  };

  writeFileSync(
    path.join(evalRoot, "eval_metadata.json"),
    `${JSON.stringify(metadata, null, 2)}\n`
  );
}

process.stdout.write(`Initialized ${iterationDirName} at ${iterationRoot}\n`);
