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
验证要求：<至少要检查什么、是否必须做 CDP 页面验收>
补充说明：<是否允许基于合理假设先做一版>
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
验证要求：<至少要检查什么、是否必须做 CDP 页面验收>
```

---

## 二、项目 session 内部执行前检查模板

### 1. new 项目入场检查清单

```text
1. 提取 mode 与 slug
2. 优先执行：sh scripts/project-session-entry.sh <slug> <sessionKey> new vite-page
3. 若成功：继续
4. 写入/补齐 DISCOVERY.md
5. 若为高审美页面：先补 `design-taste-frontend` 初始蓝图摘要，再规划页面实看复核与专项优化路径
6. 进入方案确认门
```

### 2. resume 项目入场检查清单

```text
1. 提取 mode 与 slug
2. 优先执行：sh scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>
3. 若成功：继续
4. 再按需读 PROJECT.md / HANDOFF.md / DISCOVERY.md / ASSETS.md / API.md
5. 若涉及高审美页面，先检查是否已有 `design-taste-frontend` 初始蓝图摘要与页面复核 / 专项优化记录；缺失则先补
6. 继续方案迭代或实现
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
验证要求:
```

如果是 resume，额外建议带上：

```text
工作目录: projects/<slug>
```
