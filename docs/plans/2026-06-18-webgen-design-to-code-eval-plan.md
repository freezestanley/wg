# Webgen Design To Code Eval Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `skills/webgen-design-to-code` 设计第一轮技能评测，验证它是否稳定输出设计摘要、文件拆分计划与验证清单，并且不越界到 workflow / preview / publish。

**Architecture:** 采用 `with-skill` 对比 `without-skill` 的基础评测。先用 `evals/evals.json` 中的 3 条 prompt 跑一轮，再按 `skills/webgen-design-to-code/evals/assertions.md` 做人工或半自动判定。

**Tech Stack:** Skill evals、Markdown rubric、JSON prompts

---

### Task 1: 准备第一轮评测输入

**Files:**
- Use: `skills/webgen-design-to-code/evals/evals.json`

**Step 1: 读取 3 条 eval prompt**

- 冲浪板品牌 landing page
- 作品集首页重设计
- SaaS 官网首页升级

**Step 2: 确认评测边界**

- 只看设计到代码输出
- 不看最终页面视觉成品

### Task 2: 准备断言 rubric

**Files:**
- Use: `skills/webgen-design-to-code/evals/assertions.md`

**Step 1: 应用通用断言**

- 输出结构完整
- Design Read 完整
- 文件拆分存在
- 响应式策略存在
- 状态补齐存在
- 不越界

**Step 2: 应用逐题强化断言**

- Eval 1：看叙事滚动与移动端降级
- Eval 2：看边界控制
- Eval 3：看状态补齐

### Task 3: 跑第一轮对比

**Files:**
- Read: `skills/webgen-design-to-code/SKILL.md`

**Step 1: 跑 with-skill**

- 对每条 prompt 使用 skill

**Step 2: 跑 without-skill**

- 对相同 prompt 不使用 skill

**Step 3: 对比**

- 看结构是否更稳定
- 看是否更少越界
- 看是否更稳定地产出文件拆分方案

### Task 4: 记录第一轮结果

**Files:**
- Create later: `skills/webgen-design-to-code-workspace/iteration-1/...`

**Step 1: 保存输出**

- 保存 with-skill / without-skill 结果

**Step 2: 保存 grading**

- 按断言记录 passed / failed / evidence

**Step 3: 决定下一轮优化方向**

- 若越界多：强化边界描述
- 若拆分弱：强化 `page-splitting.md`
- 若 Design Read 丢失：强化输出契约
