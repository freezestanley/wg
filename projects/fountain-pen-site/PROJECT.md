# fountain pen site

## 项目摘要

- `slug`：`fountain-pen-site`
- 模板：`vite-page`
- 模式：**单页面项目**
- 技术栈：Vite + 原生 JS + Tailwind CDN + Lucide
- 当前主题：高端钢笔 / 文具品牌展示站

## 当前目标

- 交付一个可预览的高质量钢笔品牌单页，覆盖 Hero、产品系列、品牌工艺、使用场景、CTA / 联系方式占位。

## Readiness Gate

- Discovery：已完成
- Assets：已通过合理假设降级
- API：静态占位，无阻塞
- Preview：待验证
- Reuse Decision：已确认模板复用 + 页面自定义
- Adaptation：已确认 PC / Pad / H5 策略

适配要求：

- 覆盖 `PC / Pad / H5`
- Hero、系列卡片、CTA 均保证触控可用
- hover 仅作增强，不影响触屏使用

## Ready / Not Ready

- 当前状态：`Ready`

## Blockers

- 无硬阻塞；真实品牌素材与联系方式后续可替换。

## 预览方式

- 开发：`pnpm dev`
- 构建：`pnpm build`

## 关联文档

- [DISCOVERY.md](./DISCOVERY.md)
- [ASSETS.md](./ASSETS.md)
- [API.md](./API.md)
- [HANDOFF.md](./HANDOFF.md)

## 最近进展

- 已完成项目初始化、session lock、Discovery。
- 即将完成首页视觉实现与本地验证。
