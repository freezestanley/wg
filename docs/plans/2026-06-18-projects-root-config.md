# Projects Root Config Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 webgen 的项目根目录支持通过 `config.js` 配置，并将现有项目从 `workspace/projects` 迁移到 `~/claw-workspace`。

**Architecture:** 新增统一路径解析层 `scripts/webgen-paths.sh`，所有脚本从该层读取项目根目录，避免继续散落硬编码。再通过迁移脚本把历史项目整体移动到新目录，最后用测试验证默认回退和新路径行为。

**Tech Stack:** POSIX shell、Node.js、node:test

---

### Task 1: 补路径配置测试

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

- 增加 `paths.projectsRoot` 配置后的测试，覆盖：
  - `scripts/webgen-paths.sh projects-root`
  - `scripts/project-init.sh`
  - `scripts/project-guard.sh`

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: FAIL，提示缺少 `webgen-paths.sh` 或脚本仍写死 `workspace/projects`

**Step 3: Write minimal implementation**

- 新增 `scripts/webgen-paths.sh`
- 将以上脚本改为通过路径层取项目根

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: PASS

### Task 2: 改造核心脚本

**Files:**
- Create: `scripts/webgen-paths.sh`
- Create: `scripts/projects-root-migrate.sh`
- Modify: `scripts/project-init.sh`
- Modify: `scripts/session-lock.sh`
- Modify: `scripts/session-route.sh`
- Modify: `scripts/session-recover.sh`
- Modify: `scripts/project-guard.sh`
- Modify: `scripts/project-verify-scaffold.sh`
- Modify: `scripts/preview-manager.sh`
- Modify: `scripts/workflow-*.sh`
- Modify: `scripts/workflow-deliver.sh`
- Modify: `config.js`

**Step 1: Write the failing test**

- 保持 Task 1 新增测试为红灯

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: FAIL

**Step 3: Write minimal implementation**

- 新增统一路径层
- 替换所有 `PROJECTS_ROOT="$WORKSPACE_ROOT/projects"` 与同类硬编码
- `config.js` 增加 `paths.projectsRoot`

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: PASS

### Task 3: 实际迁移现有项目

**Files:**
- Use: `scripts/projects-root-migrate.sh`

**Step 1: 准备迁移**

- 停止运行中的 preview
- 创建目标目录 `~/claw-workspace`

**Step 2: 执行迁移**

Run: `sh scripts/projects-root-migrate.sh /old/projects/root ~/claw-workspace`

Expected: 每个 slug 输出迁移结果

**Step 3: 更新配置**

- 将 `config.js` 中 `paths.projectsRoot` 指向 `~/claw-workspace`

**Step 4: 运行校验**

Run:
- `node --test tests/template-scaffold-context-load.test.mjs`
- `zsh scripts/preview-manager.sh list`

Expected: 测试通过，脚本能在新目录列出项目
