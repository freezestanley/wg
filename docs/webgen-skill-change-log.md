# webgen skill 方案与草稿改动记录

> 约定：后续涉及方案、草稿、协议、入口设计等变更，统一记录到 `docs/` 目录下。

## 2026-06-14

### 事项
创建并应用 `/webgen` skill，作为其他 agent 调用常驻 `webgen` agent 的统一入口。

### 本次方案要点
- `/webgen` skill 的目标是让其他 agent 直接把网页相关任务路由给常驻 `webgen` agent。
- 首阶段先做“统一委派入口”，不急于一次性做复杂透传。
- 适用范围包括：
  - 网页生成
  - 页面改版/迭代
  - 本地预览与联调
  - API 代理或 mock
  - 打包交付
- 推荐默认通过 `sessions_send(agentId: "webgen", ...)` 调用常驻 `webgen`。
- 后续可扩展为透传方案，包括：
  - 标准化入参
  - 附件/上下文/工作目录透传
  - 结构化结果回传
  - 持续会话复用约定

### 本次改动记录
- 已创建 skill proposal：`webgen-20260614-fb01cdc2e5`
- 已应用 proposal：`webgen-20260614-fb01cdc2e5`
- 当前状态：`applied`

### memory 修复记录
- 当前 `webgen` 环境缺少 OpenAI provider 的 API key，导致默认 memory embeddings provider 无法启动。
- 已在全局 `openclaw.json` 中为 `agents.defaults.memorySearch` 显式设置：`provider: "none"`。
- 这样会关闭向量 embeddings 依赖，改为可用的 FTS-only memory recall，优先恢复 `memory_search` 可用性。
- 若后续需要更高质量语义检索，可再配置专用 embeddings provider 后重建 memory index。

### 页面设计指南记录
- 已新增 `docs/webgen-design-guide.md`
- 内容包含：
  - 页面实现约束
  - Icon 统一规则（默认只用 Lucide）
  - 动效技术选型规则（Anime.js / Motion / GSAP / Three.js）
  - 已安装 skill 的职责分工
  - 页面设计标准流程
  - 交付前检查清单
- 已继续增强为更可执行的操作手册，新增：
  - 登录页 / Landing Page / Dashboard 专用规则
  - 默认执行顺序
  - 禁止项与降级规则
- 已把该指南接入 `AGENTS.md`，作为 `webgen` 默认遵循的页面设计约定。
- 已新增演示项目：`demos/h5-login/`

### session 路由与项目命令记录
- 已新增 `scripts/` 命令集，覆盖：
  - `project-init.sh`
  - `project-guard.sh`
  - `project-verify-scaffold.sh`
  - `project-preview.sh`
  - `project-preview-stop.sh`
  - `project-preview-status.sh`
  - `project-package.sh`
  - `preview-manager.sh`
- 已新增 session 路由脚本：
  - `session-registry.sh`
  - `session-key.sh`
  - `session-lock.sh`
  - `session-route.sh`
- 已新增文档：
  - `docs/session-routing-and-project-commands.md`
  - `docs/webgen-routing-message-templates.md`
  - `docs/webgen-session-error-handling.md`
  - `docs/webgen-ops-index.md`
- 已把 `/webgen` skill 从“仅统一委派入口”继续补强为：
  - 默认先进 `agent:webgen:main` 调度 session
  - new 项目走 `session-route.sh envelope new <slug>`
  - resume 项目走 `session-route.sh envelope resume <slug>`
  - 项目 session 收到 `mode / slug` 后优先执行 `project-session-entry.sh <slug> <sessionKey> <mode> [template-id]`
- 已继续把 `AGENTS.md` 的 SO-003b / SO-005 / SO-006 直接绑定到具体脚本命令：
  - 调度必须走 `session-route.sh envelope new|resume`
  - 项目 session 写前默认走 `project-session-entry.sh`
  - 新项目默认由 `project-session-entry.sh ... new ...` 统一触发 `project-init.sh` + `project-verify-scaffold.sh`
