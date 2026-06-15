# {{PROJECT_NAME}}

## 项目摘要

- `slug`：`{{PROJECT_SLUG}}`
- 模板：`vite-page`
- 模式：**单页面项目**
- 技术栈：Vite + CDN 优先浏览器资源

## 当前目标

- 用单页面形式完成页面实现、预览和交付。

## Workflow 状态

- 当前阶段：`routing`
- 方案确认：待确认
- 验证状态：待确认
- 交付状态：待确认

## Workflow 阶段流转

- `routing` → `session-check` → `init` → `discovery` → `proposal` → `implementation` → `asset-api-sync` → `verification` → `delivery`

## Gate 状态

- Route Gate：`Pending`
- Session Gate：`Pending`
- Scaffold Gate：`Pending`
- Discovery Gate：`Pending`
- Asset Input Gate：`Pending`
- Proposal Gate：`Pending`
- Implementation Gate：`Pending`
- Verification Gate：`Pending`
- Delivery Gate：`Pending`

## Readiness / Gate Summary

- Discovery：待确认
- Assets：待确认
- API：待确认
- Preview：待确认
- Reuse Decision：待确认
- Adaptation：待确认

适配要求：

- 至少覆盖 `PC / Pad / H5`
- 页面实现前必须完成 `DISCOVERY.md` 中的适配检查清单
- 如存在仅桌面可用的交互，必须在 Discovery 阶段显式记录替代方案

## Ready / Not Ready

- 当前状态：`Not Ready`

## Blockers

- 待补充项目级 blocker

## 预览方式

- 默认使用 `pnpm dev`
- 默认通过 `/api` 代理远端接口

## 关联文档

- [DISCOVERY.md](./DISCOVERY.md)
- [ASSETS.md](./ASSETS.md)
- [API.md](./API.md)
- [HANDOFF.md](./HANDOFF.md)

## 最近进展

- 项目模板待初始化；初始化后进入 Discovery 与输入素材收集。
