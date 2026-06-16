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
const PREVIEW_MANAGER_SCRIPT = join(WORKSPACE_ROOT, "scripts/preview-manager.sh");
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

    const keepRoot = join(WORKSPACE_ROOT, "projects", keepSlug);
    const pinnedRoot = join(WORKSPACE_ROOT, "projects", pinnedSlug);

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
    rmSync(join(WORKSPACE_ROOT, "projects", keepSlug), { recursive: true, force: true });
    rmSync(join(WORKSPACE_ROOT, "projects", pinnedSlug), { recursive: true, force: true });
  }
});

test("project preview enforces capacity by stopping stale unpinned previews before launch", () => {
  const oldSlug = `preview-old-${Date.now()}`;
  const recentSlug = `preview-recent-${Date.now()}`;
  const targetSlug = `preview-target-${Date.now()}`;

  try {
    for (const slug of [oldSlug, recentSlug, targetSlug]) {
      execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
        cwd: WORKSPACE_ROOT,
        encoding: "utf8"
      });
    }

    const oldRoot = join(WORKSPACE_ROOT, "projects", oldSlug);
    const recentRoot = join(WORKSPACE_ROOT, "projects", recentSlug);

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
      const data=JSON.parse(fs.readFileSync(file,"utf8"));
      data.items = data.items.map((item) => {
        if (item.slug.includes("old-")) item.lastSeenAt = "2026-01-01T00:00:00.000Z";
        if (item.slug.includes("recent-")) item.lastSeenAt = "2026-06-16T00:00:00.000Z";
        return item;
      });
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\\n");
    `, join(WORKSPACE_ROOT, ".openclaw", "preview-registry.json")], {
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
    rmSync(join(WORKSPACE_ROOT, "projects", oldSlug), { recursive: true, force: true });
    rmSync(join(WORKSPACE_ROOT, "projects", recentSlug), { recursive: true, force: true });
    rmSync(join(WORKSPACE_ROOT, "projects", targetSlug), { recursive: true, force: true });
  }
});

test("project preview stop removes tracked preview entry", () => {
  const slug = `preview-stop-${Date.now()}`;

  try {
    execFileSync("sh", ["scripts/project-init.sh", slug, "vite-page"], {
      cwd: WORKSPACE_ROOT,
      encoding: "utf8"
    });

    const projectRoot = join(WORKSPACE_ROOT, "projects", slug);
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
    rmSync(join(WORKSPACE_ROOT, "projects", slug), { recursive: true, force: true });
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

    const keepRoot = join(WORKSPACE_ROOT, "projects", keepSlug);
    const stopRoot = join(WORKSPACE_ROOT, "projects", stopSlug);
    const pinnedRoot = join(WORKSPACE_ROOT, "projects", pinnedSlug);

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
    rmSync(join(WORKSPACE_ROOT, "projects", keepSlug), { recursive: true, force: true });
    rmSync(join(WORKSPACE_ROOT, "projects", stopSlug), { recursive: true, force: true });
    rmSync(join(WORKSPACE_ROOT, "projects", pinnedSlug), { recursive: true, force: true });
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
