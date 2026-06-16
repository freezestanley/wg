# webgen 运维与调用索引

> 用途：给后续维护者、调度 agent、调用方 agent 一个单入口，快速定位 webgen 的规则、路由协议、消息模板、错误处理与脚本命令。

## 一、先看哪份文档

### 1. 想知道全局硬约束
看：`AGENTS.md`

适用问题：
- 什么时候不能直接开工
- 一个 session 为什么只能做一个项目
- 新项目为什么必须走模板
- 什么时候必须拒绝跨项目写入

### 1a. 想直接看 SOP 主流程与状态门模型
看：`docs/webgen-sop-and-gates.md`

适用问题：
- 当前主流程到底分几步
- 最小可执行 Gate 怎么对应
- 什么时候能开工，什么时候必须阻塞
- 页面完成后如何收口验证和设计复核

### 2. 想知道页面设计、配图、资源与验收规则
看：`docs/webgen-design-guide.md`

适用问题：
- 页面方案里最少要写哪些内容
- `Design Read` 和三档位怎么落
- 默认 CDN 资源策略是什么
- 真实配图什么时候能用，怎么校验
- `impeccable` / `gsap-*` 应该怎么调用
- 响应式、降级、交付前验收怎么做

### 3. 想快速做页面判断，不想通读完整规范
看：`docs/webgen-design-cheatsheet.md`

适用问题：
- 先问哪几件事
- 页面角色和设计拨盘怎么快速判断
- 动效库、配图、响应式怎么速判
- 开工前最后该检查什么

### 4. 想知道脚本和路由协议
看：`docs/session-routing-and-project-commands.md`

适用问题：
- `session-route.sh` / `session-lock.sh` / `project-init.sh` 分别干什么
- new / resume 的路由顺序是什么
- 项目 session 收到消息后先做什么
- 当前 session 被清空后，怎么从 `projects/` 恢复项目绑定

### 5. 想直接套消息模板
看：`docs/webgen-routing-message-templates.md`

适用问题：
- 接待 session 如何给项目 session 发 new 请求
- resume 请求消息怎么写
- 固定拒绝回复怎么说

### 6. 想统一处理异常 / 拒绝场景
看：`docs/webgen-session-error-handling.md`

适用问题：
- lock 冲突怎么回
- session 污染怎么回
- scaffold 失效怎么回
- 方案未确认但用户催开工怎么回

### 7. 想知道模板本身支持什么
看：`templates/vite-page/TEMPLATE.md`

适用问题：
- 当前唯一模板支持什么能力
- 模板默认 CDN、动画、配图、适配要求是什么
- 初始化后哪些约束是模板级默认，而不是临时约定

### 8. 想知道 `/webgen` skill 给调用方的 SOP
看：`skills/webgen/SKILL.md`

适用问题：
- 什么时候该委派给 webgen
- 怎么判断是 new 还是 resume
- 给 webgen 的消息最少应带哪些字段

### 9. 想看历史变更记录
看：`docs/webgen-skill-change-log.md`

适用问题：
- 这套协议是什么时候补的
- 最近新增了哪些脚本 / 文档
- 规则是怎样一步步收口的

---

## 二、最常见工作流

### 工作流 A：其他 agent 想把网页任务交给 webgen
1. 先看 `skills/webgen/SKILL.md`
2. 判断是 new 还是 resume
3. 若任务涉及页面规则，再看 `docs/webgen-design-cheatsheet.md`
4. 如需项目路由，看 `docs/session-routing-and-project-commands.md`
5. 套用 `docs/webgen-routing-message-templates.md`
6. 用 `sessions_send` 发给 webgen

### 工作流 B：接待 session 收到一个网页需求
1. 看 `AGENTS.md` 的 SO-003b
2. 若要快速判断页面方向，先看 `docs/webgen-design-cheatsheet.md`
3. 若当前 session 或 registry 已清空，先跑 `session-recover.sh list`
4. 运行 `session-route.sh envelope new|resume <slug>`
5. 按 `docs/webgen-routing-message-templates.md` 发消息
6. 若有异常，看 `docs/webgen-session-error-handling.md`

### 工作流 C：项目 session 收到投递消息
1. 看 `AGENTS.md` 的 SO-005 / SO-006
2. 优先跑 `project-session-entry.sh ...`
3. `new` → 自动完成 `project-init.sh` + `session-lock.sh init`
4. `resume` → 自动完成 lock 对账 + resume 短摘要
5. 若遇异常，看 `docs/webgen-session-error-handling.md`

### 工作流 D：项目 session 进入页面方案与实现
1. 先看 `AGENTS.md` 的 SO-001、SO-004、SO-007、SO-008、SO-009
2. 再看 `docs/webgen-sop-and-gates.md` 对照当前 stage / gate
3. 出方案前看 `docs/webgen-design-cheatsheet.md`
4. 需要完整规则时看 `docs/webgen-design-guide.md`
5. 若是 landing / 营销站 / 作品集 / 重设计类，先形成 `Design Read`、三档位和老板审版五问
6. 若复杂或大需求，先走 `superpowers` plan，再拆子任务
7. 若要用真实配图，把来源、用途、校验状态写入 `ASSETS.md`
8. 交付前按 `docs/webgen-design-guide.md` 的验收项收口

