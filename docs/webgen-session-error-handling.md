# webgen session 错误处理 / 拒绝响应手册

> 用途：统一处理 session 路由、lock、自检、脚手架、方案确认门、项目归属不清等高频异常场景，避免不同 turn 出现不一致口径。

## 一、使用原则

1. **先判定当前角色**：先确认自己是接待 / 调度 session，还是项目 / 执行 session。
2. **先判定错误归类**：是路由问题、lock 问题、脚手架问题、方案确认问题，还是信息不足问题。
3. **先止写，再回复**：凡涉及跨项目、lock 冲突、scaffold 失效、方案未确认，一律先停止写操作，再给用户或调度方明确反馈。
4. **回复要可执行**：不能只说“有问题”，必须给出下一步应该改什么、用哪个命令或补什么信息。
5. **口径统一**：优先复用本文模板，不随意自由发挥。

---

## 二、错误分类总表

| 类别 | 典型触发 | 是否允许继续写入 | 处理原则 |
|---|---|---|---|
| 项目归属不清 | 无法判断 new / resume | 否 | 先澄清 |
| session 污染 | 当前 session 锁定 slug 与请求不符 | 否 | 立即拒写并路由到正确 session |
| lock 冲突 | mode / slug / sessionKey 对不上 | 否 | 立即拒写并要求修正 key 或 mode |
| scaffold 失效 | `project-verify-scaffold.sh` 失败 | 否 | 先重建脚手架 |
| 方案未确认 | 未通过 SO-001 | 否 | 回到方案阶段 |
| Discovery 不足 | 本轮信息收集不完整 | 否 | 先补 `DISCOVERY.md` 所需信息 |
| 输入素材不足 | 文案 / 图片 / API / 品牌 / 附件 / 交付素材未过门 | 否 | 先补输入素材或明确 mock / 占位策略 |
| 初始蓝图缺失 | 高审美页面缺少 `design-taste-frontend` 初始蓝图 | 否 | 先补初始蓝图 |
| 审查与专项优化缺失 | 未做必要质检，或未完成必要专项优化 | 否 | 先完成体检与专项优化 |
| 设计验收未完成 | 未完成页面实看复核，或用户要求的截图验收未完成 | 否 | 先完成设计验收与必要优化 |
| 发布确认缺失 | 用户未明确回复 `发布` / `不发布` | 否 | 先追问发布意愿 |
| 异步发布追踪缺失 | 已 `queued` 但没有 `pollUrl` 或无法继续查询 | 视情况 | 先补配置或改人工跟踪 |
| 发布接口失败 | 同步上传失败且异步降级也失败 | 否 | 记录失败并等待重试 |
| 模板不匹配 | 需求与模板能力冲突 | 否 | 反馈并改选模板 |
| 可恢复运行问题 | 预览端口冲突 / 依赖未装 / 构建失败 | 视情况 | 可在同项目内排障 |

---

## 三、接待 / 调度 session 的错误处理

### 1. 无法判断是 new 还是 resume

**触发条件**
- 用户没有给 slug
- 没有现有项目目录
- 没有明确说“新项目”还是“继续已有项目”

**动作**
- 不做 `sessions_send`
- 不生成项目 sessionKey
- 先澄清项目归属

**固定回复**

```text
我还不能安全路由，因为当前无法确定这是新项目还是已有项目续做。
请补充以下至少一项：
- 目标项目 slug
- 现有项目目录
- 或明确说明“这是一个全新项目”
```

---

### 2. resume 但 registry 里查不到 sessionKey

**触发条件**
- `./scripts/session-route.sh envelope resume <slug>` 无法恢复 key
- `.openclaw/webgen-session-registry.json` 没有该 slug

**动作**
- 不要伪造 sessionKey
- 先向用户 / 调度方说明无法恢复旧项目路由
- 让对方提供已有项目目录或确认按新项目处理

**固定回复**

```text
我已识别这是一个续做请求，但当前 registry 里没有找到项目 `<slug>` 对应的 sessionKey。
为避免把需求发到错误的项目会话里，我不能直接继续路由。
请补充该项目的已有目录、历史 sessionKey，或明确同意按新项目重新创建。
```

