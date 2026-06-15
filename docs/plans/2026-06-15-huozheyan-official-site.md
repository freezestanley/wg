# 火遮眼宣传官网 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 2026 版电影《火遮眼》完成一个可运行、可预览、可交付的一页式中文宣传官网首版。

**Architecture:** 基于 `vite-page` 模板，用原生 HTML/CSS/JS 在 `src/generated/page.js` 输出完整页面。视觉通过 Tailwind CDN、Lucide 图标、渐变与纹理层实现，不依赖外部图片与 API。项目文档同步记录 Discovery、素材策略与交付状态。

**Tech Stack:** Vite、原生 JavaScript、Tailwind CDN、Lucide、anime.js

---

### Task 1: 文档落盘与项目状态同步

**Files:**
- Modify: `projects/huozheyan-official-site/ASSETS.md`
- Modify: `projects/huozheyan-official-site/API.md`
- Modify: `projects/huozheyan-official-site/HANDOFF.md`

**Step 1:** 把无外部图片、无 API 的当前结论写入项目文档。

**Step 2:** 记录首版将以纯视觉占位实现，不阻塞开发。

**Step 3:** 更新 handoff 为“实现中”。

### Task 2: 页面主体实现

**Files:**
- Modify: `projects/huozheyan-official-site/index.html`
- Modify: `projects/huozheyan-official-site/src/generated/page.js`

**Step 1:** 修改页面标题与基础 body 气质。

**Step 2:** 在 `src/generated/page.js` 输出完整单页结构。

**Step 3:** 实现 Hero、剧情、主创、动作对决、上映、奖项分级、CTA。

**Step 4:** 加入轻量动效、纹理层、触屏友好交互和 reduced motion 降级。

**Step 5:** 调用 `runtime.refreshIcons()`，确保 Lucide 正常渲染。

### Task 3: 项目文档回填

**Files:**
- Modify: `projects/huozheyan-official-site/PROJECT.md`
- Modify: `projects/huozheyan-official-site/HANDOFF.md`

**Step 1:** 更新当前状态为已实现待验证。

**Step 2:** 记录预览命令、页面组成、已知限制。

### Task 4: 构建与预览验证

**Files:**
- No file changes expected

**Step 1:** 运行 `pnpm install`。

**Step 2:** 运行 `sh scripts/project-verify-scaffold.sh huozheyan-official-site vite-page`。

**Step 3:** 运行 `pnpm build`。

**Step 4:** 启动 `pnpm preview --host 127.0.0.1 --port <port>` 并验证页面返回 200。

**Step 5:** 检索构建产物中的关键文案，确认页面主内容已进入产物。

### Task 5: 交付整理

**Files:**
- Modify: `projects/huozheyan-official-site/HANDOFF.md`

**Step 1:** 记录最终验证结果。

**Step 2:** 列出改动文件、运行方式、限制与下一步建议。
