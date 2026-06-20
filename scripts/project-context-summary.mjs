import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (process.argv.length !== 3) {
  fail("Usage: node scripts/project-context-summary.mjs <project-root>");
}

const projectRoot = process.argv[2];
const workflowFile = join(projectRoot, ".webgen", "workflow-state.json");
const discoveryFile = join(projectRoot, "DISCOVERY.md");

const readJson = (file, fallback) => {
  if (!existsSync(file)) {
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

const workflow = readJson(workflowFile, {
  currentStage: "missing",
  gates: {}
});

const discoveryText = existsSync(discoveryFile)
  ? readFileSync(discoveryFile, "utf8")
  : "";

const gates = {
  route: "Pending",
  session: "Pending",
  proposal: "Pending",
  implementation: "Pending",
  verification: "Pending",
  designReview: "Pending",
  publish: "Pending",
  ...(workflow.gates || {})
};

const readyMatch = discoveryText.match(/当前状态：`([^`]+)`/);
const discoveryState = readyMatch?.[1] || "Missing";

const requiredSections = [
  "## Design Read",
  "## 审版检查点",
  "## 风格档位",
  "## 氛围层策略",
  "## 适配目标",
  "## 交互补全状态",
  "## 输入素材收集",
  "## 图片策略",
  "## API / 数据策略",
  "## 适配检查清单"
];

const missingSections = requiredSections.filter((section) => !discoveryText.includes(section));

const stage = workflow.currentStage || "unknown";

const focusByStage = {
  routing: ".webgen/context-summary.txt, .webgen/discovery-gap.txt",
  discovery: ".webgen/discovery-gap.txt, DISCOVERY.md",
  proposal: ".webgen/discovery-gap.txt, DISCOVERY.md",
  implementation: "src/generated/page.js, src/styles.css",
  verification: "HANDOFF.md, ASSETS.md, preview-checks",
  "design-review": "HANDOFF.md, ASSETS.md, design-review-notes",
  publish: "dist.zip, .webgen/checks/publish.json"
};

const avoidByStage = {
  routing: "full-docs, shell-logs, unrelated-code, repeated-long-reads",
  discovery: "PROJECT.md, HANDOFF.md, shell-logs, repeated-long-reads",
  proposal: "PROJECT.md, HANDOFF.md, shell-logs, repeated-long-reads",
  implementation: "DISCOVERY.md-full, shell-logs, unrelated-runtime, unrelated-api",
  verification: "DISCOVERY.md-full, raw-build-logs, unrelated-runtime, repeated-long-reads",
  "design-review": "DISCOVERY.md-full, raw-build-logs, unrelated-runtime, repeated-long-reads",
  publish: "DISCOVERY.md-full, shell-logs, src/, repeated-long-reads"
};

const lines = [
  `stage: ${stage}`,
  `route: ${gates.route}`,
  `session: ${gates.session}`,
  `proposal: ${gates.proposal}`,
  `implementation: ${gates.implementation}`,
  `verification: ${gates.verification}`,
  `designReview: ${gates.designReview}`,
  `publish: ${gates.publish}`,
  `discovery: ${discoveryState}`,
  `focus: ${focusByStage[stage] || ".webgen/context-summary.txt"}`,
  `avoid: ${avoidByStage[stage] || "full-docs, shell-logs, unrelated-code, repeated-long-reads"}`
];

if (missingSections.length) {
  lines.push(`missing: ${missingSections.slice(0, 4).join(", ")}`);
}

process.stdout.write(`${lines.join("\n")}\n`);
