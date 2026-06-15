# Webgen Superpowers Governance Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 强化 `AGENTS.md`，把 `superpowers` 从“复杂需求默认使用”升级为所有任务的强制流程。

**Architecture:** 仅修改 agent 规范文档，不改运行脚本。通过在工作原则、SOP、违规处理和交付自检中增加硬门槛，固定 `using-superpowers -> brainstorming -> writing-plans -> executing-plans/subagent-driven-development -> verification-before-completion` 流程。

**Tech Stack:** Markdown, AGENTS governance

---

### Task 1: 固化 superpowers 工作流

**Files:**
- Create: `docs/plans/2026-06-15-webgen-superpowers-governance.md`
- Modify: `AGENTS.md`

**Step 1: 写入计划文档**

把本计划保存到 `docs/plans/2026-06-15-webgen-superpowers-governance.md`，作为本次规则调整的执行依据。

**Step 2: 强化工作原则**

在 `AGENTS.md` 的“工作原则”里加入强制要求：
- 每轮任务先走 `superpowers:using-superpowers`
- 创意/页面/行为修改类任务先走 `superpowers:brainstorming`
- 多步骤执行前先走 `superpowers:writing-plans`
- 交付前走 `superpowers:verification-before-completion`

**Step 3: 新增 SOP 硬门**

在 `AGENTS.md` 的 SOP 段落前部新增 `SO-000`，把 superpowers 固定为所有任务的总控门，并定义允许的执行分叉：
- 小任务也不能跳过 skill 判断
- 创意和实现前必须先方案确认
- 进入执行必须基于 plan
- 执行后必须验证

**Step 4: 补齐违规与交付校验**

在违规处理和最终交付自检门里新增：
- 跳过 superpowers 流程属于不合规
- 交付前需确认已经按要求完成 brainstorming / plan / verification

**Step 5: 运行文档校验**

运行命令确认新规则已写入：
- `rg -n "superpowers:using-superpowers|SO-000|verification-before-completion|writing-plans" AGENTS.md docs/plans/2026-06-15-webgen-superpowers-governance.md`
- `sed -n '1,220p' AGENTS.md`

**Step 6: 总结变更**

基于实际 diff 和校验结果汇总变更，不做未验证声明。
