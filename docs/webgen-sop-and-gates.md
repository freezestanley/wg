# webgen 最小可执行 Workflow / Gates

> 用途：把 webgen 当前“怎么做项目”和“什么时候允许进入下一阶段”收敛成一套真正可执行、可落盘、可验证的最小模型。

## 一、总原则

- Workflow 回答：现在做到哪一步。
- Gate 回答：这一步能不能往下走。
- 只保留脚本和项目文档能够真正承接的状态。
- 设计质量要求保留，但表达为“执行链”和“设计复核”，不再堆成不可执行的审批树。

---

## 二、主 Workflow 阶段

1. `routing`
2. `discovery`
3. `proposal`
4. `implementation`
5. `verification`
6. `design-review`
7. `publish`（可选，仅用户明确要求发布时进入）

推荐流转：

```text
routing
  → discovery
  → proposal
  → implementation
  → verification
  → design-review
  → publish（可选）
```

补充说明：

- `session-check` 与 `init` 仍然存在于动作层，但默认并入 `routing` 的执行上下文，不再作为主要对外阶段反复汇报。
- `asset-api-sync` 仍是实现期间常见动作，但不再单独占一个主阶段。

---

## 三、最小 Gate 集合

- `Route Gate`
- `Session Gate`
- `Proposal Gate`
- `Implementation Gate`
- `Verification Gate`
- `Design Review Gate`
- `Publish Gate`

### Gate 状态枚举

- `Pass`
- `Exception-Pass`
- `Pending`
- `Fail`

说明：

- `Pass`：正常通过
- `Exception-Pass`：命中明确例外，可继续，但必须有记录
- `Pending`：尚未完成，不允许越级
- `Fail`：明确不通过，必须先修复

---

## 四、阶段与 Gate 对应关系

| Workflow 阶段 | 主要 Gate | 通过后可进入 |
|---|---|---|
| `routing` | `Route Gate` + `Session Gate` | `discovery` |
| `discovery` | 形成方案与设计方向 | `proposal` |
| `proposal` | `Proposal Gate` | `implementation` |
| `implementation` | `Implementation Gate` | `verification` |
| `verification` | `Verification Gate` | `design-review` |
| `design-review` | `Design Review Gate` | 完成或 `publish` |
| `publish` | `Publish Gate` | 完成 |

---

## 五、每个阶段要做什么

### 1. `routing`

目标：确定这是哪个项目、用哪个 session 执行、是否允许继续写入。

必须产物：

- `slug`
- `sessionKey`
- `mode: new | resume:<slug>`

必须动作：

- `session-route.sh envelope new|resume <slug>`
- `project-session-entry.sh <slug> <sessionKey> <mode> [template-id]`
- 必要时再看 `session-lock.sh check <slug> <sessionKey> <mode>` 的底层结果

`Route Gate` / `Session Gate` 通过条件：

- 已能明确 `slug / sessionKey / mode`
- `project-session-entry.sh` 成功返回，且底层 lock 对账通过

阻塞例子：

- 不能安全判断是 `new` 还是 `resume`
- 当前 session 已锁到其它 slug
- `LOCK_MISMATCH` / `LOCK_SESSION_MISMATCH`

---

### 2. `discovery`

目标：收集本轮项目事实，形成页面方案和设计方向，不沿用其它项目上下文。

必须覆盖：

