import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKSPACE_ROOT = "/Users/za-stanlexu/.openclaw/agents/webgen/workspace";
const MANIFEST_FILE = join(WORKSPACE_ROOT, "templates/vite-page/scaffold-manifest.txt");
const SUMMARY_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-context-summary.mjs");
const GAP_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-discovery-gap.mjs");
const SYNC_DOCS_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-sync-docs.sh");
const RESUME_CONTEXT_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-resume-context.sh");
const SESSION_ENTRY_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-session-entry.sh");
const SESSION_RECOVER_SCRIPT = join(WORKSPACE_ROOT, "scripts/session-recover.sh");
const WORKFLOW_REPORT_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-report.sh");
const WORKFLOW_ANNOUNCE_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-announce-status.sh");
const COMPACT_REQUEST_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-request-compact.sh");
const COMPACT_HANDLE_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-handle-compact.sh");
const COMPACT_INSPECT_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-inspect-compact-request.sh");
const PROJECT_PUBLISH_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-publish.sh");
const PROJECT_PUBLISH_STATUS_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-publish-status.sh");
const WORKFLOW_RECORD_PUBLISH_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-record-publish.sh");
const PREVIEW_STATUS_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-preview-status.sh");
const PREVIEW_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-preview.sh");
const DESIGN_REVIEW_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-design-review.sh");
const PREVIEW_MANAGER_SCRIPT = join(WORKSPACE_ROOT, "scripts/preview-manager.sh");
const PATHS_SCRIPT = join(WORKSPACE_ROOT, "scripts/webgen-paths.sh");
const GLOBAL_CONFIG_FILE = join(WORKSPACE_ROOT, "config.js");
const LEGACY_GLOBAL_CONFIG_FILE = join(WORKSPACE_ROOT, ".openclaw", "webgen-config.json");
const ROUTING_TEMPLATE_FILE = join(WORKSPACE_ROOT, "docs", "webgen-routing-message-templates.md");
const ERROR_HANDLING_FILE = join(WORKSPACE_ROOT, "docs", "webgen-session-error-handling.md");
const SOP_GATES_FILE = join(WORKSPACE_ROOT, "docs", "webgen-sop-and-gates.md");
const CHANGE_LOG_FILE = join(WORKSPACE_ROOT, "docs", "webgen-skill-change-log.md");
const DESIGN_HARD_CHECKS_FILE = join(WORKSPACE_ROOT, "docs", "plans", "2026-06-16-webgen-design-hard-checks.md");
const TEST_PROJECTS_ROOT = mkdtempSync(join(tmpdir(), "webgen-projects-suite-"));

process.env.WEBGEN_PROJECTS_ROOT = TEST_PROJECTS_ROOT;
process.on("exit", () => {
  rmSync(TEST_PROJECTS_ROOT, { recursive: true, force: true });
});

function writeWorkspaceConfig(config) {
  writeFileSync(GLOBAL_CONFIG_FILE, `module.exports = ${JSON.stringify(config, null, 2)};\n`);
}

