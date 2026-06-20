import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function usage() {
  console.error("Usage: node scripts/page-design-guard.mjs <project-root>");
  process.exit(1);
}

if (process.argv.length !== 3) {
  usage();
}

const projectRoot = process.argv[2];
const pageFile = join(projectRoot, "src", "generated", "page.js");

if (!existsSync(pageFile)) {
  console.error(`PAGE DESIGN GUARD FAILED: missing file ${pageFile}`);
  process.exit(2);
}

const source = readFileSync(pageFile, "utf8");
const normalized = source.toLowerCase();
const issues = [];

const hasScaffoldPlaceholder =
  /hello world/i.test(source) &&
  /min-h-screen/.test(source) &&
  /justify-center/.test(source);

function findHeroBlock(input) {
  const h1Index = input.search(/<h1[\s>]/i);
  if (h1Index === -1) return "";
  const tail = input.slice(h1Index);
  const endMatch = tail.match(/<\/header>|<\/section>/i);
  const endIndex = endMatch ? h1Index + endMatch.index + endMatch[0].length : h1Index + 1200;
  return input.slice(h1Index, endIndex);
}

function extractCtaTexts(input) {
  const matches = [];
  const pattern = /<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  for (const match of input.matchAll(pattern)) {
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) matches.push(text);
  }
  return matches;
}

const hasHero =
  /<h1[\s>]/i.test(source) ||
  normalized.includes("hero");

const hasProof =
  /proof|case|testimonial|trust|spec|metric|stats|数据|案例|客户|信任|规格/.test(normalized);

const hasCta =
  /<button[\s>]|<a[\s>][^>]*href=|cta|立即|开始|咨询|预约|购买|联系/.test(source);

const hasThreeColumnGrid =
  /grid-cols-3|lg:grid-cols-3|md:grid-cols-3/.test(source);

const heroBlock = findHeroBlock(source);
const heroHasValueCopy =
  /<p[\s>]/i.test(heroBlock) ||
  /价值|说明|方案|服务|平台|系统|体验|效率|转化|帮助|增长|解决|why|what|for/i.test(heroBlock);
const heroHasEarlyCta =
  /<button[\s>]|<a[\s>][^>]*href=|立即|开始|咨询|预约|购买|联系|申请|体验|试用/.test(heroBlock);
const ctaTexts = extractCtaTexts(source);
const hasGenericCtaCopy = ctaTexts.some((text) =>
  /^(了解更多|查看更多|点击查看|点击了解|read more|learn more|see more|discover more)$/i.test(text)
);

if (!hasHero) {
  issues.push("hero missing");
}

if (!hasProof) {
  issues.push("proof section missing");
}

if (!hasCta) {
  issues.push("cta missing");
}

if (hasThreeColumnGrid) {
  issues.push("three-column card grid detected");
}

if (hasHero && !heroHasValueCopy && !heroHasEarlyCta) {
  issues.push("hero missing value copy or early cta");
}

if (hasGenericCtaCopy) {
  issues.push("generic cta copy detected");
}

if (hasScaffoldPlaceholder) {
  issues.push("scaffold placeholder not replaced");
}

if (issues.length > 0) {
  console.log("PAGE DESIGN GUARD FAILED");
  for (const issue of issues) {
    console.log(`- ${issue}`);
  }
  process.exit(2);
}

console.log("PAGE DESIGN GUARD OK");
