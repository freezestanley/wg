# WebGen Context Load Reduction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 降低 webgen 在项目生成与 Gate 检查阶段的上下文占用，减少模板重资产、目录输出和重复整篇文档读取。

**Architecture:** 通过模板瘦身、manifest 化校验、轻量状态摘要三个点做最小侵入改造，不改变现有 workflow / gate 的状态机，只减少高体积输入和重复读取路径。

**Tech Stack:** Shell、Node.js、node:test、Vite 模板文件

---

### Task 1: 补设计文档与计划

**Files:**
- Create: `docs/plans/2026-06-16-webgen-context-load-design.md`
- Create: `docs/plans/2026-06-16-webgen-context-load.md`

**Step 1: 写设计文档**

记录根因、目标、方案、风险和验证标准。

**Step 2: 写实现计划**

把测试、实现、验证拆成独立小步骤。

### Task 2: 先写失败测试

**Files:**
- Create: `tests/template-scaffold-context-load.test.mjs`

**Step 1: 写 manifest 约束测试**

断言模板必须文件存在，且 manifest 中不允许出现：

- `node_modules`
- `dist/`
- `.webgen/artifacts`
- `dist.zip`

**Step 2: 写摘要脚本测试**

为一个临时项目创建最小 `DISCOVERY.md` 与 `.webgen/workflow-state.json`，断言摘要输出包含：

- stage
- gates
- discovery readiness

**Step 3: 运行测试并确认先失败**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: FAIL，因为 manifest 和摘要脚本此时还不存在。

### Task 3: 实现模板瘦身与 manifest 校验

**Files:**
- Create: `templates/vite-page/scaffold-manifest.txt`
- Modify: `scripts/project-verify-scaffold.sh`
- Delete: `templates/vite-page/scaffold/node_modules/**`
- Delete: `templates/vite-page/scaffold/dist/**`
- Delete: `templates/vite-page/scaffold/.webgen/artifacts/**`
- Delete: `templates/vite-page/scaffold/.webgen/checks/design-review-cdp.json`
- Delete: `templates/vite-page/scaffold/dist.zip`

**Step 1: 生成最小 manifest**

只记录新项目真正需要的骨架文件。

**Step 2: 修改校验脚本**

优先按 manifest 校验；若 manifest 缺失，再回退现有目录遍历逻辑。

**Step 3: 删除模板重资产**

保留最小运行集合。

### Task 4: 实现轻量摘要脚本

**Files:**
- Create: `scripts/project-context-summary.mjs`

**Step 1: 从 `DISCOVERY.md` 提取 Ready 状态和关键缺失项**

输出短文本，不输出全文。

**Step 2: 从 `.webgen/workflow-state.json` 提取阶段和 Gate**

输出单行或短块摘要。

**Step 3: 控制输出长度**

只保留对下一步决策必要的信息。

### Task 5: 绿色验证

**Files:**
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: 重跑新增测试**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: PASS

**Step 2: 运行相关既有测试**

Run: `node --test tests/cdp-design-review.test.mjs tests/page-design-guard.test.mjs`

Expected: PASS

**Step 3: 做一次脚本级 smoke check**

Run: `sh scripts/project-verify-scaffold.sh <fixture-slug> vite-page`

Expected: 在轻量骨架项目上通过。
