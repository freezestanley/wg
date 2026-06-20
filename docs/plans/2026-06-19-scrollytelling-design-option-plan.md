# Scrollytelling Design Option Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把“宣传类页面可选 Scrollytelling 交付方案”补入现有设计方案文档，作为按需使用的可选叙事模式。

**Architecture:** 只更新设计文档，不改模板或运行时。通过在设计总指南和速查表中加入一段 Scrollytelling 方案，让后续做宣传类页面时可以按需选择 GSAP + ScrollTrigger 的滚动叙事实现。

**Tech Stack:** Markdown, Node test runner

---

### Task 1: 用测试锁住宣传页可选 Scrollytelling 方案

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

- 断言 `docs/webgen-design-guide.md` 包含 `Scrollytelling`、`GSAP + ScrollTrigger`、宣传页可按需使用
- 断言 `docs/webgen-design-cheatsheet.md` 有对应速记入口

**Step 2: Run test to verify it fails**

Run: `node --test --test-name-pattern "design docs include optional scrollytelling delivery pattern" tests/template-scaffold-context-load.test.mjs`

Expected: FAIL，因为当前文档还没明确写这段交付方案。

### Task 2: 补入设计方案文档

**Files:**
- Modify: `docs/webgen-design-guide.md`
- Modify: `docs/webgen-design-cheatsheet.md`

**Step 1: Write minimal implementation**

- 在设计总指南中加入“宣传类页面可选 Scrollytelling 方案”
- 明确适用场景、叙事顺序、技术栈、移动端降级
- 在速查表补一条简版入口，便于快速引用

**Step 2: Run test to verify it passes**

Run: `node --test --test-name-pattern "design docs include optional scrollytelling delivery pattern" tests/template-scaffold-context-load.test.mjs`

Expected: PASS

### Task 3: 回归验证

**Files:**
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Run full related suite**

Run: `node --test tests/template-scaffold-context-load.test.mjs`

Expected: PASS
