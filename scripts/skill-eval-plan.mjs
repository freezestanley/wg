#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function usage() {
  console.error("Usage: node scripts/skill-eval-plan.mjs <skill-dir> [iteration-number]");
  process.exit(1);
}

const [, , skillDirArg, iterationArg = "1"] = process.argv;

if (!skillDirArg) usage();

const skillDir = path.resolve(skillDirArg);
const evalsFile = path.join(skillDir, "evals", "evals.json");
const skillName = path.basename(skillDir);
const iteration = Number(iterationArg);
const iterationRoot = path.join(`${skillDir}-workspace`, `iteration-${iteration}`);
const manifestFile = path.join(iterationRoot, "run-manifest.json");
const planFile = path.join(iterationRoot, "run-plan.md");

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

const runs = [];
for (const item of evals) {
  const evalName = `eval-${item.id}`;
  for (const mode of ["with_skill", "without_skill"]) {
    runs.push({
      eval_id: item.id,
      eval_name: evalName,
      mode,
      prompt: item.prompt ?? "",
      expected_output: item.expected_output ?? "",
      output_dir: path.join(iterationRoot, evalName, mode, "outputs"),
      grading_file: path.join(iterationRoot, evalName, mode, "grading.json"),
      timing_file: path.join(iterationRoot, evalName, mode, "timing.json")
    });
  }
}

const manifest = {
  skill_name: evalConfig?.skill_name || skillName,
  iteration,
  runs
};

const lines = [
  `# ${manifest.skill_name} Iteration ${iteration} Run Plan`,
  "",
  `- skill: \`${skillDir}\``,
  `- iteration root: \`${iterationRoot}\``,
  ""
];

for (const run of runs) {
  lines.push(`## ${run.eval_name} / ${run.mode}`);
  lines.push(`- prompt: ${run.prompt}`);
  if (run.expected_output) lines.push(`- expected: ${run.expected_output}`);
  lines.push(`- output dir: \`${run.output_dir}\``);
  lines.push(`- grading file: \`${run.grading_file}\``);
  lines.push(`- timing file: \`${run.timing_file}\``);
  lines.push("");
}

writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(planFile, `${lines.join("\n")}\n`);

process.stdout.write(`Wrote ${manifestFile}\nWrote ${planFile}\n`);
