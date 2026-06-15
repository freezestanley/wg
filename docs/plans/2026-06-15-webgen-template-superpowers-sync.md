# Webgen Template Superpowers Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 `superpowers` 主流程继续同步到 `vite-page` 模板文档和模板元信息，避免模板层落后于主规范。

**Architecture:** 仅调整模板说明与模板元数据，不改脚手架代码。通过更新 `templates/vite-page/TEMPLATE.md` 与 `templates/vite-page/template.json`，让模板层明确 `using-superpowers -> brainstorming -> writing-plans -> executing-plans/subagent-driven-development -> verification-before-completion`。

**Tech Stack:** Markdown, JSON metadata

---

### Task 1: 同步模板层 superpowers 主流程

**Files:**
- Create: `docs/plans/2026-06-15-webgen-template-superpowers-sync.md`
- Modify: `templates/vite-page/TEMPLATE.md`
- Modify: `templates/vite-page/template.json`
- Modify: `docs/webgen-skill-change-log.md`

**Step 1: 写入计划文档**

保存当前计划，作为模板层治理依据。

**Step 2: 更新模板说明**

在 `templates/vite-page/TEMPLATE.md` 中把“复杂需求才走 superpowers”升级为“所有任务先过 superpowers 总控门”，并明确模板使用顺序。

**Step 3: 更新模板元信息**

在 `templates/vite-page/template.json` 中补齐与 `superpowers` 主流程一致的默认技能。

**Step 4: 更新变更记录**

在 `docs/webgen-skill-change-log.md` 记录模板层同步结果。

**Step 5: 运行校验**

运行以下命令确认已同步：
- `rg -n "superpowers|using-superpowers|writing-plans|verification-before-completion|executing-plans|subagent-driven-development" templates/vite-page/TEMPLATE.md templates/vite-page/template.json docs/webgen-skill-change-log.md`
- `sed -n '1,220p' templates/vite-page/TEMPLATE.md`
- `sed -n '1,120p' templates/vite-page/template.json`

**Step 6: 基于证据汇报**

只根据 grep、diff 和文件内容汇报，不做未验证声明。
