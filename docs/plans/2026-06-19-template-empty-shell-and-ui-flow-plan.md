# Template Empty Shell And UI Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让 `vite-page` 模板默认页面只显示 `hello world`，并把 UI 设计约束彻底移回文档与流程，避免模板默认长相污染新项目页面。

**Architecture:** 直接收缩模板默认页面实现，只保留最小挂载链路。再同步模板说明与规则文档，明确“模板是运行壳，不是默认设计稿”，最后补回归测试锁住模板空壳行为和流程文案。

**Tech Stack:** JavaScript, Node test runner, Vite page scaffold, Markdown docs

---

### Task 1: 锁住模板默认页面最小化行为

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`
- Modify: `templates/vite-page/scaffold/src/generated/page.js`

**Step 1: Write the failing test**

- 断言模板默认 `page.js` 只包含 `hello world`
- 断言不再包含 Hero/CTA/Design Handoff 一类模板说明文案

**Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern "template scaffold page defaults to hello world only" tests/template-scaffold-context-load.test.mjs`

Expected: FAIL，因为当前模板仍输出整页说明型 UI。

**Step 3: Write minimal implementation**

- 将默认模板页收缩为最小 `mountPage`
- 仅渲染 `hello world`
- 保留 `mountPage` 入口，不保留默认卡片、状态区、toast、按钮反馈

**Step 4: Run test to verify it passes**

Run: `node --test --test-name-pattern "template scaffold page defaults to hello world only" tests/template-scaffold-context-load.test.mjs`

Expected: PASS

### Task 2: 收紧模板定位与 UI 设计流程文案

**Files:**
- Modify: `templates/vite-page/TEMPLATE.md`
- Modify: `AGENTS.md`

**Step 1: Write the failing test**

- 断言模板说明明确“默认页面只允许 hello world 级占位”
- 断言规则明确“模板页不得提供默认 Hero / Proof / CTA 设计示范”

**Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern "template docs enforce hello world empty shell|agents rules separate scaffold from design output" tests/template-scaffold-context-load.test.mjs`

Expected: FAIL，因为当前文案仍允许模板承担较多说明性 UI。

**Step 3: Write minimal implementation**

- 在模板文档中明确“默认页面 = hello world 级空壳”
- 在总规则中明确“设计流程产出来自 Design Read 和初始蓝图，不来自模板默认页面”

**Step 4: Run test to verify it passes**

Run: `node --test --test-name-pattern "template docs enforce hello world empty shell|agents rules separate scaffold from design output" tests/template-scaffold-context-load.test.mjs`

Expected: PASS

### Task 3: 全量回归验证

**Files:**
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Run focused verification**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: PASS

**Step 2: Review diff**

Run: `git diff -- templates/vite-page/scaffold/src/generated/page.js templates/vite-page/TEMPLATE.md AGENTS.md tests/template-scaffold-context-load.test.mjs`

Expected: 只出现模板页最小化、文档收紧、回归测试新增。
