# Webgen Superpowers Propagation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 `superpowers` 主流程继续下沉到 `webgen` 调用入口文档和 session 路由协议文档，避免入口与主规范脱节。

**Architecture:** 仅修改文档，不改脚本实现。通过补齐调用方 SOP、消息字段、执行顺序和返回要求，让 `skills/webgen/SKILL.md` 与 `docs/session-routing-and-project-commands.md` 明确要求 `using-superpowers -> brainstorming -> writing-plans -> verification-before-completion`。

**Tech Stack:** Markdown, governance docs

---

### Task 1: 同步入口与协议文档

**Files:**
- Create: `docs/plans/2026-06-15-webgen-superpowers-propagation.md`
- Modify: `skills/webgen/SKILL.md`
- Modify: `docs/session-routing-and-project-commands.md`
- Modify: `docs/webgen-skill-change-log.md`

**Step 1: 写入计划文档**

保存当前实施计划，作为本轮文档治理依据。

**Step 2: 强化调用方 skill 入口**

在 `skills/webgen/SKILL.md` 中补充：
- 调用方也必须先遵守 `superpowers:using-superpowers`
- 发送给 `webgen` 的消息必须包含 `superpowers 要求`
- `webgen` 返回结果中需说明是否完成 brainstorming / plan / verification

**Step 3: 强化脚本协议文档**

在 `docs/session-routing-and-project-commands.md` 中补充：
- 调度 session 和项目 session 的职责里加入 `superpowers` 主流程
- new / resume 协议示例补 `superpowers 要求`
- 项目 session 执行顺序里加入 brainstorming / writing-plans / verification-before-completion

**Step 4: 记录变更**

在 `docs/webgen-skill-change-log.md` 记录本次下沉范围和目标。

**Step 5: 运行校验**

运行以下命令确认文档已同步：
- `rg -n "superpowers|using-superpowers|brainstorming|writing-plans|verification-before-completion" skills/webgen/SKILL.md docs/session-routing-and-project-commands.md docs/webgen-skill-change-log.md`
- `sed -n '1,260p' skills/webgen/SKILL.md`
- `sed -n '1,260p' docs/session-routing-and-project-commands.md`

**Step 6: 基于 diff 汇报**

仅基于实际 diff 与校验输出汇报结果，不做未验证声明。
