# Context Compaction Outputs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 webgen 的最小上下文恢复规则固化到脚本输出，减少调度消息、长文档、整段代码和日志被重复带回 session。

**Architecture:** 以现有 `.webgen/context-summary.txt` 和 `project-resume-context.sh` 为核心，不新增重型状态文件，只增强摘要字段和 compact 交接字段。测试先定义 `focus / avoid / carry / drop` 的期望输出，再做脚本最小改动，保持现有阶段 / gate 兼容。

**Tech Stack:** Node.js 脚本、POSIX shell、现有 `node:test` 测试集

---

### Task 1: 定义摘要最小输出

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`
- Modify: `scripts/project-context-summary.mjs`

**Step 1: Write the failing test**

为 `project-context-summary.mjs` 增加断言：
- implementation 阶段输出 `focus: src/generated/page.js, src/styles.css`
- 输出 `avoid:`，明确不要重复装载 `DISCOVERY.md` 全文、长日志、无关 runtime/API 文件

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: 相关 summary 断言失败

**Step 3: Write minimal implementation**

在 `scripts/project-context-summary.mjs` 中按 stage 生成固定的 `focus` 和 `avoid` 行。

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: summary 相关断言通过

### Task 2: 收紧 resume 与 compact 交接输出

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`
- Modify: `scripts/project-resume-context.sh`
- Modify: `scripts/workflow-inspect-compact-request.sh`

**Step 1: Write the failing test**

为两个脚本增加断言：
- `project-resume-context.sh` 输出 `focus:` 和 `avoid:`
- `workflow-inspect-compact-request.sh` 输出 `carry:` 和 `drop:`

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: resume / compact inspect 新断言失败

**Step 3: Write minimal implementation**

让 resume 脚本透传摘要中的 `focus / avoid`，让 compact inspect 只输出应携带的摘要文件和应丢弃的大类上下文。

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: resume / compact inspect 断言通过

### Task 3: 验证不回退为长输出

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

补一组保护断言：
- 输出中仍不应出现 `PROJECT.md` / `HANDOFF.md` 的默认建议
- compact inspect 仍保持单屏短输出

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: 保护断言失败或缺失

**Step 3: Write minimal implementation**

仅在必要脚本中补短字段，不引入 verbose 模式外的长段说明。

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: 所有聚焦测试通过