---

## 三、最关键脚本速查

| 能力 | 命令 |
|---|---|
| 生成 new 路由 envelope | `./scripts/session-route.sh envelope new <slug>` |
| 生成 resume 路由 envelope | `./scripts/session-route.sh envelope resume <slug>` |
| 列出可恢复项目 | `./scripts/session-recover.sh list` |
| 从 lock 恢复项目绑定 | `./scripts/session-recover.sh resume <slug>` |
| 强制重绑规范 sessionKey | `./scripts/session-recover.sh rebind <slug>` |
| 从 projects 重建 session registry | `./scripts/session-recover.sh rebuild-registry` |
| 检查项目 lock | `./scripts/session-lock.sh check <slug> <sessionKey> <mode>` |
| 初始化新项目 | `./scripts/project-init.sh <slug> <template-id>` |
| 项目 session 统一入场 | `./scripts/project-session-entry.sh <slug> <sessionKey> <mode> [template-id]` |
| 输出 resume 短摘要 | `./scripts/project-resume-context.sh <slug>` |
| 更新 Gate 状态 | `./scripts/workflow-set-gate.sh <slug> <gate> <status> [note]` |
| 输出 workflow 报告 | `./scripts/workflow-report.sh <slug> [--verbose]` |
| 校验 scaffold | `./scripts/project-verify-scaffold.sh <slug> <template-id>` |
| 启动预览 | `./scripts/project-preview.sh <slug>` |
| 查看预览状态 | `./scripts/project-preview-status.sh <slug> [--verbose]` |
| 停止预览 | `./scripts/project-preview-stop.sh <slug>` |
| 查看预览总表 | `zsh ./scripts/preview-manager.sh list` |
| 查看当前预览限制 | `zsh ./scripts/preview-manager.sh limits` |
| 固定保留预览 | `zsh ./scripts/preview-manager.sh pin <slug>` |
| 取消固定预览 | `zsh ./scripts/preview-manager.sh unpin <slug>` |
| 回收过期预览 | `zsh ./scripts/preview-manager.sh gc` |
| CDP 设计验收 | `./scripts/project-design-review.sh <slug>` |
| 页面反模式检查 | `node scripts/page-design-guard.mjs <project-root>` |
| 打包项目 | `./scripts/project-package.sh <slug>` |

---

## 四、最关键设计入口速查

| 场景 | 先看什么 |
|---|---|
| 需要完整页面设计规范 | `docs/webgen-design-guide.md` |
| 需要查看 SOP 主流程与 Gate 放行模型 | `docs/webgen-sop-and-gates.md` |
| 只想快速判断页面方向 | `docs/webgen-design-cheatsheet.md` |
| 需要看模板默认能力 | `templates/vite-page/TEMPLATE.md` |
| 需要确认真实配图与素材策略 | `AGENTS.md` 的 `SO-007` + `docs/webgen-design-guide.md` |
| 需要确认默认 CDN 与资源策略 | `AGENTS.md` 的 `SO-008` + `docs/webgen-design-guide.md` |
| 需要确认 `Design Read` / 设计执行链 / 规划流程 | `AGENTS.md` 的 `SO-009` + `docs/webgen-design-guide.md` |
| 需要确认生成前的设计硬检查 | `templates/vite-page/TEMPLATE.md` + `scripts/workflow-check.sh` |
| 需要查变更背景 | `docs/webgen-skill-change-log.md` |

---

## 五、推荐阅读顺序

### 给调用方 agent
1. `skills/webgen/SKILL.md`
2. `docs/webgen-design-cheatsheet.md`
3. `docs/webgen-routing-message-templates.md`
4. `docs/webgen-session-error-handling.md`

### 给 webgen 接待 session
1. `AGENTS.md`
2. `docs/webgen-design-cheatsheet.md`
3. `docs/session-routing-and-project-commands.md`
4. `docs/webgen-routing-message-templates.md`
5. `docs/webgen-session-error-handling.md`

### 给 webgen 项目 session
1. `AGENTS.md`
2. `docs/webgen-sop-and-gates.md`
3. `docs/webgen-design-guide.md`
4. `templates/vite-page/TEMPLATE.md`
5. `docs/session-routing-and-project-commands.md`
6. `docs/webgen-session-error-handling.md`

---

## 六、维护约定

后续如果再新增：
- 新脚本
- 新拒绝口径
- 新路由协议
- 新模板消息
- 新 SOP
- 新设计规范
- 新模板约束
- 新配图 / 资源策略

优先同步更新两处：
1. 对应主题文档
2. 本索引 `docs/webgen-ops-index.md`

这样可以保证后续维护者不用在多个文档里盲找入口。
