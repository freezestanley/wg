# webgen SOP 主流程与状态门模型

> 用途：把 webgen 当前“怎么做项目”和“什么时候允许进入下一阶段”统一到一套可执行模型里，避免流程推进与放行条件脱节。

## 一、总原则

- **SOP 流程**回答：现在做到哪一步。
- **Gate 状态门**回答：这一步是否允许进入下一步。
- **阶段推进必须依赖 Gate 放行**，不能只看“流程差不多做了”。
- **例外也必须结构化记录**，不能只写在自然语言里。

---

## 二、标准 Workflow 阶段

1. `routing`
2. `session-check`
3. `init`
4. `discovery`
5. `proposal`
6. `implementation`
7. `asset-api-sync`
8. `verification`
9. `delivery`

推荐流转：

```text
routing
  → session-check
  → init
  → discovery
  → proposal
  → implementation
  → asset-api-sync
  → verification
  → delivery
```

---

## 三、标准 Gate 集合

- `Route Gate`
- `Session Gate`
- `Scaffold Gate`
- `Discovery Gate`
- `Asset Input Gate`
- `Proposal Gate`
- `Implementation Gate`
- `Verification Gate`
- `Delivery Gate`

### Gate 状态枚举

- `Pass`
- `Exception-Pass`
- `Pending`
- `Fail`

说明：

- `Pass`：正常通过。
- `Exception-Pass`：命中合法例外，可继续，但必须留下记录。
- `Pending`：信息不足或尚未执行完，不允许越级。
- `Fail`：明确不通过，必须先修复。

---

## 四、阶段与 Gate 对应关系

| Workflow 阶段 | 主要 Gate | 通过后可进入 |
|---|---|---|
| `routing` | `Route Gate` | `session-check` |
| `session-check` | `Session Gate` | `init` 或续做阶段 |
| `init` | `Scaffold Gate` | `discovery` |
| `discovery` | `Discovery Gate` + `Asset Input Gate` | `proposal` |
| `proposal` | `Proposal Gate` | `implementation` |
| `implementation` | `Implementation Gate` | `asset-api-sync` / `verification` |
| `asset-api-sync` | `Implementation Gate` 二次确认 | `verification` |
| `verification` | `Verification Gate` | `delivery` |
| `delivery` | `Delivery Gate` | 完成 |

---

## 五、每个阶段该做什么

### 1. `routing`

目标：判断这是新项目还是续做项目，并确定目标项目 session。

必须产物：
- `slug`
- `sessionKey`
- `mode: new | resume:<slug>`

`Route Gate` 通过条件：
- 已能明确 new / resume
- 已能明确目标 slug
- 已能明确目标 sessionKey

阻塞例子：
- 无法判断是新项目还是旧项目
- 没有 slug，且无法从上下文安全推断

---

### 2. `session-check`

目标：确认当前 session 允许处理这个项目。

必须动作：
- 新项目先执行 `/clear`
- 执行 `session-lock.sh check <slug> <sessionKey> <mode>`

`Session Gate` 通过条件：
- `new` 返回 `LOCK_ABSENT`
- `resume` 返回 `LOCK_MATCH`

阻塞例子：
- `LOCK_MISMATCH`
- `LOCK_SESSION_MISMATCH`
- 当前 session 已锁到其它 slug

---

### 3. `init`

目标：以模板方式创建合规项目骨架。

必须动作：
- `project-init.sh <slug> <template-id>`
- `session-lock.sh init <slug> <sessionKey>`
- `project-verify-scaffold.sh <slug> <template-id>`

`Scaffold Gate` 通过条件：
- 项目目录来自模板复制
- 模板自检通过
- 基础文档存在：
  - `PROJECT.md`
  - `DISCOVERY.md`
  - `ASSETS.md`
  - `API.md`
  - `HANDOFF.md`
  - `.webgen/`

---

### 4. `discovery`

目标：收集本轮项目事实，不沿用其它项目上下文。

必须覆盖：
- 页面目标
- 用户 / 受众
- 页面结构
- 风格方向
- `PC / Pad / H5`
- 断点策略
- 触控热区
- Pad 横竖屏
- H5 首屏优先级
- hover 替代策略
- `Design Read`
- `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`

`Discovery Gate` 通过条件：
- 页面角色与信息结构已清晰
- 设计方向已清晰
- 响应式与交互降级方案已清晰

---

### 5. `discovery` 内的输入素材收集

目标：不只确认图片，还要确认所有会影响方案与实现的输入素材。

必须收集的 6 类：

1. **文案素材**
   - 品牌名
   - 标题 / 副标题
   - 产品卖点
   - 按钮文案
   - 参数表 / FAQ / 法务信息

2. **图片素材**
   - Logo
   - Hero 图
   - 产品图 / 场景图
   - 是否允许图库
   - 是否接受 SVG / placeholder

3. **API 与数据素材**
   - Base URL
   - 接口文档
   - 鉴权方式
   - 请求/响应示例
   - 错误码
   - mock / 代理要求

