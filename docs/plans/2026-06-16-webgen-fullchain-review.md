# WebGen 全链路 Review（2026-06-16）

> 本文记录对当前 webgen workspace 的完整 review 结论，覆盖三个维度：页面设计质量退化、状态门同步 bug、架构合理性。

---

## 一、页面设计效果差

### 根因

**1. 新版 template 删掉了 `runtime/` 层**

| 维度 | 老版（webgen-workspace） | 新版（当前） |
|------|--------------------------|-------------|
| `src/runtime/` | 有（`render-preview-shell.js` + `create-preview-runtime.js`） | 已删除 |
| `src/generated/page.js` | 模板自带示例骨架 | 已删除（目录存在但文件缺失） |
| `main.js` 接入方式 | runtime 创建 → shell 渲染 → page.js 挂载到 `#generated-page-root` | 直接 `mountPage({container: app})` |

老版的 `render-preview-shell.js` 自带完整的 PreviewShell UI（深色背景、渐变、信息面板、健康状态栏），agent 写的 `page.js` 挂入这个 shell，天然有视觉容器兜底。新版砍掉这一层后，AI 生成页面直接裸挂到 `#app`，稍差的生成结果就直接裸暴。

**2. `TEMPLATE.md` 提高了质量预期，scaffold 没有同步**

`TEMPLATE.md` 明确"默认首版更像品牌页骨架，不是空壳"，但 `src/generated/` 为空，agent 每次从零生成，质量完全依赖 prompt 发挥。

### 修复方向

- 在 `src/generated/page.js` 内置一个高质量品牌页骨架，参考老版 `dunk-hero`、`watch-product-page` 的风格作为起点
- 将 `runtime/render-preview-shell.js` 恢复为可选层，或把 shell 的高质量视觉容器合并进 `main.js`

---

## 二、状态门同步 Bug

### Bug 1（P0）：`workflow-deliver.sh` 引用了未定义变量 `$WORKSPACE_ROOT`

**位置：** `scripts/workflow-deliver.sh`

```sh
CURRENT_STAGE=$(node -e '...' "$WORKSPACE_ROOT/projects/$SLUG/.webgen/workflow-state.json")
```

`WORKSPACE_ROOT` 在该脚本中从未定义（其他脚本用 `SCRIPT_DIR` 反推，但此脚本漏了这一行）。`set -eu` 模式下执行必崩。

**修复：** 在脚本头部补：
```sh
WORKSPACE_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
```

---

### Bug 2（P1）：`workflow-transition.sh` 不接受 `delivery` 阶段

**位置：** `scripts/workflow-transition.sh`

```sh
case "$NEXT_STAGE" in
  routing|discovery|proposal|implementation|verification|design-review) ;;
  # ❌ 没有 delivery
```

`huo-zhe-yan` 的 `workflow-state.json` 显示 `currentStage: "delivery"`，该状态是 agent 手写入 JSON 的，绕过了 transition 脚本。

**修复：** 在 case 枚举中补入 `delivery`，并在 transition 逻辑中处理 `design-review → delivery` 流转。

---

### Bug 3（P1）：`checks/design-review.json` 与 `gates.designReview` 双源不一致

**表现（以 `huo-zhe-yan` 为例）：**

- `checks/design-review.json`：`{"status": "pending", ...}`
- `workflow-state.json` → `gates.designReview`：`"Pass"`

`workflow-assert-delivery-ready.sh` 同时检查两处，两者不一致时结论不可信。

**根因：** `workflow-deliver.sh` 只更新了 `gates.designReview`，没有同步写 `checks/design-review.json`；`workflow-record-design-review.sh` 只写 `checks/design-review.json`，没有调用 `set-gate`。两条写路径互不感知。

**修复方向：** 选定一处为权威源（建议 `checks/design-review.json`），另一处作为派生；任何写入操作强制同时更新两处，或废弃其中一处。

---

### Bug 4（P2）：`workflow-set-gate.sh` 枚举与实际项目 gate 不一致

`workflow-set-gate.sh` 只允许：`route|session|proposal|implementation|verification|designReview`

但 `huo-zhe-yan` 项目 `gates` 里有：`scaffold`、`discovery`、`assetInput`、`delivery`——均为 agent 直接写入，不经过 `set-gate.sh` 验证。

**修复方向：** 补入缺失的 gate 枚举，或在文档中明确区分哪些 gate 只允许脚本内部写，哪些对外开放。

---

## 三、架构合理性 Review

### 结论：整体方向合理，有两处过度设计

**合理的部分（保留）：**

- 双角色调度（接待 session + 项目 session）：解决多项目串上下文的核心问题
- SO-010a 状态落盘再汇报：避免口头进度超前是真实痛点
- SO-006 强制走 `project-init.sh`：防止 AI 手写脚手架缺文件

---

### 过度设计一：Discovery 校验太重

**位置：** `scripts/workflow-check.sh` → `check_discovery_ready_content()`

共有 20+ 个 `grep` 条件，包括验证 checkbox `[x]` 是否勾选、具体字段措辞是否与模板完全一致。

**后果：**
- `DISCOVERY.md` 的每个细节字段都是强约束，一个格式变了就挂
- AI 生成时需严格对齐措辞，"待确认"与"正在确认"会导致不同结果
- 实际项目（`huo-zhe-yan`）完全绕过了这个检查，说明它在实际执行中已形同虚设

**建议：** 保留结构检查（section 标题存在），去掉细粒度 checkbox 内容检查。能落盘、能脚本跑通的才是真正的 gate。

---

### 过度设计二：双状态源导致同步成本高

`checks/*.json`（文件层） 与 `workflow-state.json → gates.*`（JSON 字段层）并行记录同一件事，同步规则分散在多个脚本中，容易出现上文 Bug 3 那类不一致。

**建议：** 以 `workflow-state.json` 为单一权威状态源，`checks/*.json` 降级为 audit log（只追加记录，不参与 gate 判定）；`workflow-assert-delivery-ready.sh` 只读 `workflow-state.json`。

---

## 四、优先级汇总

| 优先级 | 问题 | 涉及文件 |
|--------|------|----------|
| P0 | `workflow-deliver.sh` `$WORKSPACE_ROOT` 未定义，deliver 必崩 | `scripts/workflow-deliver.sh` |
| P0 | `src/generated/page.js` 骨架缺失，页面质量靠运气 | `templates/vite-page/scaffold/src/generated/page.js` |
| P1 | `workflow-transition.sh` 不接受 `delivery` stage | `scripts/workflow-transition.sh` |
| P1 | `checks/design-review.json` 与 `gates.designReview` 双源不一致 | `scripts/workflow-deliver.sh`、`scripts/workflow-record-design-review.sh` |
| P2 | Discovery 校验过严，实际项目全部绕过 | `scripts/workflow-check.sh` |
| P2 | `runtime/` 层删除，页面无视觉容器兜底 | `templates/vite-page/scaffold/src/` |
| P3 | `workflow-set-gate.sh` gate 枚举不完整 | `scripts/workflow-set-gate.sh` |