- 已新增统一索引入口：`docs/webgen-ops-index.md`
- 已把 `skills/webgen/SKILL.md` 补强为调用方 SOP，覆盖：
  - 何时该委派给 webgen
  - 如何判断 new / resume
  - 调用方最小字段集
  - 失败与重试 SOP

### session 路由 legacy key 兼容修复
- 发现 `resume` 路由会盲信 registry 中历史遗留的非 `proj-` sessionKey，导致项目已切到规范 `proj-<slug>` session 后，旧项目仍可能被错误路由回 legacy `subagent:` session。
- 已修复 `scripts/session-route.sh`：
  - `resume` / `envelope resume` 发现 legacy key 时，会自动规范化为 `agent:webgen:proj-<slug>`
  - legacy 范围包含旧的非 `agent:webgen:proj-*` key，以及历史随机后缀 key
  - 同步回写 `.openclaw/webgen-session-registry.json`
  - 同步更新 `projects/<slug>/.webgen/session-lock.json`
  - 保留 `migratedFromSessionKey` 与 `migratedAt` 供排查
- 目标：让续做路由优先回到规范项目 session，避免 `LOCK_SESSION_MISMATCH` 假性冲突。

### 后续记录约定
后续凡是以下内容，优先补充到 `docs/` 下：
- 方案草稿
- 协议草案
- 调用约定
- 输入/输出格式
- 关键设计取舍
- 版本迭代说明

## 2026-06-15

### 事项
继续把 `webgen` 的页面设计规范从“原则型文档”升级为“可执行规则”，并同步到 agent 硬约束、速查表、模板说明与模板元信息。

### 本次方案要点
- 把页面设计相关规则分成三层维护：
  - `AGENTS.md`：硬约束与违规处理
  - `docs/webgen-design-guide.md`：完整规则、流程、模板、验收
  - `docs/webgen-design-cheatsheet.md`：快速判断与开工前检查
- 新增“规则优先级”，明确：
  - `AGENTS.md`
  - 项目自身约束
  - `webgen-design-guide.md`
  - 已安装 skill 建议
- 明确 `impeccable` 为单入口、多子命令模型，不再把它当成笼统的“润色技能”。
- 明确 `gsap-*` 为 skills 组，按：
  - `gsap-core`
  - `gsap-timeline`
  - `gsap-scrolltrigger`
  - `gsap-react`
  - `gsap-performance`
  路由使用。
- 新增配图与图片素材策略：
  - 用户图优先
  - 用户明确同意后才允许线上图库
  - 真实图优先，找不到再退化为 SVG
  - 所有图片 URL 必须校验并写入 `ASSETS.md`
- 新增默认浏览器侧 CDN 资源策略：
  - Axios
  - Tailwind CSS
  - Lucide
  - Web Awesome
  - anime.js
- 新增 `Design Read` 与三档位要求：
  - `DESIGN_VARIANCE`
  - `MOTION_INTENSITY`
  - `VISUAL_DENSITY`
  - 结论必须写入 `DISCOVERY.md`
- 明确复杂或大需求默认先走 `superpowers` plan，再拆分成多个子任务。

### 本次改动记录
- 已更新 `AGENTS.md`：
  - 新增配图与图片素材策略、默认资源策略、taste-skill 与 `superpowers` 规划策略
  - 新增 `SO-007`、`SO-008`、`SO-009`
  - 最终交付自检门新增：
    - 配图校验与 `ASSETS.md` 记录
    - `DISCOVERY.md` 中的 `Design Read` 与三档位检查
- 已更新 `docs/webgen-design-guide.md`：
  - 新增规则优先级
  - 新增方案默认输出模板
  - 新增响应式量化标准与交付硬性验收项
  - 修正 `impeccable` / `gsap-*` 调用模型
  - 新增 3 类页面方案模板：
    - Landing Page
    - Dashboard / 工具后台
    - 登录 / 表单页
  - 新增默认资源策略、配图策略、图片交付校验要求
