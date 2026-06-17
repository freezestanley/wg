---
name: "webgen"
description: "把网页生成类需求委派给常驻 webgen agent 处理。"
---

# webgen

当任务核心是网页生成或前端页面迭代时，优先把工作委派给常驻 `webgen` agent，而不是当前 agent 自己直接实现。

适用场景：
- 从需求生成 HTML / CSS / JS 页面
- 现有网页项目的样式、结构、交互迭代
- 本地预览、静态资源检查、页面联调
- 为前端接入远端 API 增加本地代理或 mock
- 打包网页交付物

不适用场景：
- 纯后端、数据库、运维任务
- 与网页无关的一般文案、分析或管理工作
- 必须在当前 agent 上下文内直接改动且不能外包的极小改动

## 委派原则

1. 默认把 `webgen` 当作网页实现入口。
2. 给 `webgen` 的消息要包含明确目标、约束、已有文件路径、交付物和验证要求。
3. 若当前工作区已有网页项目，说明应在原项目上迭代，避免重做。
4. 若涉及 API、跨域、鉴权，要求 `webgen` 优先采用本地代理层、适配层或 mock，避免把密钥暴露到前端。
5. 收到 `webgen` 返回结果后，由当前 agent 再向用户整合说明。

## 调用方 SOP

### 第 0 步：先判断该不该委派给 webgen

满足以下任一情况时，优先委派给 `webgen`：
- 要新建网页、落地页、专题页、后台页面
- 要修改现有网页项目的结构、样式、交互
- 要做前端本地预览、静态资源检查、页面联调
- 要给前端接 API，同时需要本地代理或 mock
- 要整理网页交付物、构建产物或打包目录

不满足时，不必强行委派给 `webgen`：
- 纯后端 / 数据库 / 运维工作
- 与网页无关的纯文案、分析、流程管理
- 必须在当前 agent 上下文内完成且不能外包的极小改动

### 第 1 步：判断是 new 还是 resume

优先用下面规则判断：

#### 判为 new
- 用户明确说“新做一个网站 / 页面 / landing page”
- 当前没有现有项目目录
- 当前没有既有项目 slug
- 当前没有明确指向历史项目

#### 判为 resume
- 用户明确说“继续之前那个项目”
- 已知项目 slug
- 已知项目目录，如 `projects/<slug>`
- 明确是在现有网页项目基础上迭代

#### 如果判不出来
不要猜，先澄清。默认话术可直接复用：
- 见 `docs/webgen-routing-message-templates.md`
- 见 `docs/webgen-session-error-handling.md`

## 推荐调用方式

### 默认入口：接待 / 调度 session

优先直接向配置好的 `webgen` 常驻 agent 发消息：
- 使用 `sessions_send`，目标为 `agentId: "webgen"`
- 默认进入 `agent:webgen:main` 这一类接待 / 调度 session
- 由接待 session 负责判断这是 **new** 还是 **resume**，再路由到真正的项目 session

### 路由规则

当任务需要进入项目执行态时，不要直接把所有项目都压在同一个 `webgen` 会话里，而要走项目 session 路由：

1. **新项目**
   - 先生成 slug
   - 调用：`./scripts/session-route.sh envelope new <slug>`
   - 得到：`sessionKey=agent:webgen:proj-<slug>`、`mode=new`
   - 然后用 `sessions_send(sessionKey=..., message=...)` 把完整需求投递到该项目 session

2. **已有项目续做**
   - 调用：`./scripts/session-route.sh envelope resume <slug>`
   - 从 registry 恢复既有 `sessionKey`
   - 得到：`mode=resume:<slug>`
   - 然后用 `sessions_send(sessionKey=..., message=...)` 把增量需求投递到原项目 session

### 发送要求

无论是 new 还是 resume，发送给项目 session 的消息都应显式包含：
- `mode: new` 或 `mode: resume:<slug>`
- `slug: <project-slug>`
- `项目 session 入场命令: sh scripts/project-session-entry.sh <slug> <sessionKey> <mode> [template-id]`
- 完整需求
- 素材 / 文案 / 图片 / 接口文档
- 是否已有项目目录
- 交付与验证要求

### 调用方最小字段集

调用方至少要给出：
- `mode`
- `slug`
- `任务目标`
- `输入资料`
- `实现约束`
- `交付要求`
- `验证要求`

若是 resume，最好额外带上：
- `工作目录: projects/<slug>`

### 调用方不要做的事

- 不要把多个不同项目塞进同一个 project session
- 不要在不知道 slug 的情况下伪造 `resume:<slug>`
- 不要在 registry 查不到旧项目 key 时硬猜 sessionKey
- 不要跳过 `mode` / `slug`，只发自然语言让项目 session 自己猜
- 不要让 webgen 在未确认项目归属时直接写文件

