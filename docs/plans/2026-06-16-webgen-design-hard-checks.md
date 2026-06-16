# WebGen Design Hard Checks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把“首屏焦点、证明区、内容节奏、CTA 收口、H5 首屏优先级”变成页面生成前的硬检查，而不是仅停留在设计文档说明。

**Architecture:** 保持当前最小 workflow 模型不扩阶段，只增强 `DISCOVERY.md` 的结构约束与 `workflow-check.sh` 的前置校验。同步模板文档和索引文档，让调用方和项目 session 都看到同一套生成前硬检查要求；项目 session 的默认入场动作统一由 `project-session-entry.sh` 承接。

**Tech Stack:** Shell, Node.js, Markdown, Vite template docs

---

### Task 1: 扩充 Discovery 前置硬检查

**Files:**
- Modify: `scripts/workflow-check.sh`
- Modify: `templates/vite-page/post-init/DISCOVERY.md.tpl`

**Step 1: 补齐 Discovery 必填区块**

要求 `DISCOVERY.md` 必须包含：
- `## 审版检查点`
- 首屏焦点
- 证明区策略
- 内容节奏
- CTA 收口方式
- H5 首屏优先级

**Step 2: 调整 workflow-check 的结构校验**

在 `check_discovery_ready_content()` 中新增区块存在性校验，避免只有 `Design Read` 没有审版结论也能开工。

**Step 3: 保持轻量，不做逐字匹配**

只检查区块和关键字段存在，不检查文案内容是否完全一致，避免重新掉回过严治理。

### Task 2: 同步模板与设计文档

**Files:**
- Modify: `templates/vite-page/TEMPLATE.md`
- Modify: `docs/webgen-design-guide.md`
- Modify: `docs/webgen-design-cheatsheet.md`

**Step 1: 模板文档写清“生成前硬检查”**

在 `TEMPLATE.md` 中明确这 5 项是写页面前必须落到 `DISCOVERY.md` 的内容。

**Step 2: 设计指南写清“硬检查不等于模板设计”**

在 `webgen-design-guide.md` 里补一句：提升设计质量依靠生成前结构判断和审版问题，而不是模板默认视觉。

**Step 3: 速查文档同步**

在 `webgen-design-cheatsheet.md` 中把这 5 项升级成开工前检查清单。

### Task 3: 同步运维索引与入口说明

**Files:**
- Modify: `docs/webgen-ops-index.md`

**Step 1: 补索引**

在设计入口和工作流条目里明确：
- 进入实现前要完成 `Design Read`
- 要完成老板审版五问
- 项目 session 默认先走 `project-session-entry.sh`
- workflow-check 会校验这些项

### Task 4: 验证

**Files:**
- Modify: `scripts/workflow-check.sh`

**Step 1: 语法校验**

Run: `sh -n scripts/workflow-check.sh`
Expected: 无输出

**Step 2: 构建校验模板**

Run: `pnpm build`
Expected: 构建通过

**Step 3: 结果检查**

确认：
- 模板文档已写明硬检查
- `workflow-check.sh` 已阻止缺少审版检查点的项目直接进入实现
