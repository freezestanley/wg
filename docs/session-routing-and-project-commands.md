# session routing 与项目命令实现

## 目标

把 `AGENTS.md` 中新增的全局规则落成可执行脚本，覆盖两类能力：

1. **项目命令**：初始化、脚手架校验、预览、停止预览、预览状态、打包、预览治理
2. **session 路由**：生成项目 sessionKey、保存 slug→sessionKey 映射、写入/校验 session-lock、生成 new/resume 路由 envelope

## 新增脚本

### 项目命令

- `scripts/project-guard.sh`
- `scripts/project-init.sh`
- `scripts/project-verify-scaffold.sh`
- `scripts/project-preview.sh`
- `scripts/project-preview-stop.sh`
- `scripts/project-preview-status.sh`
- `scripts/project-package.sh`
- `scripts/preview-manager.sh`

### session 路由

- `scripts/session-registry.sh`
- `scripts/session-key.sh`
- `scripts/session-lock.sh`
- `scripts/session-route.sh`

## 路由状态文件

- 项目内锁定文件：`projects/<slug>/.webgen/session-lock.json`
- workspace 级注册表：`.openclaw/webgen-session-registry.json`

## 常用命令

### 新项目 sessionKey

```sh
./scripts/session-route.sh new <slug>
```

### 已有项目恢复 sessionKey

```sh
./scripts/session-route.sh resume <slug>
```

### 生成发给项目 session 的 envelope

```sh
./scripts/session-route.sh envelope new <slug>
./scripts/session-route.sh envelope resume <slug>
```

输出示例：

```txt
sessionKey=agent:webgen:proj-demo-1a2b
mode=new
slug=demo
```

### 初始化项目

```sh
./scripts/project-init.sh <slug> vite-page
```

### 首次写入 session-lock

```sh
./scripts/session-lock.sh init <slug> <sessionKey>
```

### 检查 lock 是否匹配

```sh
./scripts/session-lock.sh check <slug> <sessionKey> resume:<slug>
```

### 预览与打包

```sh
./scripts/project-preview.sh <slug>
./scripts/project-preview-status.sh <slug> [--verbose]
./scripts/project-preview-stop.sh <slug>
./scripts/project-package.sh <slug>
zsh ./scripts/preview-manager.sh list
zsh ./scripts/preview-manager.sh pin <slug>
zsh ./scripts/preview-manager.sh unpin <slug>
zsh ./scripts/preview-manager.sh gc
```

- `workflow-report.sh` 与 `project-preview-status.sh` 默认输出短摘要，只有显式加 `--verbose` 才输出排障细节。
- `project-preview.sh` 启动前会自动做 `reap + gc + ensure-capacity`，优先回收旧预览、释放端口。
- `workflow-deliver.sh` 完成后默认只保留当前项目预览，其它未 pin 预览会自动关闭。

## 当前实现约定

### 1. new 路由

- `session-route.sh new <slug>` 会生成 `agent:webgen:proj-<slug>`
- 适用于全新项目

### 2. resume 路由

- `session-route.sh resume <slug>` 从 `.openclaw/webgen-session-registry.json` 读取已绑定 sessionKey
- 若 registry / lock 里还是旧的历史 key（包括非 `agent:webgen:proj-...` key，或带随机后缀的旧 `agent:webgen:proj-<slug>-<rand>` key），`session-route.sh resume` 会自动迁移为规范项目 key：`agent:webgen:proj-<slug>`，并同步回写 registry 与项目 lock
- 注册表在 `session-lock.sh init` 时自动回写

### 3. session-lock

`session-lock.sh check` 的语义：

- `LOCK_ABSENT`：当前项目还没有 lock
- `LOCK_MATCH`：slug 与 sessionKey 匹配，可按 resume 继续
- `LOCK_EXISTS_SAME`：同 slug 同 sessionKey，但 mode 是 `new`
- `LOCK_MISMATCH`：slug 不一致
- `LOCK_SESSION_MISMATCH`：slug 一致，但 sessionKey 不一致

## 已完成验证