---

### 3. 用户要求在当前会话直接跨项目处理

**触发条件**
- 当前是接待 session，但用户要求顺手改多个不同项目
- 或用户要求不要分项目 session

**动作**
- 明确拒绝“一个 session 混多个项目”
- 保持路由模型不变

**固定回复**

```text
这个需求涉及多个不同项目，不能在同一个项目 session 内混做。
我会按项目分别路由到各自的 project session，避免上下文串线和误写文件。
如果你愿意，我可以先逐个确认这些项目的 slug 和优先级。
```

---

## 四、项目 / 执行 session 的错误处理

### 1. session 污染 / slug 不一致

**触发条件**
- 当前 session 已锁定 `<locked-slug>`
- 本轮请求却要求处理 `<incoming-slug>`

**动作**
- 停止全部写操作
- 不允许“顺手改一下”
- 明确要求回到正确 session

**固定回复**

```text
当前 session 已锁定项目 `<locked-slug>`，检测到这次请求对应的是其它项目 `<incoming-slug>`。
我不能在这个 session 内继续写入，以免跨项目串线。
请改为把请求路由到对应项目 session，或为新项目生成新的 project sessionKey。
```

---

### 2. `mode: new` 但 lock 已存在

**触发条件**
- 已按默认入口执行：`sh scripts/project-session-entry.sh <slug> <sessionKey> new <template-id>`
- `./scripts/session-lock.sh check <slug> <sessionKey> new` 返回 `LOCK_EXISTS_SAME`

**动作**
- 不重建项目
- 不覆盖既有内容
- 要求改用 `resume:<slug>` 或换新 key

**固定回复**

```text
当前项目 `<slug>` 已经存在，并且该 sessionKey 已绑定到这个项目。
这次请求标记为 `mode: new`，与现有 lock 冲突。
请改用 `mode: resume:<slug>`，或为新的项目生成一个新的 project sessionKey。
```

---

### 3. `mode: resume` 但 sessionKey 不匹配

**触发条件**
- 已按默认入口执行：`sh scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>`
- `./scripts/session-lock.sh check <slug> <sessionKey> resume:<slug>` 返回 `LOCK_SESSION_MISMATCH`

**动作**
- 先确认是否是历史 legacy key（如旧的 `subagent:` key）遗留在 registry / lock 中
- 对于 legacy key，优先重新运行 `./scripts/session-route.sh envelope resume <slug>` 触发自动迁移到规范 `agent:webgen:proj-<slug>` key；这里的 legacy 包括旧的 `subagent:` key 和历史随机后缀 key
- 若迁移后仍不匹配，再停止全部写入，并要求使用修正后的 sessionKey 重试

**固定回复**

```text
当前请求想恢复项目 `<slug>`，但进入的 sessionKey 与该项目已绑定的 sessionKey 不一致。
为避免串项目，我不能继续写入。
请使用 registry 中记录的原 sessionKey 重试。
```

---

### 4. `mode: resume` 但项目 lock 缺失

**触发条件**
- 已按默认入口执行：`sh scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>`
- 应该是续做，但 `session-lock.sh check` 返回 `LOCK_ABSENT`

**动作**
- 不要直接假设这是新项目
- 先判断项目目录是否是遗留未锁定项目
- 若无法安全判断，要求调度方修正路由或人工确认

**固定回复**

```text
当前请求标记为续做项目 `<slug>`，但项目 lock 缺失，无法确认这个 session 是否真的是该项目的原执行会话。
为避免误把旧项目当成新项目处理，我先暂停写入。
请确认该项目是否需要补建 lock，或重新核对 sessionKey / 项目归属后再继续。
```

---

## 五、方案确认、设计规格与 Discovery 相关异常

### 1. 用户未确认方案但催促直接开工

**触发条件**
- 还没通过 SO-001
- 用户只说“先做一个看看”之类的模糊指令

**动作**
- 不能直接进入页面业务代码实现
- 继续方案澄清，或要求用户明确授权“可以基于合理假设直接做”

**固定回复**

