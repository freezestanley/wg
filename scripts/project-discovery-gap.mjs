import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (process.argv.length !== 3) {
  fail("Usage: node scripts/project-discovery-gap.mjs <project-root>");
}

const projectRoot = process.argv[2];
const discoveryFile = join(projectRoot, "DISCOVERY.md");
const discoveryText = existsSync(discoveryFile)
  ? readFileSync(discoveryFile, "utf8")
  : "";

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

const requiredFields = [
  ["DESIGN_VARIANCE", /DESIGN_VARIANCE/],
  ["MOTION_INTENSITY", /MOTION_INTENSITY/],
  ["VISUAL_DENSITY", /VISUAL_DENSITY/],
  ["Atmosphere Layer", /Atmosphere Layer/],
  ["PC", /PC/],
  ["Pad", /Pad/],
  ["H5", /H5/],
  ["首屏焦点", /首屏焦点/],
  ["证明区策略", /证明区策略/],
  ["内容节奏", /内容节奏/],
  ["CTA 收口方式", /CTA 收口方式/],
  ["H5 首屏优先级", /H5 首屏优先级/],
  ["Ready 状态", /当前状态：`(Ready|Ready with Assumptions)`/]
];

const missingSections = requiredSections
  .filter((section) => !discoveryText.includes(section))
  .map((section) => section.replace(/^## /, ""));

const missingFields = requiredFields
  .filter(([, pattern]) => !pattern.test(discoveryText))
  .map(([label]) => label);

const lines = [
  `discovery: ${discoveryState}`,
  `missing-sections: ${missingSections.length ? missingSections.slice(0, 6).join(", ") : "none"}`,
  `missing-fields: ${missingFields.length ? missingFields.slice(0, 8).join(", ") : "none"}`
];

process.stdout.write(`${lines.join("\n")}\n`);
