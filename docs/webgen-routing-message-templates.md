# webgen 标准调度消息模板

> 用途：给接待 / 调度 session、项目 / 执行 session 提供统一消息模板，减少 new / resume / lock 冲突时的自由发挥，避免协议漂移。

## 一、接待 session → 项目 session

### 1. 新项目投递模板

```text
mode: new
slug: <project-slug>
项目 session 入场命令: sh scripts/project-session-entry.sh <project-slug> <sessionKey> new vite-page

请处理一个新的网页项目。

任务目标：<一句话说明要做什么>
用户原始需求：<必要时粘贴原话>
输入资料：<文案 / 图片 / 参考站点 / 接口文档 / 附件>
实现约束：<原生/框架限制、兼容性、风格、动效、是否要代理>
设计要求：<是否属于高审美页面、是否需要 design-taste-frontend 生成初始蓝图、是否需要额外质检与专项优化>
交付要求：<要新增或修改什么、是否需要打包>
发布要求：<验收后是否需要追问发布、发布接口路径与上传字段参数统一从 ./config.js 读取>
验证要求：<至少要检查什么、是否要求页面实看复核、是否明确要求 CDP 截图验收>
补充说明：<是否允许基于合理假设先做一版>
```

默认实现补充约束：

```text
页面业务代码优先落 `src/generated/page.js`，样式优先落 `src/styles.css` 或拆分后的 `src/**` 模块。
禁止用 shell heredoc/python 直接写项目文件；若必须用 Python 辅助，路径只能通过 argv、环境变量或脚本参数传入，不得在 `<<'PY'` 中直接写 `$PROJECT_ROOT` 变量字面量。
```

宣传类可参考复用的 `设计要求` 示例：

```text
设计要求：采用 Scrollytelling（滚动叙事）方案，基于 GSAP + ScrollTrigger 实现(大模块or页面垂直,单模块可水平滚动)。页面沿“故事发现线”推进，叙事顺序如：故事开端 → 故事过程 → 故事里程碑 → 故事结尾。H5 端允许降级为顺序堆叠 + 轻量 reveal。
```

### 2. 已有项目续做模板

```text
mode: resume:<project-slug>
slug: <project-slug>
项目 session 入场命令: sh scripts/project-session-entry.sh <project-slug> <sessionKey> resume:<project-slug>

请继续这个网页项目。

任务目标：<这次要继续改什么>
工作目录：projects/<project-slug>
当前约束：<延续既有项目约束>
新增资料：<本轮新增文案 / 图片 / 接口改动>
设计要求：<是否涉及高审美改版、是否需要重做 design-taste-frontend 初始蓝图、是否需要额外质检与专项优化>
交付要求：<这次需要产出什么>
发布要求：<验收后是否需要追问发布、发布接口路径与上传字段参数统一从 ./config.js 读取>
验证要求：<至少要检查什么、是否要求页面实看复核、是否明确要求 CDP 截图验收>
```

默认实现补充约束：

```text
页面业务代码优先落 `src/generated/page.js`，样式优先落 `src/styles.css` 或拆分后的 `src/**` 模块。
禁止用 shell heredoc/python 直接写项目文件；若必须用 Python 辅助，路径只能通过 argv、环境变量或脚本参数传入，不得在 `<<'PY'` 中直接写 `$PROJECT_ROOT` 变量字面量。
```

宣传类页面续做可直接复用的 `设计要求` 示例：

```text
设计要求：本轮改版采用 Scrollytelling（滚动叙事）方向，基于 GSAP + ScrollTrigger 重做页面节奏。沿“创立初心 → 设计哲学 → 里程碑 → CTA 收口”组织章节，Pad / H5 端按需降级，避免强保桌面级重滚动编排。
```

---

## 二、项目 session 内部执行前检查模板

### 1. new 项目入场检查清单

```text
1. 提取 mode 与 slug
2. 优先执行：sh scripts/project-session-entry.sh <slug> <sessionKey> new vite-page
3. 若成功：继续
4. 先看 `.webgen/context-summary.txt` 与 `.webgen/discovery-gap.txt`
5. 按 gap 一次补齐 `DISCOVERY.md` 全部缺口，不要逐轮试错
6. 若为高审美页面：先补 `design-taste-frontend` 初始蓝图摘要，再规划页面实看复核与专项优化路径
7. 进入方案确认门
```

### 2. resume 项目入场检查清单

```text
1. 提取 mode 与 slug
2. 优先执行：sh scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>
3. 若成功：继续
4. 先看 `.webgen/context-summary.txt` 与 `.webgen/discovery-gap.txt`
5. 只有 gap 指向的缺口才再按需读 `DISCOVERY.md`，不要默认整篇重读
6. 若涉及高审美页面，先检查是否已有 `design-taste-frontend` 初始蓝图摘要与页面复核 / 专项优化记录；缺失则先补
7. 继续方案迭代或实现
```

---

## 三、固定拒绝回复模板

### 1. session 污染 / slug 不一致

```text
当前 session 已锁定项目 `<locked-slug>`，检测到这次请求对应的是其它项目 `<incoming-slug>`。
我不能在这个 session 内继续写入，以免跨项目串线。
请改为把请求路由到对应项目 session，或为新项目生成新的 project sessionKey。
```

### 2. new 模式但 lock 已存在

```text
当前项目 `<slug>` 已经存在，并且该 sessionKey 已绑定到这个项目。
这次请求标记为 `mode: new`，与现有 lock 冲突。
请改用 `mode: resume:<slug>`，或为新的项目生成一个新的 project sessionKey。
```

### 3. resume 模式但 sessionKey 不匹配

```text
当前请求想恢复项目 `<slug>`，但进入的 sessionKey 与该项目已绑定的 sessionKey 不一致。
为避免串项目，我不能继续写入。
请使用 registry 中记录的原 sessionKey 重试。
```

### 4. scaffold 校验失败

```text
当前项目脚手架与模板不一致，已触发 scaffold 校验失败。
按规则不能继续在这个无效脚手架上开发。
需要先执行：sh scripts/project-init.sh <slug> <template-id>
并重新运行：sh scripts/project-verify-scaffold.sh <slug> <template-id>
校验通过后再继续实现。
```

---

## 四、接待 session 对用户的转述模板

### 1. 已路由到项目 session

```text
已把这个需求路由到独立项目 session 开始处理。
接下来我会按项目进度同步：先做信息收集与方案确认；如果属于高审美页面，还会先出初始蓝图、做全面体检和专项优化，再进入实现、验证与设计验收。
```

### 2. 已识别为已有项目续做

```text
已识别这是已有项目的续做请求，正在把需求投递回原项目 session。
接下来会沿用原项目上下文继续迭代，不会新开重复项目。
```

### 3. 因缺少 slug 或项目归属不明而需澄清

```text
我还不能安全路由，因为当前无法确定这是新项目还是已有项目续做。
请补充以下至少一项：
- 目标项目 slug
- 现有项目目录
- 或明确说明“这是一个全新项目”
```

### 4. 验收通过后的发布确认模板

```text
当前项目已验收通过，是否立即发布当前构建包？请回复“发布”或“不发布”。
```

约束：

- 用户未明确回复 `发布`，不得进入发布阶段
- 发布接口路径与上传字段参数由 `./config.js` 提供，不在消息模板里写死

### 5. 发布已入队后的调度播报模板

```text
当前构建包已提交到发布队列，发布任务已受理。
我会继续按队列状态跟进；如果后续需要主动轮询，会使用项目内记录的发布状态信息继续查询。
```

适用条件：

- `workflow-record-publish.sh <slug> publish` 结果为 `queued`
- `Publish Gate` 已记为 `Pass`
- `.webgen/checks/publish.json` 中已有 `jobId / pollUrl`

### 6. 发布轮询完成后的调度播报模板

```text
发布队列状态已更新：当前构建包已发布完成。
如果需要，我可以继续同步最终发布地址或后续回归检查结果。
```

适用条件：

- `project-publish-status.sh <slug>` 结果更新为 `published`

### 7. 发布轮询仍在排队的调度播报模板

```text
发布任务仍在队列处理中，当前还没有最终发布结果。
如需继续追踪，我会基于项目内记录的轮询地址再次查询。
```

适用条件：

- `project-publish-status.sh <slug>` 结果仍为 `queued`

---

## 五、推荐最小字段集

无论是 new 还是 resume，推荐至少携带：

```text
mode:
slug:
任务目标:
输入资料:
实现约束:
设计要求:
交付要求:
发布要求:
验证要求:
```

如果是 resume，额外建议带上：

```text
工作目录: projects/<slug>
```