```text
当前还没有完成方案确认，我不能直接进入页面业务实现。
如果你希望我继续，请二选一：
1. 明确确认当前方案；
2. 明确授权我“基于合理假设先做一版”。
如果你授权我带假设开工，我会把所有假设单独列出来。
```

---

### 2. Discovery 信息不足

**触发条件**
- 缺少目标、受众、结构、风格、素材、接口或适配要求
- 还不足以形成可执行方案

**动作**
- 先看 `.webgen/discovery-gap.txt`
- 按 gap 一次补齐缺口
- 不进入业务编码

**固定回复**

```text
当前项目信息还不完整，暂时不能安全进入实现。
我会先根据 `.webgen/discovery-gap.txt` 一次补齐当前 Discovery 缺口，而不是逐轮试错。
当前优先缺口通常包括：
- 页面目标 / 受众
- 核心板块结构
- 文案 / 图片 / 品牌素材
- 接口 / 数据策略
- PC / Pad / H5 适配结论
补齐后我会先给出明确方案，再继续下一步。
```

---

### 3. 高审美页面缺少初始蓝图

**触发条件**
- 页面属于 landing / 营销站 / 作品集 / 重设计类
- 尚无 `design-taste-frontend` 初始蓝图摘要

**动作**
- 停止进入最终页面实现
- 先补初始蓝图

**固定回复**

```text
当前页面属于高审美页面，但还缺少 `design-taste-frontend` 输出的初始蓝图，暂时不能直接进入最终实现。
请先补齐初始蓝图摘要后，我再继续进入页面实现。
```

### 4. 高审美页面未完成必要质检或专项优化

**触发条件**
- 还没有完成必要质检或页面实看复核
- 或已经审查，但还没按问题进入 `arrange / typeset / colorize / polish / animate / harden` 的必要专项优化

---

## 六、发布相关异常

### 1. 用户未明确确认是否发布

**触发条件**
- `workflow-deliver.sh` 已完成
- 用户还没有明确回复 `发布` 或 `不发布`

**动作**
- 不调用任何发布脚本
- 固定追问一次

**固定回复**

```text
当前项目已验收通过，是否立即发布当前构建包？请回复“发布”或“不发布”。
```

---

### 2. 同步发布失败且异步降级也失败

**触发条件**
- `workflow-record-publish.sh <slug> publish` 执行失败
- `project-publish.sh` 未写出 `published` 或 `queued`

**动作**
- 不回滚已完成的交付
- 记录 `Publish Gate = Fail`
- 告知当前需要稍后重试或人工介入

**固定回复**

```text
当前项目交付已完成，但本次发布没有成功。
我已经记录发布失败，不会回滚已有交付结果。
请稍后重试发布，或检查 `./config.js` 中的发布接口与参数配置。
```

---

### 3. 发布已入队，但缺少轮询地址

**触发条件**
- 发布结果为 `queued`
- `.webgen/checks/publish.json` 中没有 `pollUrl`

**动作**
- 不伪造轮询地址
- 保留 `queued / Pass`
- 提示后续只能人工跟踪，或补齐 `statusUrlField`

**固定回复**

```text
当前构建包已进入发布队列，但项目内没有可用的轮询地址，暂时不能继续自动追踪状态。
请检查 `./config.js` 中的 `publish.statusUrlField` 是否与远端返回字段一致，或改为人工跟踪这个发布任务。
```

---

### 4. 发布队列轮询失败

**触发条件**
- `project-publish-status.sh <slug>` 执行失败
- `publish.json` 中已有 `pollUrl`

**动作**
- 不覆盖已有 `queued` 状态
- 保留上次发布结果
- 提示稍后重试轮询

**固定回复**

```text
当前发布任务仍在追踪中，但这次轮询没有成功。
我会保留现有的排队状态，不覆盖之前的发布记录。
请稍后重新执行 `sh scripts/project-publish-status.sh <slug>`，或检查远端轮询接口是否可达。
```

**动作**
- 不得直接宣称品质完成或进入最终交付
- 先完成体检与对应专项优化

**固定回复**

```text
当前页面还没有完成完整的设计体检与专项优化，我不能直接把它视为合格交付物。
下一步必须先做：
- 执行页面体检或页面实看复核
- 根据问题进入 `arrange / typeset / colorize / polish / animate / harden` 的对应优化环节
```

