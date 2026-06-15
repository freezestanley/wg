# roman holiday movie

## 项目摘要

- `slug`：`roman-holiday-movie`
- 模板：`vite-page`
- 模式：**单页面项目**
- 技术栈：Vite + 原生 JS + Tailwind CDN + Lucide + Anime.js

## 当前目标

- 直接重做《罗马假日》专题页首版，重点完成视觉重塑、首屏构图升级、版式节奏重建与关键模块重排。

## Readiness Gate

- Discovery：已完成
- Assets：已按假设启动
- API：已确认当前不接入
- Preview：已确认使用 Vite
- Reuse Decision：已完成
- Adaptation：已完成

适配要求：

- 覆盖 `PC / Pad / H5`
- 断点：H5 `<768`，Pad `768-1023`，PC `>=1024`
- 触控热区不小于 `44px`
- hover 只作增强，不作为唯一交互入口
- 页面直接挂载到 `#app`，不恢复 Preview Shell

## Ready / Not Ready

- 当前状态：`Ready`

## Blockers

- 当前缺少授权海报、剧照、预告与官方观影入口
- 若需要更完整专题深度，后续还需补充角色、幕后、影史资料章节

## 预览方式

- 安装依赖：`pnpm install`
- 开发预览：`pnpm dev --host 127.0.0.1 --port 4294`
- 构建：`pnpm build`

## 关联文档

- [DISCOVERY.md](./DISCOVERY.md)
- [ASSETS.md](./ASSETS.md)
- [API.md](./API.md)
- [HANDOFF.md](./HANDOFF.md)

## 最近进展

- 已删除旧项目并用 `vite-page` 模板重建
- 用户明确要求直接开始，因此本轮跳过方案确认门，基于合理假设先做首版
- 已完成《罗马假日》专题页首版 redesign 页面实现