已完成以下 smoke 验证：

1. 全部 shell/zsh 脚本通过语法检查
2. `project-init.sh` 能创建 `smoke-route-test`
3. `session-route.sh new` 能生成规范项目 sessionKey
4. `session-lock.sh init` 能写入 `.webgen/session-lock.json`
5. `session-registry.sh` 能记录 slug→sessionKey
6. `session-route.sh envelope resume` 能正确生成 `mode=resume:<slug>`
7. `session-lock.sh check` 能正确返回 `LOCK_MATCH`
8. `project-verify-scaffold.sh` 能通过脚手架一致性校验

## 调度协议（A + B 已补齐）

下面这套协议用于把脚本能力真正接到 agent 的调度行为里。

### 一、接待 / 调度 session 的职责

接待 session 指：
- `agent:webgen:main`
- 或任何不匹配 `agent:webgen:proj-*` 的 webgen 会话

它的职责只有一个：**识别任务并路由**。

#### 接待 session 处理 new 项目

1. 从用户需求中整理出 slug
2. 调用：

```sh
./scripts/session-route.sh envelope new <slug>
```

3. 解析输出，得到：
   - `sessionKey=agent:webgen:proj-<slug>`
   - `mode=new`
   - `slug=<slug>`
4. 用 `sessions_send(sessionKey=..., message=...)` 把完整需求投递给项目 session
5. 接待 session 自己**不写任何项目文件**

#### 接待 session 处理 resume 项目

1. 明确用户要续做的项目 slug
2. 调用：

```sh
./scripts/session-route.sh envelope resume <slug>
```

3. 从 `.openclaw/webgen-session-registry.json` 恢复历史 sessionKey
4. 得到：
   - `sessionKey=<已绑定 sessionKey>`
   - `mode=resume:<slug>`
5. 用 `sessions_send(sessionKey=..., message=...)` 投递增量需求

#### 接待 session 发消息时必须包含

```text
mode: new | resume:<slug>
slug: <project-slug>
项目 session 入场命令: sh scripts/project-session-entry.sh <slug> <sessionKey> <mode> [template-id]
```

以及：
- 完整需求
- 用户已提供的文案 / 图片 / 品牌资料
- API / 鉴权 / 代理信息
- 是否已有项目目录
- 交付要求
- 验证要求

---

### 二、项目 / 执行 session 的职责

项目 session 指：
- `agent:webgen:proj-<slug>` 这类会话

它的职责是：**验 lock → 建项目 / 续项目 → 实现 → 验证 → 交付**。

#### 项目 session 收到 `mode=new` 时

1. 读取消息中的 `slug`
2. 优先执行：

```sh
./scripts/project-session-entry.sh <slug> <sessionKey> new vite-page
```

3. 成功后进入 Discovery / 方案确认 / 实现阶段

#### 项目 session 收到 `mode=resume:<slug>` 时

1. 读取消息中的 `slug`
2. 优先执行：

```sh
./scripts/project-session-entry.sh <slug> <sessionKey> resume:<slug>
```

3. 成功后：
   - 再按需读 `PROJECT.md` / `HANDOFF.md` / `DISCOVERY.md` / `ASSETS.md` / `API.md`
   - 继续项目迭代
4. 若失败：拒绝写入，要求回到正确 sessionKey

---

### 三、推荐消息 envelope 结构

#### new

```text
mode: new
slug: demo-brand-site

任务目标：新建一个品牌落地页
输入资料：……
实现约束：……
交付要求：……
验证要求：……
```

#### resume

```text
mode: resume:demo-brand-site
slug: demo-brand-site

任务目标：继续迭代这个项目
工作目录：projects/demo-brand-site
输入资料：……
实现约束：……
交付要求：……
验证要求：……
```

---

### 四、脚本与协议的对应关系