- 页面目标
- 目标用户 / 使用场景
- 页面结构
- 风格方向
- `PC / Pad / H5`
- 断点策略
- Pad 横竖屏
- H5 首屏优先级
- hover 替代策略
- 一行 `Design Read`
- `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- `Atmosphere Layer`：`none / subtle / signature`
- 文案 / 图片 / API / 品牌 / 附件 / 交付素材状态

输出位置：

- `DISCOVERY.md`
- 必要时同步 `ASSETS.md` / `API.md`

通过条件：

- 已能输出可评审方案
- 设计方向已清晰
- 响应式与状态策略已清晰

---

### 3. `proposal`

目标：把 discovery 结论变成用户可确认的实现方案。

方案至少包含：

- 页面类型 / 目标
- 主要板块与结构
- Design Read、三档位与 `Atmosphere Layer`
- 配色 / 字体方向
- 素材 / API 策略
- 适配目标

`Proposal Gate` 通过条件：

- 用户显式确认方案，或
- 用户明确要求“直接做”

说明：

- 命中“直接做”时应记为 `Exception-Pass`
- 未确认前禁止写页面业务代码

---

### 4. `implementation`

目标：在合规脚手架内完成页面本体、关键交互和核心状态。

必须动作：

- 新项目优先由 `project-session-entry.sh ... new ...` 统一入场
- 若只做模板重建，才直接使用 `project-init.sh`
- 写页面业务代码前通过脚手架校验
- 在页面中补齐 `Loading / Empty / Error / Active Feedback`

`Implementation Gate` 通过条件：

- 页面主体已完成
- 关键交互可操作
- 核心状态已具备

---

### 5. `verification`

目标：证明页面不是“理论可运行”，而是经过实际验证。

推荐验证动作：

- 文件结构检查
- `pnpm build`
- 本地预览启动
- 资源引用检查
- 关键交互 smoke test

`Verification Gate` 通过条件：

- 至少完成一次真实验证
- 验证结果已记录

未通过时：

- 返回 `implementation`
- 修复后重新验证

---

### 6. `design-review`

目标：在实际页面上完成一次设计复核，而不是只看代码。

必须检查：

- 结构节奏
- 视觉层级
- 排版与留白
- 配色与材质
- 响应式观感
- 交互反馈
- 真实图片与装饰是否贴题

适用要求：

- 交付级页面默认必须走这一轮
- landing / 营销 / 作品集 / 重设计类页面，这一轮是硬门

`Design Review Gate` 通过条件：

- 页面已经实看
- 需要优化的问题已收口，或已明确记录残留项

---

### 7. `publish`（可选）

目标：凡项目新建、修改、续改，在交付已完成且验收通过的前提下，按用户明确意愿决定是否发布当前构建包。

固定追问口径：

```text
当前项目已验收通过，是否立即发布当前构建包？请回复“发布”或“不发布”。
```

必须规则：

- 用户未明确回复 `发布` 前，不得进入发布动作，不得输出发布信号
- 用户明确回复 `不发布` 时，`Publish Gate = Exception-Pass`
- 用户明确回复 `发布` 后，才允许进入发布动作
- 只要项目属于新建、修改、续改中的任一类，且已验收通过并进入交付收口，就必须执行这一步确认，不得跳过
- 当前发布执行动作为：输出单行发布信号字符串，由远端聊天 / WS 应用自行消费 `dist.zip` 路径；不得在脚本或项目文档中写死其它上传接口

`Publish Gate` 通过条件：

- 用户明确回复 `发布`，且发布信号已成功输出并记录为已受理，或
- 用户明确回复 `不发布`，并已记录为 `Exception-Pass`

未通过时：

- 不影响已完成的交付状态
- 但不得对外宣称“发布完成”

---

## 六、最小强制规则

- `Proposal Gate` 未通过：不得写页面业务代码
- `Verification Gate` 未通过：不得宣称“验证完成”
- `Design Review Gate` 未通过：不得宣称“验证完成”或“交付完成”
- 用户未明确回复 `发布`：不得输出发布信号或宣称“发布完成”
- `Publish Gate` 未通过：不得宣称“发布完成”

---

## 七、项目文档如何落地

### `PROJECT.md`

至少记录：

- 当前阶段
- 方案确认状态
- 验证状态
- 设计复核状态
- 发布状态

### `DISCOVERY.md`

至少记录：

- 页面目标与结构
- Design Read 与三档位
- 响应式策略
- 核心状态设计
- 输入素材状态

### `HANDOFF.md`

至少记录：

- 当前做到哪一步
- 最近改动
- 下一步动作
- 当前是否卡在 proposal / verification / design-review
- 若已进入交付收口，记录用户对“发布 / 不发布”的最新明确答复

---

## 八、设计执行链

默认设计链：

1. 在 `DISCOVERY.md` 写 `Design Read`
2. 确定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
3. 声明 `Atmosphere Layer`：`none / subtle / signature`
3. 先做首版页面
4. 做一次实际验证
5. 做一次设计复核
6. 必要时再优化一轮

补充：

- `design-taste-frontend`、`audit` 与相关专项优化能力仍推荐使用
- 但它们服务于页面质量，不再作为独立的主阶段树反复扩张

---

## 九、什么时候算真正完成

至少满足：

1. 方案已确认，或已记录“直接做”例外
2. 页面主体与关键状态已完成
3. 已完成一次实际验证
4. 已完成一次页面实看设计复核
5. 项目文档已同步

若涉及发布，再补一条：

6. 只有在用户明确回复 `发布` 且 `Publish Gate` 通过后，才可宣称“发布完成”

这样 `webgen` 的状态表达就能和真实执行对齐，不再出现“治理层很复杂，但模板和页面还很弱”的失衡。
