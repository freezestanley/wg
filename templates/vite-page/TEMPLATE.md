# vite-page 模板

## 目标

这个模板用于创建 **单页面** 项目，默认支持：

- 本地 Vite 预览
- 开发期 `/api` 代理远端接口
- 浏览器侧 CDN 优先资源
- 后续打包交付
- 全程使用 JavaScript，不使用 TypeScript
- 页面中引用的入口、模块和配置文件均应为 `.js`
- 设计与实现默认要求兼顾 `PC / Pad / H5` 三类设备
- 生成前必须先确认断点、触控热区、Pad 横竖屏和 H5 首屏重点
- landing / 营销站 / 作品集 / 重设计类页面，进入最终实现前必须先写 `Design Read` 和 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- 复杂或大需求，默认先走 `superpowers` 规划，再拆成多个子任务推进

## 默认资源策略

优先使用以下公共 CDN：

- Axios
  `https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js`
- Tailwind CSS
  `https://cdn.tailwindcss.com`
- Lucide
  `https://unpkg.com/lucide@latest`
- Web Awesome CSS
  `https://ka-f.webawesome.com/webawesome@3.8.0/styles/webawesome.css`
- Web Awesome loader
  `https://ka-f.webawesome.com/webawesome@3.8.0/webawesome.loader.js`
- anime.js（页面轻量动效）
  `<script src="https://cdn.jsdelivr.net.cn/npm/animejs/dist/bundles/anime.umd.min.js"></script>`
  使用：`const { animate } = anime;`

只有在项目既有体系、性能、合规或用户明确要求时，才偏离上述默认资源策略。

## 设计品味策略

- 所有 landing page / 营销站 / 作品集 / 重设计类页面，最终实现前必须先读取 `design-taste-frontend`
- 写任何页面代码前，先产出一行 `Design Read`
- 再确定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- 将 `Design Read` 与三档位结论写入 `DISCOVERY.md`

## 动画策略

- **轻量动效**（淡入、位移、缩放、数字滚动等）优先用 **anime.js**（已在 scaffold `index.html` 引入）。
- **复杂动画**（时间轴编排、ScrollTrigger 滚动驱动、SVG MorphSVG/MotionPath、Flip 布局过渡等）优先用 **GSAP**，并按具体场景路由：
  - `gsap-core`
  - `gsap-timeline`
  - `gsap-scrolltrigger`
  - React / Next 场景补 `gsap-react`
  - 上线前性能收口补 `gsap-performance`
- 动画须尊重 `prefers-reduced-motion`，提供降级。

## API 代理

- 开发期本地请求统一优先走 `/api`
- `vite.config.js` 负责将 `/api` 转发到远端目标
- 项目级目标地址后续统一写入 `.webgen/config.json`

## 素材约定

- Logo、图片、品牌色和字体需在实现前完成确认
- 用户提供图片时优先使用用户素材
- 用户明确允许线上找图时，优先真实图片，找不到再退化为 SVG 占位
- 默认图库源：Unsplash、Pexels、Pixabay、Shopify / Burst
- 所有选用图的 URL、用途、状态都要写入 `ASSETS.md`
- 外链图片上线前必须校验可用，预览阶段确认无破图
- 若依赖外网热链，交付时必须说明；要求自托管时再下载进项目资产目录

## 复用优先

- 组件优先复用 Web Awesome 或其它成熟开源组件
- 对简单功能，只有在复用收益不足时才自定义编码

## 适配要求

- 默认适配技能为 `adapt`
- 页面不能只做桌面布局缩放，必须明确 `PC / Pad / H5` 的信息重排策略
- 默认最小触控热区不小于 `44px`
- 不允许把核心功能仅绑定在 hover 交互上
- H5 首屏默认优先露出标题 / 价值点、主 CTA、关键首图或关键状态