| 能力 | 脚本 |
|---|---|
| 生成新 sessionKey | `session-route.sh new` |
| 生成恢复 sessionKey | `session-route.sh resume` |
| 生成路由 envelope | `session-route.sh envelope` |
| 记录 slug→sessionKey | `session-registry.sh set` |
| 读取 slug→sessionKey | `session-registry.sh get` |
| 写入项目 lock | `session-lock.sh init` |
| 校验 lock | `session-lock.sh check` |
| 新建项目 | `project-init.sh` |
| 校验 scaffold | `project-verify-scaffold.sh` |
| 启动预览 | `project-preview.sh` |
| 查询预览状态 | `project-preview-status.sh` |
| 停止预览 | `project-preview-stop.sh` |
| 查看预览总表 | `preview-manager.sh list` |
| 固定保留预览 | `preview-manager.sh pin` |
| 取消固定预览 | `preview-manager.sh unpin` |
| 回收过期预览 | `preview-manager.sh gc` |
| 打包构建 | `project-package.sh` |

---

### 五、实际接入建议

后续如需让 agent 真正自动路由，直接按下面顺序接：

#### 接待 session
1. 识别 `new` 或 `resume`
2. 运行 `session-route.sh envelope ...`
3. 解析 `sessionKey / mode / slug`
4. 调用 `sessions_send(sessionKey=..., message=...)`

#### 项目 session
1. 收到消息先提取 `mode / slug`
2. 运行 `session-lock.sh check ...`
3. `new`：`project-init.sh` + `session-lock.sh init`
4. `resume`：先跑 `project-session-entry.sh`，再按需补读项目文档续做
5. 实现后走 preview / verify / package

---

### 六、页面实现相关约束跳转入口

本文件负责 session 路由与项目命令，不重复展开页面设计规范本体。项目 session 通过 lock 检查、准备进入 Discovery / 方案 / 实现时，按下面入口跳转。

#### 1. 想看页面设计完整规范

看：`docs/webgen-design-guide.md`

适用问题：
- 页面方案最少应包含什么
- `Design Read` 与三档位如何落
- `impeccable` / `gsap-*` 应如何调用
- 响应式、配图、默认 CDN、交付验收怎么做

#### 2. 想快速判断页面方向

看：`docs/webgen-design-cheatsheet.md`

适用问题：
- 当前任务是转化型、品牌型还是工具型
- 动效、配图、响应式如何快速判断
- 开工前最后该检查哪些项

#### 3. 想确认模板默认能力

看：`templates/vite-page/TEMPLATE.md`

适用问题：
- 当前唯一模板默认带什么能力
- 模板的 CDN、动画、配图、适配要求是什么
- 哪些约束属于模板级默认

#### 4. 想确认硬约束优先级

看：`AGENTS.md`

重点位置：
- `SO-001`：方案确认门
- `SO-004`：Discovery 重新收集
- `SO-007`：配图与图片素材策略
- `SO-008`：默认资源策略
- `SO-009`：`Design Read`、taste-skill 与 `superpowers` 规划策略

---

### 七、项目 session 进入实现前的最小检查

当项目 session 通过 `session-lock.sh check` 之后，进入真正实现前，至少再确认以下事项：

1. 已读取：
   - `PROJECT.md`
   - `DISCOVERY.md`
   - 按需补读 `HANDOFF.md` / `ASSETS.md` / `API.md`
2. 若为 landing / 营销站 / 作品集 / 重设计类：
   - 已形成一行 `Design Read`
   - 已确定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
   - 已写回 `DISCOVERY.md`
3. 若任务复杂或范围较大：
   - 已先走 `superpowers` plan
   - 已拆成多个子任务，而不是直接整页闷头实现
4. 若涉及真实配图：
   - 已确认用户是否提供素材
   - 已确认是否允许线上图库
   - 已明确真实图失败时是否退化为 SVG
   - 选用图最终要写入 `ASSETS.md`
5. 若要使用浏览器侧资源：
   - 默认优先用既定 CDN 资源
   - 偏离默认资源策略时必须说明原因
6. 方案未获明确确认前：
   - 不进入页面业务代码实现

这样可以把“路由成功”与“实现合规”分开，避免项目 session 通过了 lock 之后仍然跳过设计门槛直接开工。
