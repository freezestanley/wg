# Publish Signal Output Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前发布执行动作从 HTTP 上传改为输出单行发布信号字符串，并把 `dist.zip` 的绝对路径作为核心 payload。

**Architecture:** 保留现有 `Publish Gate` 和 `workflow-record-publish.sh` 的阶段与 gate 语义，只替换 `project-publish.sh` 的执行细节。新实现负责确保 `dist.zip` 存在、计算 sha256、输出标准信号字符串，并将 `.webgen/checks/publish.json` 写为 `queued`。

**Tech Stack:** POSIX shell、Node.js、node:test

---

### Task 1: 先改测试为信号模式

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

- 把现有发布测试改为断言：
  - `project-publish.sh` 输出 `WEBGEN_PUBLISH|...`
  - `publish.json.status = queued`
  - `artifact` 为 `dist.zip` 绝对路径

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs --test-name-pattern 'project publish'`

Expected: FAIL，因为当前实现仍是 HTTP 上传

**Step 3: Write minimal implementation**

- 修改 `project-publish.sh`

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs --test-name-pattern 'project publish'`

Expected: PASS

### Task 2: 切换发布执行层

**Files:**
- Modify: `scripts/project-publish.sh`
- Modify: `docs/webgen-sop-and-gates.md`
- Modify: `docs/session-routing-and-project-commands.md`

**Step 1: Replace HTTP upload**

- 删除对 `publish.endpoint`、`curl`、远端响应解析的依赖
- 改为输出：
  `WEBGEN_PUBLISH|slug=<slug>|distZipFilepath=<abs-path>|sha256=<sha256>|sentAt=<iso>`

**Step 2: Keep workflow contract**

- 继续写 `.webgen/checks/publish.json`
- 状态写成 `queued`
- 让 `workflow-record-publish.sh` 维持 `Publish Gate = Pass`

**Step 3: Verify**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: 全量通过
