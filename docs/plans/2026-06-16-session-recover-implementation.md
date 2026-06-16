# Session Recover Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在用户清空当前 session 后，允许 `webgen` 从 `projects/` 中自动发现已有项目，并恢复到规范 project sessionKey，必要时重绑到新的规范 key。

**Architecture:** 新增 `scripts/session-recover.sh` 作为统一入口，直接以 `projects/<slug>/.webgen/session-lock.json` 为事实源，`session-registry.json` 作为可重建缓存。恢复时优先规范化到 canonical key `agent:webgen:proj-<slug>`，并回写 lock 与 registry。

**Tech Stack:** shell scripts, node JSON helpers, existing session-route / session-lock / session-registry / project-session-entry flow

---

### Task 1: 增加恢复测试

**Files:**
- Modify: `tests/template-scaffold-context-load.test.mjs`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

新增测试覆盖：
- `session-recover.sh list`
- `session-recover.sh resume <slug>`
- `session-recover.sh rebuild-registry`

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，提示缺少 `session-recover.sh` 或行为不匹配。

**Step 3: Write minimal implementation**

实现新的恢复脚本。

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

### Task 2: 实现恢复与重绑入口

**Files:**
- Create: `scripts/session-recover.sh`
- Modify: `docs/session-routing-and-project-commands.md`
- Modify: `docs/webgen-ops-index.md`

**Step 1: Add list/resume/rebind/rebuild-registry**

支持：
- `session-recover.sh list`
- `session-recover.sh resume <slug>`
- `session-recover.sh rebind <slug>`
- `session-recover.sh rebuild-registry`

**Step 2: Ensure canonical session key migration**

恢复时统一迁到：
- `agent:webgen:proj-<slug>`

**Step 3: Verify**

Run:

```bash
node --test tests/template-scaffold-context-load.test.mjs
```

Expected: PASS