- 已更新 `docs/webgen-design-cheatsheet.md`：
  - 同步规则优先级
  - 同步方案必含项
  - 同步 GSAP 路由
  - 同步配图速判与响应式硬指标
  - 同步开工前 `Design Read`、图片校验、自定义资源偏离检查
- 已更新 `templates/vite-page/TEMPLATE.md`：
  - 同步 `Design Read`
  - 同步默认 CDN 资源
  - 同步真实配图策略
  - 同步 GSAP 路由与 `prefers-reduced-motion`
  - 同步 `superpowers` 规划要求与 H5 首屏要求
- 已更新 `templates/vite-page/template.json`：
  - 移除笼统的 `gsap-skills`
  - 改为显式 skills：
    - `design-taste-frontend`
    - `impeccable`
    - `frontend-design`
    - `gsap-core`
    - `gsap-timeline`
    - `gsap-scrolltrigger`
    - `gsap-react`
    - `gsap-performance`
    - `superpowers:brainstorming`
    - `superpowers:writing-plans`
    - `superpowers:verification-before-completion`
- 已更新 `templates/vite-page/scaffold/index.html` 注释，去掉旧的 `gsap-skills` 泛称。

### 模板现状修正记录
- 发现 `AGENTS.md` 中仍写有 `templates/demo-site`，但当前工作区实际只存在：
  - `templates/vite-page`
- 已将模板说明修正为当前真实状态，避免 agent 选择到不存在的模板。

### 本次收口结论
- 当前 `webgen` 的页面规范已经从“只讲原则”升级为：
  - 有硬约束
  - 有执行模板
  - 有量化验收
  - 有模板层同步
- 后续若新增模板，必须同步以下 4 处，避免口径再次漂移：
  - `AGENTS.md`
  - `docs/webgen-design-guide.md`
  - `docs/webgen-design-cheatsheet.md`
  - 模板目录自身 `TEMPLATE.md` / `template.json`

## 2026-06-17

### 事项
把交付后的发布链路补成可执行命令，并补齐异步降级与轮询追踪。

### 本次方案要点
- 发布链路不再只停留在 SOP 文档，已落成实际脚本：
  - 用户明确回复 `发布` 才进入发布
  - 用户明确回复 `不发布` 记 `Publish Gate = Exception-Pass`
- 发布配置统一从 workspace 级 `./config.js` 读取，避免脚本写死接口路径和字段名。
- 同步上传失败时，允许自动降级异步请求；异步受理成功后记 `queued / Pass`。
- 若异步发布进入队列，后续可用独立脚本轮询状态并回写结果。

### 本次改动记录
- 已新增脚本：
  - `scripts/project-publish.sh`
  - `scripts/workflow-record-publish.sh`
  - `scripts/project-publish-status.sh`
- 已扩充 `./config.js` 发布配置：
  - `publish.endpoint`
  - `publish.timeoutMs`
  - `publish.fileField`
  - `publish.metadataField`
  - `publish.asyncFallback`
  - `publish.asyncFlagField`
  - `publish.statusUrlField`
- 已把 `publish` 状态接入：
  - `workflow-init.sh`
  - `workflow-set-gate.sh`
  - `workflow-transition.sh`
  - `workflow-report.sh`
  - `workflow-sync-docs.sh`
  - `workflow-announce-status.sh`
  - `project-context-summary.mjs`
  - `project-resume-context.sh`
- 已补文档入口：
  - `docs/session-routing-and-project-commands.md`
  - `docs/webgen-ops-index.md`

### 验证记录
- `node --test tests/template-scaffold-context-load.test.mjs`
- 结果：`30/30` 通过

### 额外修复
- 修正了一条旧的 preview 回归测试隔离问题：
  - `project preview enforces capacity by stopping stale unpinned previews before launch`
  - 原因是复用全局 `preview-registry.json` 时受残留条目污染
  - 现已改为测试内备份并恢复 registry，只保留本用例相关条目
