# Preview Lifecycle Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `webgen` 的多项目预览建立统一的生命周期管理，自动回收旧的 Vite 预览进程并释放端口，避免项目越多时本机长期堆积多个服务。

**Architecture:** 复用现有 `preview-manager.sh + project-preview.sh + project-preview-stop.sh` 体系，不引入独立守护进程。新增一个轻量 preview registry，记录运行中的预览、pin 状态和最近活跃时间；启动预览前统一执行孤儿回收、TTL 回收和容量治理；交付后默认只保留当前项目预览，其它未 pin 预览自动关闭。

**Tech Stack:** `zsh` shell scripts, `node` JSON helpers, existing preview workflow and tests

---

### Task 1: 为 preview manager 增加注册表读写能力

**Files:**
- Modify: `scripts/preview-manager.sh`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

在 `tests/template-scaffold-context-load.test.mjs` 新增最小用例，断言 `preview-manager.sh` 至少支持新的 registry 基础命令：
- `pin <slug>`
- `unpin <slug>`
- `gc`

测试先只验证命令存在和输出格式，不先耦合完整生命周期。

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，提示 `preview-manager.sh` 不支持新命令或输出不匹配。

**Step 3: Write minimal implementation**

在 `scripts/preview-manager.sh` 中增加：
- registry 文件路径，例如 `.openclaw/preview-registry.json`
- `ensure_registry`
- `registry_upsert`
- `registry_remove`
- `registry_mark_pinned`
- 新命令：
  - `pin <slug>`
  - `unpin <slug>`

registry 至少记录：
- `slug`
- `port`
- `pid`
- `startedAt`
- `lastSeenAt`
- `pinned`

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/preview-manager.sh tests/template-scaffold-context-load.test.mjs
git commit -m "feat: add preview registry and pin controls"
```

### Task 2: 为 preview manager 增加 TTL 回收与容量治理

**Files:**
- Modify: `scripts/preview-manager.sh`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

新增测试覆盖：
- `gc` 会跳过 pinned 项目
- `gc` 会关闭超过 TTL 的未 pinned 预览
- 超过 `WEBGEN_PREVIEW_MAX` 时，`ensure-capacity <slug>` 会优先关闭最老的未 pinned 预览，而不是只报错

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，说明 `gc`/容量治理行为不存在。

**Step 3: Write minimal implementation**

在 `scripts/preview-manager.sh` 中增加：
- `gc`
- `ensure-capacity [slug]`
- `WEBGEN_PREVIEW_TTL_MINUTES`，默认 `60`
- registry 排序规则：
  - `pinned=true` 永不自动回收
  - 未 pinned 且超 TTL：先回收
  - 未 pinned 且超容量：按 `lastSeenAt/startedAt` 最老优先关闭

保留现有 `gate`，但让 `project-preview.sh` 优先走自动治理，再决定是否阻塞。

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/preview-manager.sh tests/template-scaffold-context-load.test.mjs
git commit -m "feat: add preview gc and capacity control"
```

### Task 3: 启动预览前自动执行回收与容量整理

**Files:**
- Modify: `scripts/project-preview.sh`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

新增测试覆盖：
- `project-preview.sh` 启动前会先调用 `preview-manager.sh reap`
- 然后调用 `preview-manager.sh gc`
- 再调用 `preview-manager.sh ensure-capacity <slug>`

测试只需要验证顺序性和最小输出，不需要起真实 Vite。

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，说明当前 `project-preview.sh` 没有自动治理流程。

**Step 3: Write minimal implementation**

在 `scripts/project-preview.sh` 中：
- 启动前先执行：
  - `zsh scripts/preview-manager.sh reap`
  - `zsh scripts/preview-manager.sh gc`
  - `zsh scripts/preview-manager.sh ensure-capacity <slug>`
- 启动成功后把当前项目写回 registry
- 若发现同项目已有健康预览，则刷新 `lastSeenAt`

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/project-preview.sh tests/template-scaffold-context-load.test.mjs
git commit -m "feat: auto-manage preview capacity before launch"
```

### Task 4: 停止预览时同步释放 registry 状态

**Files:**
- Modify: `scripts/project-preview-stop.sh`
- Modify: `scripts/project-preview-status.sh`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

新增测试覆盖：
- `project-preview-stop.sh <slug>` 停止后会从 registry 删除或标记 stopped
- `project-preview-status.sh` 能在紧凑输出里体现 stopped 状态

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，registry 状态未同步。

**Step 3: Write minimal implementation**

在 `project-preview-stop.sh` 中：
- 停止进程后同步 registry

在 `project-preview-status.sh` 中：
- 如有必要，补一个 `managed: pinned|auto|stopped` 简要字段
- 默认输出仍保持短摘要

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/project-preview-stop.sh scripts/project-preview-status.sh tests/template-scaffold-context-load.test.mjs
git commit -m "feat: sync preview registry on stop and status"
```

### Task 5: 交付后默认只保留当前项目预览

**Files:**
- Modify: `scripts/workflow-deliver.sh`
- Modify: `docs/session-routing-and-project-commands.md`
- Modify: `docs/webgen-ops-index.md`
- Test: `tests/template-scaffold-context-load.test.mjs`

**Step 1: Write the failing test**

新增测试覆盖：
- 交付完成后默认调用 `preview-manager.sh stop-others <slug>`
- 若后续支持 pin，说明文档中要明确“被 pin 的预览不会被自动关掉”

**Step 2: Run test to verify it fails**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: FAIL，当前交付链路不会清理其它预览。

**Step 3: Write minimal implementation**

在 `scripts/workflow-deliver.sh` 中：
- 完成交付 gate 后调用 `zsh scripts/preview-manager.sh stop-others <slug>`
- 若当前项目被 pin，仅关闭其它未 pinned 项目

同步文档：
- `docs/session-routing-and-project-commands.md`
- `docs/webgen-ops-index.md`

补充命令语义：
- `preview-manager.sh pin <slug>`
- `preview-manager.sh unpin <slug>`
- `preview-manager.sh gc`

**Step 4: Run test to verify it passes**

Run: `node --test tests/template-scaffold-context-load.test.mjs`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/workflow-deliver.sh docs/session-routing-and-project-commands.md docs/webgen-ops-index.md tests/template-scaffold-context-load.test.mjs
git commit -m "feat: stop stale previews after delivery"
```

### Task 6: 全量回归与顺序 smoke

**Files:**
- Test: `tests/template-scaffold-context-load.test.mjs`
- Test: `tests/cdp-design-review.test.mjs`
- Test: `tests/page-design-guard.test.mjs`

**Step 1: Run targeted tests**

Run:

```bash
node --test tests/template-scaffold-context-load.test.mjs
```

Expected: PASS

**Step 2: Run regression tests**

Run:

```bash
node --test tests/cdp-design-review.test.mjs tests/page-design-guard.test.mjs
```

Expected: PASS

**Step 3: Run sequential smoke**

Run:

```bash
sh scripts/project-init.sh preview-lifecycle-smoke vite-page
zsh scripts/preview-manager.sh list
sh scripts/project-preview.sh preview-lifecycle-smoke || true
zsh scripts/preview-manager.sh gc
zsh scripts/preview-manager.sh stop-all
rm -rf projects/preview-lifecycle-smoke
```

Expected:
- `list` 输出当前预览状态
- `gc` 可执行
- `stop-all` 释放全部预览

**Step 4: Commit**

```bash
git add .
git commit -m "test: verify preview lifecycle management"
```

