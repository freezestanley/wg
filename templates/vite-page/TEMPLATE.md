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
- landing / 营销站 / 作品集 / 重设计类页面，进入最终实现前必须先写 `Design Read`、`DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`，并声明 `Atmosphere Layer`
- 复杂或大需求，默认先走 `superpowers` 规划，再拆成多个子任务推进

## 模板定位

这个模板是运行脚手架，不是默认交付设计。

它的目标是提供一个稳定、中性、可替换的单页起点：

- 有稳定的 Vite 挂载链路
- 有可选的 preview shell
- 有响应式安全容器
- 有最基本的交互状态示例
- 有明确的页面替换槽位

默认模板页只能承担“脚手架占位”职责，不能把自己的文案语气、版式偏好、色彩个性带进最终项目交付。
默认构建产物不启用 preview shell；仅在本地调试时通过 `?previewShell=1` 打开辅助壳层。

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

## 设计执行链

- 写任何页面代码前，先产出一行 `Design Read`
- 再确定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- 再声明 `Atmosphere Layer`：`none / subtle / signature`
- 将 `Design Read`、三档位结论与 `Atmosphere Layer` 写入 `DISCOVERY.md`
- 再补一页“审版检查点”：首屏焦点、证明区、内容节奏、CTA 收口、移动端首屏优先级
- 先做首版页面骨架，再进入实际预览验证
- 完成基础验证后，再做一次页面实看设计复核
- 若页面属于交付级页面，必须至少完成一轮设计优化后再收口

## 老板审版五问

- 首屏 3 秒内，能不能看出这页在卖什么 / 讲什么 / 让用户做什么？
- 页面有没有唯一视觉焦点，而不是每个区块都在抢戏？
- 证明区是否足够可信：案例、数据、规格、信任背书是否成立？
- 内容节奏是否有起伏：不是一屏接一屏同构卡片？
- CTA 收口是否自然且明确，而不是模板式泛按钮？

以上 5 项不是建议项，而是生成页面前要落进 `DISCOVERY.md` 的硬检查；缺少这些结论时，不应直接进入页面实现。
进入设计复核前，页面源码还会继续经过反模式检查，默认额外拦截：缺少 Hero 价值说明、缺少首屏 CTA、泛文案 CTA、三等分卡片模板。

## 动画策略

- **轻量动效**（淡入、位移、缩放、数字滚动等）优先用 **anime.js**（已在 scaffold `index.html` 引入）。
- **复杂动画**（时间轴编排、ScrollTrigger 滚动驱动、SVG MorphSVG/MotionPath、Flip 布局过渡等）优先用 **GSAP**，并按具体场景路由：
  - `gsap-core`
  - `gsap-timeline`
  - `gsap-scrolltrigger`
  - React / Next 场景补 `gsap-react`
  - 上线前性能收口补 `gsap-performance`
- 当前模板不是 React 时，如需更有设计感的组件动效、按钮、卡片、文字、hover、spotlight、reveal 一类效果，可优先把 **React Bits** 当作**参考动效源**，先借鉴其效果意图，再用当前模板技术栈复刻；不要把它默认当作运行时依赖直接接入。
- 动画须尊重 `prefers-reduced-motion`，提供降级。
- 若存在火焰、粒子、原子、流体等背景持续特效，先在 `DISCOVERY.md` 标注 `Atmosphere Layer = subtle` 或 `signature`，再决定是否进入复杂动效实现。

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