### 为什么这样做

这样可以满足 `webgen` 的全局硬约束：
- 一个 session = 一个项目
- 接待 session 只做调度，不写项目文件
- 项目 session 才负责真正的项目落地
- 避免多个项目在同一上下文里串线

## 委派消息模板

可按下面结构组织发送给 `webgen` 的内容：

- 路由模式：`new` / `resume:<slug>`
- 项目 slug：`<project-slug>`
- 任务目标：要生成或修改什么网页
- 工作目录：相关项目路径（如已有）
- 输入资料：现有文件、文案、接口、图片、参考站点
- 实现约束：技术栈、是否原生、是否允许框架、兼容性要求
- 交付要求：需要新增哪些文件、是否要打包、是否要提供预览命令
- 验证要求：至少检查入口文件、资源引用、运行/预览是否正常

### new 项目示例

```text
mode: new
slug: brand-landing
项目 session 入场命令: sh scripts/project-session-entry.sh brand-landing <sessionKey> new vite-page

请处理一个网页生成任务。

任务目标：新建一个品牌官网 landing page。
输入资料：主标题文案、品牌色、参考网站、接口文档见附件。
实现约束：优先原生 HTML/CSS/JS，不要引入重框架；兼容 PC / Pad / H5。
交付要求：创建新项目，可本地预览，说明改动文件。
验证要求：检查入口文件、资源路径，并确认预览命令可运行。
```

### resume 项目示例

```text
mode: resume:pricing-redesign
slug: pricing-redesign
项目 session 入场命令: sh scripts/project-session-entry.sh pricing-redesign <sessionKey> resume:pricing-redesign

请继续这个网页项目。

任务目标：基于现有 landing page 增加 pricing 区块，并优化首屏 CTA。
工作目录：projects/pricing-redesign
输入资料：保留现有配色与品牌文案，pricing 文案使用项目内 docs/pricing.md。
实现约束：优先原生 HTML/CSS/JS，不要引入重框架。
交付要求：直接修改现有项目，可本地预览，说明改动文件。
验证要求：检查入口文件与资源路径，并确认预览命令可运行。
```

## 失败与重试 SOP

### 1. 如果路由前就发现项目归属不清
- 不要继续投递
- 先澄清 new / resume
- 参考：`docs/webgen-session-error-handling.md`

### 2. 如果 resume 但查不到旧 sessionKey
- 不要伪造 key
- 要求补项目目录 / 历史 key / 或确认按 new 处理
- 参考：`docs/webgen-session-error-handling.md`

### 3. 如果项目 session 返回 lock 冲突
- 不要在当前 session 硬做
- 按返回内容修正 `mode`、`slug` 或 `sessionKey`
- 再重新路由一次

### 4. 如果项目 session 返回 scaffold / 模板异常
- 不要要求它绕过模板继续写
- 让它先按 `project-init.sh` / `project-verify-scaffold.sh` 规则恢复脚手架

### 5. 如果只是预览 / 构建失败
- 这是项目内运行问题，不一定需要改路由
- 允许项目 session 在本项目内继续排障

## 项目恢复读取顺序

对于 resume 项目，默认读取顺序应为：
- 优先执行 `sh scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>`
- 优先执行 `sh scripts/project-resume-context.sh <slug>`
- 或先读 `.webgen/context-summary.txt`
- 再看 `.webgen/discovery-gap.txt`
- 只有 gap 指到缺口时，再按需读 `DISCOVERY.md`
- 最后再按需读 `PROJECT.md` / `HANDOFF.md` / `ASSETS.md` / `API.md`

不要把整套项目文档当成默认首读入口，先用短摘要判断当前阶段、Gate 和 Discovery 状态。

## 返回结果要求

要求 `webgen` 返回时尽量包含：
- 修改了哪些文件
- 做了哪些实现取舍或假设
- 如何预览或运行
- 实际验证结果
- 若阻塞，明确缺失信息

## 快速索引

如果你是调用方，优先按这个顺序看文档：
1. `skills/webgen/SKILL.md`
2. `docs/webgen-routing-message-templates.md`
3. `docs/webgen-session-error-handling.md`
4. `docs/session-routing-and-project-commands.md`
5. `docs/webgen-ops-index.md`

## 透传扩展约定

该 skill 当前先定义为“统一委派入口”。
后续若需要做透传，可在不改变触发方式的前提下继续扩展：
- 增加标准化入参格式
- 增加对附件、上下文、工作目录的透传规则
- 增加结果回传的结构化格式
- 增加对持续迭代会话的复用约定

在扩展前，先保持 skill 足够轻量，只负责把网页相关任务稳定路由给 `webgen` agent。
