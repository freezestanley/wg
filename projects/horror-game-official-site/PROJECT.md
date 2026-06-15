# horror game official site

## 项目摘要

- `slug`：`horror-game-official-site`
- 模板：`vite-page`
- 模式：**单页面游戏官网**
- 技术栈：Vite + 原生 HTML/CSS/JS + Canvas 粒子 + Lucide CDN

## 当前目标

- 交付一个高冲击力、可预览、可构建的恐怖游戏品牌官网首页。
- 当前已完成首版实现、构建与预览验证，可继续做素材替换或二轮打磨。

## 已拟定方案

- 游戏名：`RITE OF EMBERS`
- 页面定位：AAA 恐怖游戏电影化官网首页
- 主要板块：Hero / 卖点 / 世界观 / 怪物阵营 / 媒体截图 / 平台 CTA / Footer
- 设计档位：强化版
- 视觉方向：黑、深红、焦橙、余烬、烟雾、故障感、宗教仪式感
- 素材策略：纯前端视觉 + 自拟文案 + 占位媒体画面
- API 策略：无真实 API，CTA 为展示入口
- 适配策略：PC / Pad / H5 全覆盖，移动端弱化重型特效但保留氛围

## Readiness Gate

- Discovery：已完成，待用户显式确认
- Assets：可用占位策略继续
- API：无需阻塞
- Preview：已具备模板能力
- Reuse Decision：已确认采用模板 + 自定义实现
- Adaptation：已明确断点与触控策略

## Ready / Not Ready

- 当前状态：`Implemented / Verified`

## Blockers

- 暂无硬阻塞
- 仍缺少真实素材与真实 CTA 链接，因此当前为占位演示版

## 预览方式

- 开发：`pnpm dev`
- 构建：`pnpm build`

## 关联文档

- [DISCOVERY.md](./DISCOVERY.md)
- [ASSETS.md](./ASSETS.md)
- [API.md](./API.md)
- [HANDOFF.md](./HANDOFF.md)

## 最近进展

- 已完成项目初始化与 session lock
- 已完成 `RITE OF EMBERS` 单页首页实现
- 已落地火焰粒子背景、3D 纵深视觉、滚动 reveal、卡片 tilt、分层视差与 CTA 反馈
- 已完成 `pnpm install`、`pnpm build`、预览启动与脚手架复核