4. **品牌视觉素材**
   - 品牌色
   - 字体
   - 参考站
   - 风格关键词
   - 禁用风格

5. **业务附件素材**
   - PDF
   - 规格书
   - CSV / Excel
   - 视频 / 音频
   - 门店信息 / 地图 / 联系方式

6. **运行与交付素材**
   - 域名 / 环境
   - SEO 标题描述
   - favicon / 分享图
   - 埋点
   - 表单投递目标
   - 打包交付要求

每类素材必须记录：
- 当前状态
- 是否阻塞
- 缺失影响
- 处理策略

`Asset Input Gate` 通过条件：
- 已提供足够素材，或
- 用户/调度方明确允许先用 mock / 占位 / 假设出首版

---

### 6. `proposal`

目标：把 Discovery 结论转成可评审方案。

方案至少包含：
- 页面类型 / 目标
- 主要板块与结构
- Design Read 与三档位
- 配色 / 字体方向
- 素材策略
- API 策略
- 适配目标

`Proposal Gate` 通过条件：
- 用户显式确认方案，或
- 用户 / 调度方明确要求“直接做”

说明：
- 命中“直接做”时状态应记为 `Exception-Pass`，不能写成普通确认通过。

---

### 7. `implementation`

目标：在合规脚手架内完成页面业务代码。

必须满足：
- 页面主结构完成
- 关键交互完成
- `Loading / Empty / Error / Active Feedback` 已补齐
- 不破坏模板运行链路

`Implementation Gate` 通过条件：
- 代码已达到“可以验证”的完成度

---

### 8. `asset-api-sync`

目标：把素材、API、适配、文档和实现对齐。

必须更新：
- `ASSETS.md`
- `API.md`
- `DISCOVERY.md`
- `HANDOFF.md`

重点检查：
- 图片来源与校验状态
- API 契约 / mock / 代理策略
- 响应式策略是否已真正落地

---

### 9. `verification`

目标：证明页面不是“理论可运行”，而是真能跑。

建议验证项：
- `project-verify-scaffold.sh` 通过
- `pnpm build` 通过
- 本地预览可启动
- 页面入口可访问

`Verification Gate` 通过条件：
- 至少 1 次实际验证成功

---

### 10. `delivery`

目标：形成可恢复、可交接、可继续迭代的交付状态。

必须更新：
- `PROJECT.md`
- `HANDOFF.md`
- `.webgen/workflow-state.json`

`Delivery Gate` 通过条件：
- 满足最终交付自检门全部要求

---

## 六、强制禁止越级规则

- `Proposal Gate` 未通过：禁止写页面业务代码。
- `Scaffold Gate` 未通过：禁止继续开发。
- `Asset Input Gate` 为 `Fail`：禁止继续出方案或实现。
- `Verification Gate` 未通过：禁止宣称“验证完成”。
- `Delivery Gate` 未通过：禁止宣称“交付完成”。

---

## 七、推荐文档落点

### `PROJECT.md`
记录：
- 当前 workflow stage
- 各 Gate 摘要
- 当前 blockers

### `DISCOVERY.md`
记录：
- Discovery 事实
- Design Read
- 三档位
- 输入素材收集
- `Discovery Gate` / `Asset Input Gate` 状态

### `ASSETS.md`
记录：
- 图片 / 品牌 / 交付素材的来源、限制、校验状态

### `API.md`
记录：
- API 契约、mock、代理与阻塞项

### `HANDOFF.md`
记录：
- 当前 stage
- 哪个 Gate 未过
- 下一步如何过门

---

## 八、推荐状态文件结构

```json
{
  "stage": "verification",
  "gates": {
    "route": "Pass",
    "session": "Pass",
    "scaffold": "Pass",
    "discovery": "Pass",
    "assetInput": "Exception-Pass",
    "proposal": "Exception-Pass",
    "implementation": "Pass",
    "verification": "Pass",
    "delivery": "Pending"
  },
  "notes": {
    "assetInput": "用户允许先用 mock 文案与 CSS 占位视觉",
    "proposal": "按调度要求直接落地实现"
  }
}
```

### 推荐配套脚本

- `./scripts/workflow-set-gate.sh <slug> <gate> <status> [note]`
- 用途：统一更新 `workflow-state.json` 中某个 Gate 的状态与备注，避免每个脚本各自写一份 Gate 更新逻辑。
- `./scripts/workflow-report.sh <slug>`
- 用途：汇总当前 stage、全部 Gate、blockers 和下一步建议，便于任何项目一条命令查看进度与阻塞点。
- `./scripts/workflow-announce-status.sh <slug>`
- 用途：输出严格基于 workflow 文件的一句话状态，格式为“当前环节 / 是否进入交付 / 是否阻塞”，供 main 监听进度或对外简报直接复用，避免口头状态超前。

---

## 九、最简执行口诀

> 先路由，再验锁，再建模板，再做 Discovery，再收输入素材，再过方案门，再开发，再补素材/API，再验证，最后交付。

如果只记一句：

> **流程负责顺序，状态门负责放行。**