function readProjectsRoot(env = process.env) {
  return execFileSync("sh", [PATHS_SCRIPT, "projects-root"], {
    cwd: WORKSPACE_ROOT,
    env,
    encoding: "utf8"
  }).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("vite-page scaffold manifest excludes heavy generated assets", () => {
  assert.equal(existsSync(MANIFEST_FILE), true, "missing scaffold manifest");

  const manifest = execFileSync("sed", ["-n", "1,200p", MANIFEST_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });

  assert.match(manifest, /src\/main\.js/);
  assert.equal(manifest.includes("node_modules"), false);
  assert.equal(manifest.includes("dist/"), false);
  assert.equal(manifest.includes(".webgen/artifacts"), false);
  assert.equal(manifest.includes("dist.zip"), false);
});

test("project context summary returns short workflow and discovery readiness", () => {
  assert.equal(existsSync(SUMMARY_SCRIPT), true, "missing context summary script");

  const root = mkdtempSync(join(tmpdir(), "webgen-context-summary-"));

  try {
    mkdirSync(join(root, ".webgen"), { recursive: true });
    writeFileSync(
      join(root, ".webgen", "workflow-state.json"),
      JSON.stringify(
        {
          currentStage: "proposal",
          gates: {
            route: "Pass",
            session: "Pass",
            proposal: "Pending",
            implementation: "Pending",
            verification: "Pending",
            designReview: "Pending"
          }
        },
        null,
        2
      )
    );
    writeFileSync(
      join(root, "DISCOVERY.md"),
      [
        "# Discovery",
        "",
        "## Design Read",
        "",
        "- 页面类型：待确认",
        "",
        "## Ready / Not Ready",
        "",
        "- 当前状态：`Not Ready`"
      ].join("\n")
    );

    const output = execFileSync("node", [SUMMARY_SCRIPT, root], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, /stage: proposal/);
    assert.match(output, /proposal: Pending/);
    assert.match(output, /discovery: Not Ready/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("project discovery gap reports concise missing sections and fields", () => {
  assert.equal(existsSync(GAP_SCRIPT), true, "missing discovery gap script");

  const root = mkdtempSync(join(tmpdir(), "webgen-discovery-gap-"));

  try {
    mkdirSync(join(root, ".webgen"), { recursive: true });
    writeFileSync(
      join(root, "DISCOVERY.md"),
      [
        "# Discovery",
        "",
        "## Design Read",
        "",
        "- 页面类型 / 受众 / 风格语言 / 设计体系：待确认",
        "",
        "## 风格档位",
        "",
        "- DESIGN_VARIANCE：待确认",
        "",
        "## Ready / Not Ready",
        "",
        "- 当前状态：`Not Ready`"
      ].join("\n")
    );

    const output = execFileSync("node", [GAP_SCRIPT, root], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, /^discovery: Not Ready$/m);
    assert.match(output, /^missing-sections: /m);
    assert.match(output, /审版检查点/);
    assert.match(output, /^missing-fields: /m);
    assert.match(output, /MOTION_INTENSITY/);
    assert.equal(output.includes("## Design Read"), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow sync writes compact context summary file", () => {
  const root = mkdtempSync(join(tmpdir(), "webgen-context-sync-"));

  try {
    mkdirSync(join(root, ".webgen", "checks"), { recursive: true });
    writeFileSync(
      join(root, ".webgen", "workflow-state.json"),
      JSON.stringify(
        {
          currentStage: "implementation",
          updatedAt: "2026-06-16T00:00:00.000Z",
          gates: {
            route: "Pass",
            session: "Pass",
            proposal: "Pass",
            implementation: "Pending",
            verification: "Pending",
            designReview: "Pending"
          },
          notes: {}
        },
        null,
        2
      )
    );
    writeFileSync(join(root, ".webgen", "approval.json"), JSON.stringify({ confirmed: true }, null, 2));
    writeFileSync(join(root, ".webgen", "checks", "verification.json"), JSON.stringify({ status: "pending" }, null, 2));
    writeFileSync(join(root, ".webgen", "checks", "delivery.json"), JSON.stringify({ status: "pending", missing: [] }, null, 2));
    writeFileSync(join(root, ".webgen", "checks", "design-review.json"), JSON.stringify({ status: "pending" }, null, 2));
    writeFileSync(join(root, "PROJECT.md"), "# Demo\n\n## Workflow 状态\n\n- 待同步\n\n## Gate 状态\n\n- 待同步\n\n## 最近进展\n\n- 待同步\n");
    writeFileSync(join(root, "HANDOFF.md"), "# Demo\n\n## 当前状态\n\n- 待同步\n\n## 当前 Workflow / Gates\n\n- 待同步\n\n## 最近改动\n\n- 待同步\n\n## 下一步\n\n- 待同步\n");
    writeFileSync(join(root, "DISCOVERY.md"), "# Discovery\n\n## Ready / Not Ready\n\n- 当前状态：`Ready`\n");

    const slug = `context-sync-test-${Date.now()}`;
    const projectRoot = join(readProjectsRoot(), slug);
    execFileSync("mkdir", ["-p", projectRoot], { cwd: WORKSPACE_ROOT });
    execFileSync("cp", ["-R", `${root}/.`, projectRoot], { cwd: WORKSPACE_ROOT });

    execFileSync("sh", [SYNC_DOCS_SCRIPT, slug, "同步测试"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const summaryFile = join(projectRoot, ".webgen", "context-summary.txt");
    const gapFile = join(projectRoot, ".webgen", "discovery-gap.txt");
    assert.equal(existsSync(summaryFile), true, "missing context summary artifact");
    assert.equal(existsSync(gapFile), true, "missing discovery gap artifact");

    const summary = execFileSync("sed", ["-n", "1,80p", summaryFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(summary, /stage: implementation/);
    assert.match(summary, /proposal: Pass/);
    assert.match(summary, /discovery: Ready/);

    const gap = execFileSync("sed", ["-n", "1,40p", gapFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(gap, /discovery: Ready/);

    rmSync(projectRoot, { recursive: true, force: true });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("project init includes compact context summary in default scope", () => {
  const slug = `context-scope-${Date.now()}`;

  try {
    const output = execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, new RegExp(`^project: ${escapeRegExp(join(readProjectsRoot(), slug))}$`, "m"));
    assert.equal(output.includes("SCAFFOLD VERIFY OK"), false);
    assert.equal(output.includes("WORKFLOW INIT OK"), false);

    const scopeFile = join(readProjectsRoot(), slug, ".webgen", "write-scope.json");
    const scope = JSON.parse(
      execFileSync("cat", [scopeFile], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      })
    );

    assert.match(
      JSON.stringify(scope.stages.discovery || []),
      /\.webgen\/context-summary\.txt/
    );
    assert.match(
      JSON.stringify(scope.stages.discovery || []),
      /\.webgen\/discovery-gap\.txt/
    );
    assert.equal(
      JSON.stringify(scope.stages.discovery || []).includes("PROJECT.md"),
      false
    );
    assert.equal(
      JSON.stringify(scope.stages.discovery || []).includes("HANDOFF.md"),
      false
    );
    assert.equal(
      JSON.stringify(scope.stages.proposal || []).includes("PROJECT.md"),
      false
    );
    assert.equal(
      JSON.stringify(scope.stages.proposal || []).includes("HANDOFF.md"),
      false
    );
    assert.match(
      JSON.stringify(scope.stages.implementation || []),
      /\.webgen\/context-summary\.txt/
    );
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project resume context prints summary and suggested follow-up reads", () => {
  const slug = `resume-context-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const output = execFileSync("sh", [RESUME_CONTEXT_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, new RegExp(`^project: ${escapeRegExp(join(readProjectsRoot(), slug))}$`, "m"));
    assert.match(output, /^stage: discovery$/m);
    assert.match(output, /^discovery: Not Ready$/m);
    assert.match(output, /^next: .*\.webgen\/context-summary\.txt.*\.webgen\/discovery-gap\.txt/m);
    assert.equal(output.includes("PROJECT.md"), false);
    assert.equal(output.includes("HANDOFF.md"), false);
    assert.equal(output.includes("suggested:"), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project session entry handles new and resume flows", () => {
  const slug = `session-entry-${Date.now()}`;
  const sessionKey = `agent:webgen:proj-${slug}`;

  try {
    const initOutput = execFileSync("sh", [SESSION_ENTRY_SCRIPT, slug, sessionKey, "new", "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(initOutput, /entry: new/);
    assert.match(initOutput, /^stage: discovery$/m);
    assert.equal(initOutput.includes("SCAFFOLD VERIFY OK"), false);
    assert.equal(initOutput.includes("summary:"), false);

    const lockFile = join(readProjectsRoot(), slug, ".webgen", "session-lock.json");
    const lock = JSON.parse(
      execFileSync("cat", [lockFile], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      })
    );
    assert.equal(lock.slug, slug);
    assert.equal(lock.sessionKey, sessionKey);

    const resumeOutput = execFileSync("sh", [SESSION_ENTRY_SCRIPT, slug, sessionKey, `resume:${slug}`], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(resumeOutput, /entry: resume/);
    assert.match(resumeOutput, /stage: discovery/);
    assert.equal(resumeOutput.includes("summary:"), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project session entry reports real projects root when new hits existing lock", () => {
  const slug = `session-entry-existing-${Date.now()}`;
  const sessionKey = `agent:webgen:proj-${slug}`;

  try {
    execFileSync("sh", [SESSION_ENTRY_SCRIPT, slug, sessionKey, "new", "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const result = spawnSync("sh", [SESSION_ENTRY_SCRIPT, slug, sessionKey, "new", "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.equal(result.status, 4);
    assert.match(result.stderr, /LOCK_EXISTS_SAME/);
    assert.match(result.stderr, new RegExp(`projects-root: ${escapeRegExp(readProjectsRoot())}`));
    assert.match(result.stderr, new RegExp(`lock-file: ${escapeRegExp(join(readProjectsRoot(), slug, ".webgen", "session-lock.json"))}`));
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow stage transitions write and handle compact requests", () => {
  const slug = `compact-request-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("sh", ["scripts/workflow-record-approval.sh", slug, "方案已确认"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const requestFile = join(readProjectsRoot(), slug, ".webgen", "compact-request.json");
    let request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "pending");
    assert.equal(request.fromStage, "discovery");
    assert.equal(request.toStage, "proposal");
    assert.equal(request.requestedBy, "workflow-record-approval");

    execFileSync("sh", [COMPACT_HANDLE_SCRIPT, slug, "done"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "done");
    assert.equal(typeof request.handledAt, "string");

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      fs.writeFileSync(file, [
        "# Discovery",
        "",
        "## Design Read",
        "",
        "- 页面类型 / 受众 / 风格语言 / 设计体系：已确认",
        "",
        "## 审版检查点",
        "",
        "- 首屏焦点：已确认",
        "- 证明区策略：已确认",
        "- 内容节奏：已确认",
        "- CTA 收口方式：已确认",
        "- H5 首屏优先级：已确认",
        "",
        "## 风格档位",
        "",
        "- DESIGN_VARIANCE：已确认",
        "- MOTION_INTENSITY：已确认",
        "- VISUAL_DENSITY：已确认",
        "",
        "## 氛围层策略",
        "",
        "- Atmosphere Layer：已确认",
        "",
        "## 适配目标",
        "",
        "- PC：已确认",
        "- Pad：已确认",
        "- H5：已确认",
        "",
        "## 交互补全状态",
        "",
        "- Loading：已确认",
        "- Empty：已确认",
        "- Error：已确认",
        "- Active Feedback：已确认",
        "",
        "## 输入素材收集",
        "",
        "- 文案素材：已确认",
        "",
        "## 图片策略",
        "",
        "- 用户素材：已确认",
        "",
        "## API / 数据策略",
        "",
        "- 已确认",
        "",
        "## 适配检查清单",
        "",
        "- [x] 已确认",
        "",
        "## Ready / Not Ready",
        "",
        "- 当前状态：\`Ready\`"
      ].join("\\n"));
    `, join(readProjectsRoot(), slug, "DISCOVERY.md")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("sh", ["scripts/workflow-enter-implementation.sh", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "pending");
    assert.equal(request.fromStage, "proposal");
    assert.equal(request.toStage, "implementation");
    assert.equal(request.requestedBy, "workflow-enter-implementation");

    execFileSync("sh", [COMPACT_HANDLE_SCRIPT, slug, "skipped", "compact-not-needed"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "skipped");
    assert.equal(request.note, "compact-not-needed");
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow verification and design review record compact requests on passed transitions", () => {
  const slug = `compact-stage-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/workflow-record-approval.sh", slug, "方案已确认"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      fs.writeFileSync(file, [
        "# Discovery",
        "",
        "## Design Read",
        "",
        "- 页面类型 / 受众 / 风格语言 / 设计体系：已确认",
        "",
        "## 审版检查点",
        "",
        "- 首屏焦点：已确认",
        "- 证明区策略：已确认",
        "- 内容节奏：已确认",
        "- CTA 收口方式：已确认",
        "- H5 首屏优先级：已确认",
        "",
        "## 风格档位",
        "",
        "- DESIGN_VARIANCE：已确认",
        "- MOTION_INTENSITY：已确认",
        "- VISUAL_DENSITY：已确认",
        "",
        "## 氛围层策略",
        "",
        "- Atmosphere Layer：已确认",
        "",
        "## 适配目标",
        "",
        "- PC：已确认",
        "- Pad：已确认",
        "- H5：已确认",
        "",
        "## 交互补全状态",
        "",
        "- Loading：已确认",
        "- Empty：已确认",
        "- Error：已确认",
        "- Active Feedback：已确认",
        "",
        "## 输入素材收集",
        "",
        "- 文案素材：已确认",
        "",
        "## 图片策略",
        "",
        "- 用户素材：已确认",
        "",
        "## API / 数据策略",
        "",
        "- 已确认",
        "",
        "## 适配检查清单",
        "",
        "- [x] 已确认",
        "",
        "## Ready / Not Ready",
        "",
        "- 当前状态：\`Ready\`"
      ].join("\\n"));
    `, join(readProjectsRoot(), slug, "DISCOVERY.md")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/workflow-enter-implementation.sh", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/workflow-record-verification.sh", slug, "passed", "验证通过"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const requestFile = join(readProjectsRoot(), slug, ".webgen", "compact-request.json");
    let request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "pending");
    assert.equal(request.fromStage, "implementation");
    assert.equal(request.toStage, "verification");
    assert.equal(request.requestedBy, "workflow-record-verification");

    execFileSync("sh", [COMPACT_HANDLE_SCRIPT, slug, "done"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/workflow-record-design-review.sh", slug, "passed", "设计复核通过"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    request = JSON.parse(execFileSync("cat", [requestFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(request.status, "pending");
    assert.equal(request.fromStage, "verification");
    assert.equal(request.toStage, "design-review");
    assert.equal(request.requestedBy, "workflow-record-design-review");
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow compact inspect prints minimal dispatcher handoff", () => {
  const slug = `compact-inspect-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/workflow-record-approval.sh", slug, "方案已确认"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const output = execFileSync("sh", [COMPACT_INSPECT_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, /^status: pending$/m);
    assert.match(output, /^transition: discovery -> proposal$/m);
    assert.match(output, /^summary: .*\.webgen\/context-summary\.txt$/m);
    assert.match(output, /^gap: .*\.webgen\/discovery-gap\.txt$/m);
    assert.match(output, /^next: run \/compact then sh scripts\/workflow-handle-compact\.sh .* done$/m);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("session recover lists projects and rebuilds canonical registry from locks", () => {
  const slug = `session-recover-${Date.now()}`;
  const legacyKey = `subagent:legacy-${slug}`;
  const registryFile = join(WORKSPACE_ROOT, ".openclaw", "webgen-session-registry.json");
  const registryBackup = existsSync(registryFile)
    ? execFileSync("cat", [registryFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const lockFile = join(readProjectsRoot(), slug, ".webgen", "session-lock.json");
    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const data={slug:process.argv[2], sessionKey:process.argv[3], boundAt:"2026-06-16T00:00:00.000Z"};
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, lockFile, slug, legacyKey], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    writeFileSync(registryFile, "{}\n");

    const listOutput = execFileSync("sh", [SESSION_RECOVER_SCRIPT, "list"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(listOutput, /^slug: /m);
    assert.match(listOutput, new RegExp(`slug: ${slug}`));
    assert.match(listOutput, /sessionKey:/);

    const rebuildOutput = execFileSync("sh", [SESSION_RECOVER_SCRIPT, "rebuild-registry"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(rebuildOutput, /registry: rebuilt/);

    const registry = JSON.parse(execFileSync("cat", [registryFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(registry[slug], `agent:webgen:proj-${slug}`);
  } finally {
    if (registryBackup === null) {
      rmSync(registryFile, { force: true });
    } else {
      writeFileSync(registryFile, registryBackup);
    }
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("session recover resume and rebind normalize lock to canonical key", () => {
  const slug = `session-rebind-${Date.now()}`;
  const legacyKey = `subagent:legacy-${slug}`;
  const canonicalKey = `agent:webgen:proj-${slug}`;
  const registryFile = join(WORKSPACE_ROOT, ".openclaw", "webgen-session-registry.json");
  const registryBackup = existsSync(registryFile)
    ? execFileSync("cat", [registryFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const lockFile = join(readProjectsRoot(), slug, ".webgen", "session-lock.json");
    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const data={slug:process.argv[2], sessionKey:process.argv[3], boundAt:"2026-06-16T00:00:00.000Z"};
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, lockFile, slug, legacyKey], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    writeFileSync(registryFile, "{}\n");

    const resumeOutput = execFileSync("sh", [SESSION_RECOVER_SCRIPT, "resume", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(resumeOutput, new RegExp(`sessionKey=${canonicalKey}`));
    assert.match(resumeOutput, new RegExp(`mode=resume:${slug}`));

    let lock = JSON.parse(execFileSync("cat", [lockFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(lock.sessionKey, canonicalKey);

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.sessionKey = process.argv[2];
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, lockFile, legacyKey], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    writeFileSync(registryFile, "{}\n");

    const rebindOutput = execFileSync("sh", [SESSION_RECOVER_SCRIPT, "rebind", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(rebindOutput, /rebound:/);

    lock = JSON.parse(execFileSync("cat", [lockFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(lock.sessionKey, canonicalKey);
    assert.equal(lock.reboundFromSessionKey, legacyKey);
    assert.equal(typeof lock.reboundAt, "string");
  } finally {
    if (registryBackup === null) {
      rmSync(registryFile, { force: true });
    } else {
      writeFileSync(registryFile, registryBackup);
    }
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow report defaults to compact summary lines", () => {
  const slug = `workflow-report-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const output = execFileSync("sh", [WORKFLOW_REPORT_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, new RegExp(`^project: ${escapeRegExp(join(readProjectsRoot(), slug))}$`, "m"));
    assert.match(output, /^stage: discovery$/m);
    assert.match(output, /^approval: pending$/m);
    assert.match(output, /^verification: pending$/m);
    assert.match(output, /^design-review: pending$/m);
    assert.match(output, /^publish: pending$/m);
    assert.match(output, /^gates: route=Pass session=Pending proposal=Pending implementation=Pending verification=Pending designReview=Pending publish=Pending$/m);
    assert.match(output, /^next: .*discovery-gap.*一次补齐 Discovery/m);
    assert.equal(output.includes("# Workflow Report"), false);
    assert.equal(output.includes("## Gates"), false);
    assert.equal(output.includes("## Next Steps"), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow report verbose shows queued publish details", () => {
  const slug = `workflow-report-publish-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const stateFile=process.argv[1];
      const publishFile=process.argv[2];
      const state=JSON.parse(fs.readFileSync(stateFile,"utf8"));
      state.currentStage = "publish";
      state.gates = { ...(state.gates||{}), proposal:"Pass", verification:"Pass", designReview:"Pass", publish:"Pass" };
      state.notes = { ...(state.notes||{}), publish:"异步发布已入队" };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\\n");
      fs.writeFileSync(publishFile, JSON.stringify({
        status:"queued",
        gate:"Pass",
        userConfirmed:true,
        artifact:"/tmp/dist.zip",
        artifactSha256:"sha-demo",
        endpoint:"https://publish.example.test/upload",
        remoteStatus:202,
        releaseId:null,
        jobId:"job_demo",
        pollUrl:"https://publish.example.test/status/job_demo",
        publishedUrl:null,
        checkedAt:new Date().toISOString(),
        publishedAt:null,
        notes:"已进入发布队列"
      }, null, 2) + "\\n");
    `, join(readProjectsRoot(), slug, ".webgen", "workflow-state.json"), join(readProjectsRoot(), slug, ".webgen", "checks", "publish.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const output = execFileSync("sh", [WORKFLOW_REPORT_SCRIPT, slug, "--verbose"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, /## Publish Notes/);
    assert.match(output, /已进入发布队列/);
    assert.match(output, /job_demo/);
    assert.match(output, /https:\/\/publish\.example\.test\/status\/job_demo/);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow announce status shows publish queue and published states", () => {
  const slug = `workflow-announce-publish-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const stateFile = join(readProjectsRoot(), slug, ".webgen", "workflow-state.json");
    const publishFile = join(readProjectsRoot(), slug, ".webgen", "checks", "publish.json");

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const stateFile=process.argv[1];
      const publishFile=process.argv[2];
      const state=JSON.parse(fs.readFileSync(stateFile,"utf8"));
      state.currentStage = "publish";
      state.gates = { ...(state.gates||{}), publish:"Pass" };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\\n");
      fs.writeFileSync(publishFile, JSON.stringify({
        status:"queued",
        gate:"Pass",
        userConfirmed:true,
        artifact:null,
        artifactSha256:null,
        endpoint:"https://publish.example.test/upload",
        remoteStatus:202,
        releaseId:null,
        jobId:"job_demo",
        pollUrl:"https://publish.example.test/status/job_demo",
        publishedUrl:null,
        checkedAt:new Date().toISOString(),
        publishedAt:null,
        notes:"已进入发布队列"
      }, null, 2) + "\\n");
    `, stateFile, publishFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    let output = execFileSync("sh", [WORKFLOW_ANNOUNCE_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(output, /^发布排队中 \/ 尚未完成设计复核 \/ 无阻塞$/m);

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.status = "published";
      data.remoteStatus = 200;
      data.releaseId = "rel_demo";
      data.publishedUrl = "https://publish.example.test/final";
      data.publishedAt = new Date().toISOString();
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, publishFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    output = execFileSync("sh", [WORKFLOW_ANNOUNCE_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(output, /^发布已完成 \/ 尚未完成设计复核 \/ 无阻塞$/m);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow record publish marks exception-pass when user chooses not to publish", () => {
  const slug = `publish-skip-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const stateFile=process.argv[1];
      const reviewFile=process.argv[2];
      const state=JSON.parse(fs.readFileSync(stateFile,"utf8"));
      state.currentStage = "design-review";
      state.gates = { ...(state.gates||{}), proposal:"Pass", verification:"Pass", designReview:"Pass" };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\\n");
      fs.writeFileSync(reviewFile, JSON.stringify({ status:"passed", checkedAt:new Date().toISOString(), notes:"ok" }, null, 2) + "\\n");
    `, join(readProjectsRoot(), slug, ".webgen", "workflow-state.json"), join(readProjectsRoot(), slug, ".webgen", "checks", "design-review.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("sh", [WORKFLOW_RECORD_PUBLISH_SCRIPT, slug, "skipped", "用户选择不发布"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const state = JSON.parse(execFileSync("cat", [join(readProjectsRoot(), slug, ".webgen", "workflow-state.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const publish = JSON.parse(execFileSync("cat", [join(readProjectsRoot(), slug, ".webgen", "checks", "publish.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));

    assert.equal(state.gates.publish, "Exception-Pass");
    assert.equal(publish.status, "skipped");
    assert.equal(publish.userConfirmed, false);
    assert.equal(publish.gate, "Exception-Pass");
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project publish uploads dist zip using endpoint from workspace config", async () => {
  const slug = `publish-upload-${Date.now()}`;
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    const fakeBin = mkdtempSync(join(tmpdir(), "webgen-fake-curl-"));
    const argsFile = join(fakeBin, "curl-args.txt");
    writeFileSync(join(fakeBin, "curl"), `#!/bin/sh
printf '%s\n' "$@" > "$WEBGEN_TEST_CURL_ARGS_FILE"
printf '%s' '{"success":true,"message":"成功上传 1 个文件","files":[{"originalName":"dist.zip","savedName":"1718000000000_dist.zip","mimetype":"application/zip","size":17,"path":"/uploads/1718000000000_dist.zip"}]}'
`, { mode: 0o755 });

    writeWorkspaceConfig({
      preview: { max: 5, ttlMinutes: 60 },
      publish: {
        enabled: true,
        endpoint: "https://publish.example.test/upload",
        timeoutMs: 30000
      }
    });

    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const projectRoot = join(readProjectsRoot(), slug);
    writeFileSync(join(projectRoot, "dist.zip"), "fake-zip-content\n");

    const output = execFileSync("sh", [PROJECT_PUBLISH_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${fakeBin}:${process.env.PATH || ""}`,
        WEBGEN_TEST_CURL_ARGS_FILE: argsFile
      }
    });

    const publish = JSON.parse(execFileSync("cat", [join(projectRoot, ".webgen", "checks", "publish.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const curlArgs = existsSync(argsFile)
      ? execFileSync("cat", [argsFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
      : "";

    assert.match(output, /PUBLISH OK:/);
    assert.match(curlArgs, /https:\/\/publish\.example\.test\/upload/);
    assert.match(curlArgs, /file=@/);
    assert.doesNotMatch(curlArgs, /metadata=/);
    assert.match(curlArgs, /dist\.zip/);
    assert.equal(publish.status, "published");
    assert.equal(publish.remoteStatus, 201);
    assert.equal(publish.releaseId, null);
    assert.equal(publish.endpoint, "https://publish.example.test/upload");
    assert.equal(publish.publishedUrl, "https://publish.example.test/uploads/1718000000000_dist.zip");
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project publish falls back to async request when sync upload fails", () => {
  const slug = `publish-fallback-${Date.now()}`;
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    const fakeBin = mkdtempSync(join(tmpdir(), "webgen-fake-curl-fallback-"));
    const argsFile = join(fakeBin, "curl-args.txt");
    const countFile = join(fakeBin, "curl-count.txt");
    writeFileSync(join(fakeBin, "curl"), `#!/bin/sh
count=0
if [ -f "$WEBGEN_TEST_CURL_COUNT_FILE" ]; then
  count=$(cat "$WEBGEN_TEST_CURL_COUNT_FILE")
fi
count=$((count+1))
printf '%s' "$count" > "$WEBGEN_TEST_CURL_COUNT_FILE"
printf 'CALL-%s\n' "$count" >> "$WEBGEN_TEST_CURL_ARGS_FILE"
printf '%s\n' "$@" >> "$WEBGEN_TEST_CURL_ARGS_FILE"
if [ "$count" -eq 1 ]; then
  exit 22
fi
printf '%s' '{"status":"queued","jobId":"job_test","pollUrl":"https://example.test/queue/status/job_test","url":"https://example.test/queue"}'
`, { mode: 0o755 });

    writeWorkspaceConfig({
      preview: { max: 5, ttlMinutes: 60 },
      publish: {
        enabled: true,
        endpoint: "https://publish.example.test/upload",
        timeoutMs: 30000,
        fileField: "artifactFile",
        metadataField: "publishMeta",
        asyncFallback: true,
        asyncFlagField: "preferAsync",
        statusUrlField: "pollUrl"
      }
    });

    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const projectRoot = join(readProjectsRoot(), slug);
    writeFileSync(join(projectRoot, "dist.zip"), "fake-zip-content\n");

    const output = execFileSync("sh", [PROJECT_PUBLISH_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${fakeBin}:${process.env.PATH || ""}`,
        WEBGEN_TEST_CURL_ARGS_FILE: argsFile,
        WEBGEN_TEST_CURL_COUNT_FILE: countFile
      }
    });

    const publish = JSON.parse(execFileSync("cat", [join(projectRoot, ".webgen", "checks", "publish.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const curlArgs = existsSync(argsFile)
      ? execFileSync("cat", [argsFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
      : "";

    assert.match(output, /PUBLISH OK:/);
    assert.match(curlArgs, /CALL-1/);
    assert.match(curlArgs, /CALL-2/);
    assert.match(curlArgs, /preferAsync=true/);
    assert.equal(publish.status, "queued");
    assert.equal(publish.remoteStatus, 202);
    assert.equal(publish.jobId, "job_test");
    assert.equal(publish.pollUrl, "https://example.test/queue/status/job_test");
    assert.equal(publish.endpoint, "https://publish.example.test/upload");
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project publish status polls queued job and records published result", () => {
  const slug = `publish-status-${Date.now()}`;
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    const fakeBin = mkdtempSync(join(tmpdir(), "webgen-fake-curl-status-"));
    const argsFile = join(fakeBin, "curl-args.txt");
    writeFileSync(join(fakeBin, "curl"), `#!/bin/sh
printf '%s\n' "$@" > "$WEBGEN_TEST_CURL_ARGS_FILE"
printf '%s' '{"status":"published","releaseId":"rel_polled","url":"https://example.test/release/final"}'
`, { mode: 0o755 });

    writeWorkspaceConfig({
      preview: { max: 5, ttlMinutes: 60 },
      publish: {
        enabled: true,
        endpoint: "https://publish.example.test/upload",
        timeoutMs: 30000,
        statusUrlField: "pollUrl"
      }
    });

    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const projectRoot = join(readProjectsRoot(), slug);
    writeFileSync(join(projectRoot, ".webgen", "checks", "publish.json"), JSON.stringify({
      status: "queued",
      gate: "Pass",
      userConfirmed: true,
      artifact: join(projectRoot, "dist.zip"),
      artifactSha256: "abc",
      endpoint: "https://publish.example.test/upload",
      remoteStatus: 202,
      releaseId: null,
      jobId: "job_test",
      pollUrl: "https://example.test/queue/status/job_test",
      publishedUrl: null,
      checkedAt: new Date().toISOString(),
      publishedAt: null,
      notes: null
    }, null, 2) + "\n");

    const output = execFileSync("sh", [PROJECT_PUBLISH_STATUS_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${fakeBin}:${process.env.PATH || ""}`,
        WEBGEN_TEST_CURL_ARGS_FILE: argsFile
      }
    });

    const publish = JSON.parse(execFileSync("cat", [join(projectRoot, ".webgen", "checks", "publish.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const curlArgs = existsSync(argsFile)
      ? execFileSync("cat", [argsFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
      : "";

    assert.match(output, /PUBLISH STATUS OK:/);
    assert.match(curlArgs, /https:\/\/example\.test\/queue\/status\/job_test/);
    assert.equal(publish.status, "published");
    assert.equal(publish.remoteStatus, 200);
    assert.equal(publish.releaseId, "rel_polled");
    assert.equal(publish.publishedUrl, "https://example.test/release/final");
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project preview status defaults to compact lines", () => {
  const slug = `preview-status-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const result = spawnSync("sh", [PREVIEW_STATUS_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    const output = result.stdout;

    assert.match(output, /^preview: stopped$/m);
    assert.match(output, /^url: http:\/\/127\.0\.0\.1:\d+\/$/m);
    assert.match(output, /^http: unreachable$/m);
    assert.match(output, /^pid: none$/m);
    assert.equal(output.includes("Preview status:"), false);
    assert.equal(output.includes("Healthcheck:"), false);
    assert.equal(output.includes("Ready At:"), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project preview failure output stays compact when dev process exits early", () => {
  const slug = `preview-fail-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const result = spawnSync("sh", [PREVIEW_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        WEBGEN_PREVIEW_GATE: "0"
      }
    });
    const output = `${result.stdout}${result.stderr}`;

    assert.equal(result.status, 1);
    assert.match(output, /^preview: failed$/m);
    assert.match(output, /^reason: exited-before-ready$/m);
    assert.match(output, /^url: http:\/\/127\.0\.0\.1:\d+\/$/m);
    assert.match(output, /^log: .*\.webgen\/preview\.log$/m);
    assert.match(output, /^next: sh scripts\/project-preview-status\.sh .* --verbose$/m);
    assert.equal(output.includes("failed to load config from"), false);
    assert.equal(output.includes("ELIFECYCLE"), false);
    assert.equal(output.includes("tail -n 20"), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project design review skips cdp by default when screenshot review not requested", () => {
  const slug = `design-review-skip-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const output = execFileSync("sh", [DESIGN_REVIEW_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(output, /DESIGN REVIEW CDP SKIPPED: not-requested/);

    const reportFile = join(readProjectsRoot(), slug, ".webgen", "checks", "design-review-cdp.json");
    const report = JSON.parse(execFileSync("cat", [reportFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));

    assert.equal(report.status, "skipped");
    assert.equal(report.attempted, false);
    assert.equal(report.reason, "not-requested");
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("project design review attempts cdp once when requested and then skips retries after failure", () => {
  const slug = `design-review-once-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const configFile = join(readProjectsRoot(), slug, ".webgen", "config.json");
    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.review = { ...(data.review||{}), cdpScreenshotRequested: true };
      data.preview.healthcheck = "";
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, configFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const first = execFileSync("sh", [DESIGN_REVIEW_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(first, /DESIGN REVIEW CDP SKIPPED: preview-unavailable/);

    const reportFile = join(readProjectsRoot(), slug, ".webgen", "checks", "design-review-cdp.json");
    let report = JSON.parse(execFileSync("cat", [reportFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(report.status, "skipped");
    assert.equal(report.attempted, true);
    assert.equal(report.reason, "preview-unavailable");

    const second = execFileSync("sh", [DESIGN_REVIEW_SCRIPT, slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(second, /DESIGN REVIEW CDP SKIPPED: already-attempted/);

    report = JSON.parse(execFileSync("cat", [reportFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(report.status, "skipped");
    assert.equal(report.attempted, true);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("preview manager supports registry controls and respects pinned previews", () => {
  const keepSlug = `preview-keep-${Date.now()}`;
  const pinnedSlug = `preview-pin-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", keepSlug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("sh", ["scripts/project-init.sh", pinnedSlug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const keepRoot = join(readProjectsRoot(), keepSlug);
    const pinnedRoot = join(readProjectsRoot(), pinnedSlug);

    writeFileSync(join(keepRoot, ".webgen", "preview.pid"), `99991\n`);
    writeFileSync(join(pinnedRoot, ".webgen", "preview.pid"), `99992\n`);

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const now=new Date().toISOString();
      for (const file of process.argv.slice(1)) {
        const data=JSON.parse(fs.readFileSync(file,"utf8"));
        data.preview.port = (data.project.slug.includes("pin-") ? 4312 : 4311);
        data.preview.healthcheck = "http://127.0.0.1:" + data.preview.port + "/";
        data.preview.state = { ...(data.preview.state||{}), status:"running", pid:(data.project.slug.includes("pin-") ? 99992 : 99991), startedAt:now, readyAt:now, lastError:null };
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
      }
    `, join(keepRoot, ".webgen", "config.json"), join(pinnedRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const pinOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "pin", pinnedSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(pinOutput, /pinned:/);

    const listOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "list"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(listOutput, /PIN/);
    assert.match(listOutput, new RegExp(`${pinnedSlug}.*pinned`, "i"));

    const stopOthersOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "stop-others", keepSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(stopOthersOutput, /Kept running:/);

    const keepState = JSON.parse(execFileSync("cat", [join(keepRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const pinnedState = JSON.parse(execFileSync("cat", [join(pinnedRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));

    assert.equal(keepState.preview.state.status, "running");
    assert.equal(pinnedState.preview.state.status, "running");

    const unpinOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "unpin", pinnedSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(unpinOutput, /unpinned:/);

    const gcOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "gc"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(gcOutput, /GC/);

    const capacityOutput = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "ensure-capacity", keepSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(capacityOutput, /capacity:/);
  } finally {
    rmSync(join(readProjectsRoot(), keepSlug), { recursive: true, force: true });
    rmSync(join(readProjectsRoot(), pinnedSlug), { recursive: true, force: true });
  }
});

test("preview manager reads capacity limits from global config with env override", () => {
  const backup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    writeWorkspaceConfig({
      preview: {
        max: 3,
        ttlMinutes: 15
      }
    });

    const configured = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "limits"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(configured, /^preview-max: 3$/m);
    assert.match(configured, /^preview-ttl-minutes: 15$/m);

    const overridden = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "limits"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        WEBGEN_PREVIEW_MAX: "5",
        WEBGEN_PREVIEW_TTL_MINUTES: "25"
      }
    });
    assert.match(overridden, /^preview-max: 5$/m);
    assert.match(overridden, /^preview-ttl-minutes: 25$/m);
  } finally {
    if (backup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, backup);
    }
  }
});

test("workspace config ignores legacy webgen-config json fallback", () => {
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;
  const legacyBackup = existsSync(LEGACY_GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [LEGACY_GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    rmSync(GLOBAL_CONFIG_FILE, { force: true });
    writeFileSync(
      LEGACY_GLOBAL_CONFIG_FILE,
      JSON.stringify(
        {
          preview: {
            max: 99,
            ttlMinutes: 77
          }
        },
        null,
        2
      ) + "\n"
    );

    const limits = execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "limits"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(limits, /^preview-max: 8$/m);
    assert.match(limits, /^preview-ttl-minutes: 60$/m);
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }

    if (legacyBackup === null) {
      rmSync(LEGACY_GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(LEGACY_GLOBAL_CONFIG_FILE, legacyBackup);
    }
  }
});

test("workspace config resolves configurable projects root", () => {
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;
  const targetRoot = mkdtempSync(join(tmpdir(), "webgen-projects-root-"));

  try {
    writeWorkspaceConfig({
      paths: {
        projectsRoot: targetRoot
      }
    });

    const resolved = readProjectsRoot({ ...process.env, WEBGEN_PROJECTS_ROOT: "" });
    assert.equal(resolved, targetRoot);
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(targetRoot, { recursive: true, force: true });
  }
});

test("project init creates project under configured projects root", () => {
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;
  const targetRoot = mkdtempSync(join(tmpdir(), "webgen-projects-init-"));
  const slug = `configured-root-${Date.now()}`;

  try {
    writeWorkspaceConfig({
      paths: {
        projectsRoot: targetRoot
      }
    });

    const output = execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      env: { ...process.env, WEBGEN_PROJECTS_ROOT: "" },
      encoding: "utf8"
    });

    const projectRoot = join(targetRoot, slug);
    assert.match(output, new RegExp(`^project: ${escapeRegExp(projectRoot)}$`, "m"));
    assert.equal(existsSync(join(projectRoot, ".webgen", "config.json")), true);
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(targetRoot, { recursive: true, force: true });
  }
});

test("project guard resolves configured projects root", () => {
  const configBackup = existsSync(GLOBAL_CONFIG_FILE)
    ? execFileSync("cat", [GLOBAL_CONFIG_FILE], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;
  const targetRoot = mkdtempSync(join(tmpdir(), "webgen-projects-guard-"));
  const slug = `guard-root-${Date.now()}`;

  try {
    writeWorkspaceConfig({
      paths: {
        projectsRoot: targetRoot
      }
    });

    mkdirSync(join(targetRoot, slug), { recursive: true });

    const output = execFileSync("sh", ["scripts/project-guard.sh", slug], {
      cwd: WORKSPACE_ROOT,
      env: { ...process.env, WEBGEN_PROJECTS_ROOT: "" },
      encoding: "utf8"
    }).trim();

    assert.equal(output, join(targetRoot, slug));
  } finally {
    if (configBackup === null) {
      rmSync(GLOBAL_CONFIG_FILE, { force: true });
    } else {
      writeFileSync(GLOBAL_CONFIG_FILE, configBackup);
    }
    rmSync(targetRoot, { recursive: true, force: true });
  }
});

test("project preview enforces capacity by stopping stale unpinned previews before launch", () => {
  const oldSlug = `preview-old-${Date.now()}`;
  const recentSlug = `preview-recent-${Date.now()}`;
  const targetSlug = `preview-target-${Date.now()}`;
  const registryFile = join(WORKSPACE_ROOT, ".openclaw", "preview-registry.json");
  const registryBackup = existsSync(registryFile)
    ? execFileSync("cat", [registryFile], { cwd: WORKSPACE_ROOT, encoding: "utf8" })
    : null;

  try {
    for (const slug of [oldSlug, recentSlug, targetSlug]) {
      execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      });
    }

    const oldRoot = join(readProjectsRoot(), oldSlug);
    const recentRoot = join(readProjectsRoot(), recentSlug);

    writeFileSync(join(oldRoot, ".webgen", "preview.pid"), `99981\n`);
    writeFileSync(join(recentRoot, ".webgen", "preview.pid"), `99982\n`);

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const now=new Date().toISOString();
      for (const file of process.argv.slice(1)) {
        const data=JSON.parse(fs.readFileSync(file,"utf8"));
        data.preview.port = data.project.slug.includes("old-") ? 4411 : 4412;
        data.preview.healthcheck = "http://127.0.0.1:" + data.preview.port + "/";
        data.preview.state = { ...(data.preview.state||{}), status:"running", pid:(data.project.slug.includes("old-") ? 99981 : 99982), startedAt:now, readyAt:now, lastError:null };
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
      }
    `, join(oldRoot, ".webgen", "config.json"), join(recentRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "touch", oldSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "touch", recentSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const file=process.argv[1];
      const now=new Date().toISOString();
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.items = data.items.filter((item) => item.slug.includes("old-") || item.slug.includes("recent-")).map((item) => {
        if (item.slug.includes("old-")) item.lastSeenAt = "2026-01-01T00:00:00.000Z";
        if (item.slug.includes("recent-")) item.lastSeenAt = now;
        return item;
      });
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, registryFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const result = spawnSync("sh", [PREVIEW_SCRIPT, targetSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        WEBGEN_PREVIEW_GATE: "0",
        WEBGEN_PREVIEW_MAX: "1"
      }
    });

    assert.equal(result.status, 1);

    const oldState = JSON.parse(execFileSync("cat", [join(oldRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const recentState = JSON.parse(execFileSync("cat", [join(recentRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));

    assert.equal(oldState.preview.state.status, "stopped");
    assert.equal(recentState.preview.state.status, "running");
  } finally {
    if (registryBackup === null) {
      rmSync(registryFile, { force: true });
    } else {
      writeFileSync(registryFile, registryBackup);
    }
    rmSync(join(readProjectsRoot(), oldSlug), { recursive: true, force: true });
    rmSync(join(readProjectsRoot(), recentSlug), { recursive: true, force: true });
    rmSync(join(readProjectsRoot(), targetSlug), { recursive: true, force: true });
  }
});

test("project preview stop removes tracked preview entry", () => {
  const slug = `preview-stop-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const projectRoot = join(readProjectsRoot(), slug);
    writeFileSync(join(projectRoot, ".webgen", "preview.pid"), `99971\n`);

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const now=new Date().toISOString();
      const file=process.argv[1];
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.preview.port = 4511;
      data.preview.healthcheck = "http://127.0.0.1:4511/";
      data.preview.state = { ...(data.preview.state||{}), status:"running", pid:99971, startedAt:now, readyAt:now, lastError:null };
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, join(projectRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "touch", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const stopOutput = execFileSync("zsh", ["scripts/project-preview-stop.sh", slug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });
    assert.match(stopOutput, /Preview stopped/);

    const config = JSON.parse(execFileSync("cat", [join(projectRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(config.preview.state.status, "stopped");

    const registry = JSON.parse(execFileSync("cat", [join(WORKSPACE_ROOT, ".openclaw", "preview-registry.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    assert.equal(registry.items.some((item) => item.slug === slug), false);
  } finally {
    rmSync(join(readProjectsRoot(), slug), { recursive: true, force: true });
  }
});

test("workflow deliver stops other unpinned previews after delivery", () => {
  const keepSlug = `deliver-keep-${Date.now()}`;
  const stopSlug = `deliver-stop-${Date.now()}`;
  const pinnedSlug = `deliver-pin-${Date.now()}`;

  try {
    for (const slug of [keepSlug, stopSlug, pinnedSlug]) {
      execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      });
    }

    const keepRoot = join(readProjectsRoot(), keepSlug);
    const stopRoot = join(readProjectsRoot(), stopSlug);
    const pinnedRoot = join(readProjectsRoot(), pinnedSlug);

    for (const [root, port, pid] of [
      [keepRoot, 4611, 99961],
      [stopRoot, 4612, 99962],
      [pinnedRoot, 4613, 99963]
    ]) {
      writeFileSync(join(root, ".webgen", "preview.pid"), `${pid}\n`);
      execFileSync("node", ["-e", `
        const fs=require("fs");
        const now=new Date().toISOString();
        const file=process.argv[1];
        const port=Number(process.argv[2]);
        const pid=Number(process.argv[3]);
        const data=JSON.parse(fs.readFileSync(file,"utf8"));
        data.preview.port = port;
        data.preview.healthcheck = "http://127.0.0.1:" + port + "/";
        data.preview.state = { ...(data.preview.state||{}), status:"running", pid, startedAt:now, readyAt:now, lastError:null };
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
      `, join(root, ".webgen", "config.json"), String(port), String(pid)], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      });
    }

    for (const slug of [keepSlug, stopSlug, pinnedSlug]) {
      execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "touch", slug], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      });
    }
    execFileSync("zsh", [PREVIEW_MANAGER_SCRIPT, "pin", pinnedSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("node", ["-e", `
      const fs=require("fs");
      const stateFile=process.argv[1];
      const verifyFile=process.argv[2];
      const reviewFile=process.argv[3];
      const state=JSON.parse(fs.readFileSync(stateFile,"utf8"));
      state.currentStage = "design-review";
      state.gates = { ...(state.gates||{}), proposal:"Pass", verification:"Pass", designReview:"Pass" };
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\\n");
      fs.writeFileSync(verifyFile, JSON.stringify({ status:"passed", checkedAt:new Date().toISOString(), items:{}, commands:[], notes:"ok" }, null, 2) + "\\n");
      fs.writeFileSync(reviewFile, JSON.stringify({ status:"passed", checkedAt:new Date().toISOString(), notes:"ok" }, null, 2) + "\\n");
    `, join(keepRoot, ".webgen", "workflow-state.json"), join(keepRoot, ".webgen", "checks", "verification.json"), join(keepRoot, ".webgen", "checks", "design-review.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    execFileSync("sh", ["scripts/workflow-deliver.sh", keepSlug], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const keepConfig = JSON.parse(execFileSync("cat", [join(keepRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const stopConfig = JSON.parse(execFileSync("cat", [join(stopRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));
    const pinnedConfig = JSON.parse(execFileSync("cat", [join(pinnedRoot, ".webgen", "config.json")], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    }));

    assert.equal(keepConfig.preview.state.status, "running");
    assert.equal(stopConfig.preview.state.status, "stopped");
    assert.equal(pinnedConfig.preview.state.status, "running");
  } finally {
    rmSync(join(readProjectsRoot(), keepSlug), { recursive: true, force: true });
    rmSync(join(readProjectsRoot(), stopSlug), { recursive: true, force: true });
    rmSync(join(readProjectsRoot(), pinnedSlug), { recursive: true, force: true });
  }
});

test("routing message templates include explicit project session entry command", () => {
  const content = execFileSync("sed", ["-n", "1,120p", ROUTING_TEMPLATE_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });

  assert.match(content, /项目 session 入场命令/);
  assert.match(content, /project-session-entry\.sh <slug> <sessionKey> new vite-page/);
  assert.match(content, /project-session-entry\.sh <slug> <sessionKey> resume:<slug>/);
  assert.match(content, /discovery-gap/);
  assert.match(content, /一次补齐/);
});

test("error handling and sop docs use project session entry as default entrypoint", () => {
  const errorHandling = execFileSync("sed", ["-n", "120,220p", ERROR_HANDLING_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });
  const sop = execFileSync("sed", ["-n", "70,120p", SOP_GATES_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });

  assert.match(errorHandling, /project-session-entry\.sh/);
  assert.match(sop, /project-session-entry\.sh/);
});

test("secondary docs mention project session entry command", () => {
  const changeLog = execFileSync("sed", ["-n", "60,120p", CHANGE_LOG_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });
  const designHardChecks = execFileSync("sed", ["-n", "1,120p", DESIGN_HARD_CHECKS_FILE], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });

  assert.match(changeLog, /project-session-entry\.sh/);
  assert.match(designHardChecks, /project-session-entry\.sh/);
});

test("agents context rules avoid clear and prefer summary-first recovery", () => {
  const agents = execFileSync("sed", ["-n", "1,260p", join(WORKSPACE_ROOT, "AGENTS.md")], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });

  assert.equal(agents.includes("执行 `/clear`命令清空上下文"), false);
  assert.match(agents, /\.webgen\/context-summary\.txt/);
  assert.match(agents, /discovery-gap/);
});
