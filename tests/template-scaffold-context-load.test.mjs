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
const SYNC_DOCS_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-sync-docs.sh");
const RESUME_CONTEXT_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-resume-context.sh");
const SESSION_ENTRY_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-session-entry.sh");
const WORKFLOW_REPORT_SCRIPT = join(WORKSPACE_ROOT, "scripts/workflow-report.sh");
const PREVIEW_STATUS_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-preview-status.sh");
const PREVIEW_SCRIPT = join(WORKSPACE_ROOT, "scripts/project-preview.sh");
const ROUTING_TEMPLATE_FILE = join(WORKSPACE_ROOT, "docs", "webgen-routing-message-templates.md");
const ERROR_HANDLING_FILE = join(WORKSPACE_ROOT, "docs", "webgen-session-error-handling.md");
const SOP_GATES_FILE = join(WORKSPACE_ROOT, "docs", "webgen-sop-and-gates.md");
const CHANGE_LOG_FILE = join(WORKSPACE_ROOT, "docs", "webgen-skill-change-log.md");
const DESIGN_HARD_CHECKS_FILE = join(WORKSPACE_ROOT, "docs", "plans", "2026-06-16-webgen-design-hard-checks.md");

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

    const slug = "context-sync-test";
    const projectRoot = join(WORKSPACE_ROOT, "projects", slug);
    execFileSync("mkdir", ["-p", projectRoot], { cwd: WORKSPACE_ROOT });
    execFileSync("cp", ["-R", `${root}/.`, projectRoot], { cwd: WORKSPACE_ROOT });

    execFileSync("sh", [SYNC_DOCS_SCRIPT, slug, "同步测试"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const summaryFile = join(projectRoot, ".webgen", "context-summary.txt");
    assert.equal(existsSync(summaryFile), true, "missing context summary artifact");

    const summary = execFileSync("sed", ["-n", "1,80p", summaryFile], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    assert.match(summary, /stage: implementation/);
    assert.match(summary, /proposal: Pass/);
    assert.match(summary, /discovery: Ready/);

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

    assert.match(output, /^project: .*projects\/context-scope-/m);
    assert.equal(output.includes("SCAFFOLD VERIFY OK"), false);
    assert.equal(output.includes("WORKFLOW INIT OK"), false);

    const scopeFile = join(WORKSPACE_ROOT, "projects", slug, ".webgen", "write-scope.json");
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
      JSON.stringify(scope.stages.implementation || []),
      /\.webgen\/context-summary\.txt/
    );
  } finally {
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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

    assert.match(output, /^project: .*projects\/resume-context-/m);
    assert.match(output, /^stage: discovery$/m);
    assert.match(output, /^discovery: Not Ready$/m);
    assert.match(output, /^next: .*\.webgen\/context-summary\.txt.*DISCOVERY\.md/m);
    assert.equal(output.includes("suggested:"), false);
  } finally {
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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

    const lockFile = join(WORKSPACE_ROOT, "projects", slug, ".webgen", "session-lock.json");
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
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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

    assert.match(output, /^project: .*projects\/workflow-report-/m);
    assert.match(output, /^stage: discovery$/m);
    assert.match(output, /^approval: pending$/m);
    assert.match(output, /^verification: pending$/m);
    assert.match(output, /^design-review: pending$/m);
    assert.match(output, /^gates: route=Pass session=Pending proposal=Pending implementation=Pending verification=Pending designReview=Pending$/m);
    assert.match(output, /^next: /m);
    assert.equal(output.includes("# Workflow Report"), false);
    assert.equal(output.includes("## Gates"), false);
    assert.equal(output.includes("## Next Steps"), false);
  } finally {
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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
