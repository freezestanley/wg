# Webgen Design To Code Skill Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 webgen 中“设计到生成代码”的稳定流程抽成一个独立 skill，同时保留 session、workflow、preview、publish 在主流程内。

**Architecture:** 新 skill 只消费最小上下文摘要，输出固定的设计实现摘要、文件拆分计划和验证清单。具体规则拆到 references 中，避免 `SKILL.md` 过重，并把评测 prompt 单独放入 `evals/evals.json`。

**Tech Stack:** Markdown skill、reference 文档、JSON evals

---

### Task 1: 建立 skill 目录与主说明

**Files:**
- Create: `skills/webgen-design-to-code/SKILL.md`

**Step 1: 写主 skill 草案**

- 定义触发条件
- 明确边界：只负责设计到代码
- 规定输入、流程、输出格式、硬约束

**Step 2: 自检说明是否过大**

- 检查是否有过多 workflow / publish / session 内容
- 若有，删掉，只保留设计到代码

### Task 2: 拆分参考文档

**Files:**
- Create: `skills/webgen-design-to-code/references/design-read.md`
- Create: `skills/webgen-design-to-code/references/page-splitting.md`
- Create: `skills/webgen-design-to-code/references/responsive-policy.md`
- Create: `skills/webgen-design-to-code/references/code-output-contract.md`

**Step 1: 写设计档位参考**

- 定义 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY / Atmosphere Layer`

**Step 2: 写页面拆分规则**

- 明确 section / component / style / module 拆分约束

**Step 3: 写响应式规则**

- 覆盖 `PC / Pad / H5`
- 明确触控、Pad、hover 替代与动效降级

**Step 4: 写输出契约**

- 固定 skill 最终输出格式

### Task 3: 补评测样例

**Files:**
- Create: `skills/webgen-design-to-code/evals/evals.json`

**Step 1: 写 2~3 条真实 prompt**

- 一条品牌 landing page
- 一条重设计页
- 一条含状态补齐的官网页

**Step 2: 检查预期结果描述**

- 确保可用于后续技能评测

### Task 4: 记录实施计划

**Files:**
- Create: `docs/plans/2026-06-18-webgen-design-to-code-skill.md`

**Step 1: 保存当前计划**

- 记录目标、边界、任务拆分

**Step 2: 准备后续执行**

- 供后续继续迭代与做 eval 使用