### 5. 基础验证已过，但设计验收未完成

**触发条件**
- 页面已经 build / preview 通过
- 但还没有完成页面实看设计复核
- 或用户明确要求截图验收，但还没有完成对应 CDP 截图验收

**动作**
- 不得宣称“验证完成”或“交付完成”
- 先进入设计验收与优化回合

**固定回复**

```text
当前页面已完成基础验证，但设计验收还没完成，我不能直接宣称验证完成或交付完成。
下一步必须先做：
- 完成页面实看设计复核
- 如有问题，回到对应的 `arrange / typeset / colorize / polish / animate / harden` 环节继续优化并复验
- 若用户明确要求截图验收，再执行 CDP 访问与截图落盘；默认不做截图
```

**截图验收失败例外**

- 若用户明确要求截图验收，可执行一次 CDP 尝试
- 若该次尝试失败，则记为“截图验收已跳过”
- 不因截图验收失败卡住验证完成或交付完成

**固定回复**

```text
用户要求了截图验收，我已按规则执行一次 CDP 尝试。
本次 CDP 截图失败，现按规则记为“截图验收已跳过”，不再重复尝试。
页面仍以实际预览验证和页面实看设计复核结果作为交付依据。
```

## 六、脚手架与模板异常

### 1. scaffold 校验失败

**触发条件**
- 若按统一入口处理新项目，则前置命令应为：`sh scripts/project-session-entry.sh <slug> <sessionKey> new <template-id>`
- `sh scripts/project-verify-scaffold.sh <slug> <template-id>` 非 0

**动作**
- 停止继续页面开发
- 先恢复为合法脚手架

**固定回复**

```text
当前项目脚手架与模板不一致，已触发 scaffold 校验失败。
按规则不能继续在这个无效脚手架上开发。
需要先执行：sh scripts/project-session-entry.sh <slug> <sessionKey> new <template-id>
若只是单纯重建脚手架，也可直接执行：sh scripts/project-init.sh <slug> <template-id>
并重新运行：sh scripts/project-verify-scaffold.sh <slug> <template-id>
校验通过后再继续实现。
```

---

### 2. 模板能力与需求不匹配

**触发条件**
- 当前模板无法满足必需的运行时结构或能力
- 继续硬做会破坏模板约束

**动作**
- 不绕过模板手写新脚手架
- 反馈并改选模板或新增模板

**固定回复**

```text
当前需求与现有模板能力不匹配，继续在这个模板上硬改会破坏统一脚手架约束。
我不能绕过模板直接手写一套新结构。
请改选更合适的模板，或先补一个新的标准模板后再继续。
```

---

## 七、可恢复运行问题

### 1. 预览端口冲突

**触发条件**
- preview 启动时端口占用

**动作**
- 允许在同项目内继续排障
- 优先使用已有 `project-preview.sh` 的端口探测与 `preview-manager.sh` 治理能力

**对外说明模板**

```text
当前预览启动时遇到端口占用，我会先在当前项目内处理这个运行问题，不涉及跨项目风险。
优先会复用现有 preview 管理脚本清理冲突或切换候选端口，处理后再继续验证页面。
```

### 2. 构建失败 / 依赖缺失

**触发条件**
- `project-package.sh` 构建失败
- 本地依赖未安装或环境不满足

**动作**
- 允许在当前项目内排障
- 但需要如实告知失败点与下一步修复动作

**对外说明模板**

```text
当前问题属于本项目内部的运行/构建故障，不是 session 路由或项目归属问题。
我会继续在当前项目内排查失败原因，并给出具体的修复结果或明确 blocker。
```

---

## 八、引用关系

处理异常时，优先参考以下文档：

- 全局规则：`AGENTS.md`
- 路由与脚本协议：`docs/session-routing-and-project-commands.md`
- 标准消息模板：`docs/webgen-routing-message-templates.md`
- 本手册：`docs/webgen-session-error-handling.md`

如果出现新型异常，优先按本手册的结构补充，而不是把处理方式散落在临时对话里。
