# webgen 设计决策速查表

> 用途：让 `webgen` 在接到页面任务时，快速完成设计判断，不必每次通读完整指南。

## 0. 配套关系

- 入口硬约束看：`AGENTS.md`
- 需要完整规则与理由时看：`docs/webgen-design-guide.md`
- 本文只负责“快速决策”，不替代完整规范

推荐顺序：
1. 先看 `AGENTS.md` 确认硬约束
2. 再用本速查表快速做设计判断
3. 需要展开时再回 `docs/webgen-design-guide.md`

规则优先级：
1. `AGENTS.md`
2. 当前项目自己的品牌 / 组件 / 接口约束
3. `docs/webgen-design-guide.md`
4. 已安装 skill 的建议与偏好

默认资源策略：
- Axios：`cdn.jsdelivr.net`
- Tailwind CSS：`cdn.tailwindcss.com`
- Lucide：`unpkg.com/lucide@latest`
- Web Awesome：`ka-f.webawesome.com`
- anime.js：`cdn.jsdelivr.net.cn`
- 仅当项目既有体系、性能、合规或用户指定要求时再偏离

## 1. 先问这 8 件事

默认高质量页面设计流程速记：
1. 在 `DISCOVERY.md` 写 `Design Read`
2. 定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
3. 定 `Atmosphere Layer`：`none / subtle / signature`
4. 回答“老板审版五问”
5. 先做首版页面骨架与视觉方向
6. 做一次实际预览验证
7. 做一次页面实看设计复核，必要时再优化一轮

老板审版五问：
- 首屏 3 秒能否看懂主题与主行为？
- 是否只有一个主焦点？
- 证明区是否可信？
- 内容节奏是否避免同构重复？
- CTA 收口是否明确？

开工前硬检查：
- 上面 5 项必须写进 `DISCOVERY.md`
- 缺少这些结论时，不应直接进入页面实现

进入设计复核前再补一层：
- 页面源码应通过反模式检查
- 默认至少检查 Hero、Proof、CTA、三等分卡片反模式
- 额外检查 Hero 是否缺价值说明 / 首屏 CTA，以及 CTA 文案是否过泛

1. 这是新页面还是旧页面改版？
2. 页面目标是什么：转化 / 展示 / 品牌 / 效率 / 叙事？
3. 面向谁？
4. 用户有没有现成文案、图片、接口、品牌规范？
5. 当前技术栈是什么？
6. 是否已有设计系统或现成样式体系？
7. 是否需要动效？强度多大？
8. 是否要求 `PC / Pad / H5` 全适配？

出方案时默认至少覆盖：
- 页面目标
- 目标用户 / 使用场景
- 主要板块与信息层级
- 设计拨盘：`DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- 氛围层：`Atmosphere Layer = none / subtle / signature`
- 配色 / 字体 / 图标方向
- 素材 / 文案 / 接口来源与缺口
- 技术实现与依赖策略
- 状态设计：`Loading / Empty / Error / Active Feedback`
- 响应式策略：断点、Pad 横竖屏、H5 首屏优先级、hover 替代
- 风险、假设、待确认项

若页面涉及真实配图，方案里再补：
- 用户是否已提供素材
- 是否允许线上图库
- 找图失败时是否接受 SVG 占位
- 是否接受外链 CDN 图片

---

## 2. 先定页面角色

### 转化型
关键词：清晰、可信、低阻力
- 弱化炫技
- 强化 CTA、信息层级、表单反馈
- 首屏 3 秒内读懂

### 品牌型
关键词：气质、记忆点、统一世界观
- 允许更强版式与材质表达
- 重点做 1 个记忆场景
- 不要全页到处抢戏

### 产品型 / SaaS
关键词：结构、反馈、效率
- 优先秩序和信息密度控制
- 少装饰，多状态反馈
- 动效以组件交互为主

### 叙事型
关键词：节奏、镜头感、滚动体验
- 允许 GSAP / ScrollTrigger
- 强调分段叙事和转场
- 必须提前设计移动端降级

### 工具后台型
关键词：可读、稳、快
- 高密度但不能乱
- 尽量减少卡片滥用
- 动效只做反馈和层级切换

---

## 3. 三个设计拨盘

默认基线：
- `DESIGN_VARIANCE = 8`
- `MOTION_INTENSITY = 6`
- `VISUAL_DENSITY = 4`

快速判断：

### 什么时候降低 DESIGN_VARIANCE
- 企业官网
- 登录页
- 后台工具
- 用户明确要求稳重、商务、保守

### 什么时候提高 DESIGN_VARIANCE
- 品牌页
- 创意展示页
- 用户明确要高级感、杂志感、记忆点

### 什么时候降低 MOTION_INTENSITY
- 表单页
- 工具页
- 移动端优先项目
- 低性能设备需兼容

### 什么时候提高 MOTION_INTENSITY
- Landing 首屏
- 叙事型官网
- 品牌展示与产品发布页

### 什么时候提高 Atmosphere Layer
- 需要烘托世界观或情绪
- Hero 本身承担叙事或发布会气质
- 用户明确要求火焰、粒子、原子、流体等持续背景特效

### 什么时候压低 Atmosphere Layer
- SaaS 工具页
- 表单 / 登录 / 配置类页面
- 内容可读性优先、移动端性能预算紧

### 什么时候提高 VISUAL_DENSITY
- Dashboard
- 数据面板
- 工具后台

### 什么时候降低 VISUAL_DENSITY
- 品牌官网
- 作品展示
- 高级感首页

---

## 4. 默认审美判断

### 默认流程分工
- 页面方向：`Design Read` + 三档位
- 氛围判断：`Atmosphere Layer`
- 首版骨架：页面实现本身
- 质量体检：`audit`
- 间距节奏：`arrange`
- 字体层级：`typeset`
- 配色重塑：`colorize`
- 细节收口：`polish`
- 动效增强：`animate`
- 稳定性加固：`harden`

### 要主动避免
- 居中大标题 + 按钮 + 三张等宽卡片
- 紫蓝 AI 发光风
- 泛滥渐变
- 泛滥玻璃拟态
- 泛滥重阴影
- 只靠超大标题制造高级感
- 无意义的装饰图标和假数据

### 优先使用
- 左文右图 / 分屏 / 错位 / 不等比布局
- 中性色底 + 单一强调色
- 留白、排版、比例、材质细节
- 轻阴影、内描边、弱分隔
- 一个强记忆点，而不是每区都在演

---

## 5. 版式速判

### 安全默认
- 容器：`max-w-[1400px]` / `max-w-7xl`
- 多列：优先 `Grid`
- 首屏全高：`min-h-[100dvh]`
- 移动端：`md` 以下回落单列

### 不建议
- `h-screen`
- 复杂 flex 百分比拼列
- 移动端保留桌面级错位结构

---

## 6. 排版速判

### 默认字体方向
- 高级 / 创意 / 品牌：`Geist / Outfit / Cabinet Grotesk / Satoshi`
- 工具 / SaaS：高质量无衬线 + 必要时搭配等宽数字

### 默认原则
- 正文宽度不超过 `65ch`
- 标题层级靠字重、间距、明度，不靠盲目放大
- Dashboard 禁止主界面 Serif
- 默认不把 `Inter` 当万能答案

---

## 7. 色彩速判

### 默认规则
- 1 个主强调色
- 饱和度受控
- 灰阶体系统一
- 不混冷暖灰逻辑

### 安全方向
- Zinc / Slate / Neutral 底色
- 搭一个明确强调色

### 默认禁用
- 紫蓝霓虹
- 多主色并列互抢
- 高饱和荧光按钮

---

## 8. 卡片与材质速判

### 什么时候用卡片
- 真的需要抬层级
- 真的需要形成独立操作域

### 什么时候别用卡片
- 只是为了显得“丰富”
- 高密度后台信息本来就该平铺组织

### 毛玻璃最少要有
- `backdrop-blur`
- 内描边
- 轻内阴影
- 受控透明度

---

## 9. 状态设计必补

任何可交互页面默认补齐：
- Loading
- Empty
- Error
- Active Feedback

速判规则：
- Loading 优先骨架屏
- Error 就地提示
- 表单错误放输入框下方
- 按钮点击要有按压反馈

---

## 10. 配图速判

- 优先用户提供图片,其次才去线上找图
- 真实图优先，找不到再用 SVG 占位
- 默认图库：Unsplash、Pexels、Pixabay、Shopify / Burst
- 外链图上线前必须校验可用，并写入 `ASSETS.md`

---

## 11. 设计 / 实现 / Taste 命令表

### 11.1 `design-taste-frontend`

| 命令 / skill | 类型 | 用途 |
|---|---|---|
| `design-taste-frontend` | 设计蓝图 | 生成初始蓝图、布局骨架、层级方案、微交互方向 |

补充：
- 这是高审美页面的默认起点
- 先出 `Design Read`，再定 `DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY`
- 不负责最终质量验收与专项收口

### 11.2 `frontend-design`

| 命令 / skill | 类型 | 用途 |
|---|---|---|
| `frontend-design` | 实现落地 | 把蓝图、结构约束、响应式策略转成真实前端页面与组件代码 |

补充：
- 在当前 webgen 流程里，`frontend-design` 更偏实现落地，不是最前置的审美蓝图 skill
- 适合接在 `design-taste-frontend` 与 `impeccable` 审查 / 优化结论之后

### 11.3 `impeccable` 命令表

| 命令 | 类别 | 用途 |
|---|---|---|
| `craft [feature]` | Build | 从方案到实现完整塑造一个功能 |
| `shape [feature]` | Build | 写代码前先规划 UX / UI |
| `init` | Build | 建立项目设计上下文与基础文档 |
| `document` | Build | 从现有项目代码生成 DESIGN 文档 |
| `extract [target]` | Build | 提取可复用 token / 组件为设计系统 |
| `critique [target]` | Evaluate | 做 UX / 设计评审与启发式打分 |
| `audit [target]` | Evaluate | 做 a11y / 性能 / 响应式 / 实现质量检查 |
| `polish [target]` | Refine | 最终交付前精修收口 |
| `bolder [target]` | Refine | 强化过于保守或平淡的设计 |
| `quieter [target]` | Refine | 降低过强、过吵、过刺激的表达 |
| `distill [target]` | Refine | 提纯结构，去掉冗余复杂度 |
| `harden [target]` | Refine | 补错误态、边界态、i18n、健壮性 |
| `onboard [target]` | Refine | 优化首用引导、空状态、激活路径 |
| `animate [target]` | Enhance | 增加有目的的动画与动效 |
| `colorize [target]` | Enhance | 优化与重塑配色系统 |
| `typeset [target]` | Enhance | 优化字体、层级、阅读体验 |
| `arrange [target]` / `layout [target]` | Enhance | 修 spacing、节奏、视觉层级；在 webgen 流程文案里统一记作 `arrange` |
| `delight [target]` | Enhance | 增加记忆点与人格化细节 |
| `overdrive [target]` | Enhance | 往更激进、更超常规方向推进 |
| `clarify [target]` | Fix | 优化文案、标签、错误提示 |
| `adapt [target]` | Fix | 适配不同设备与屏幕尺寸 |
| `optimize [target]` | Fix | 诊断和修复 UI 性能问题 |
| `live` | Iterate | 浏览器内做可视化变体迭代 |
| `pin <command>` | Manage | 把某个 impeccable 子命令单独 pin 成快捷入口 |
| `unpin <command>` | Manage | 取消 pin 的快捷入口 |
| `hooks <on\|off\|status|...>` | Manage | 管理设计检测 hook |

当前 webgen 默认最常用链路：
- `audit`
- `arrange（对应 impeccable 的 layout 能力）/ typeset / colorize / polish / animate / harden`
- 风格稳定后在 `skills/impeccable` 体系内用 `teach-impeccable`

### 11.4 `taste` 相关命令表

| 命令 | 用途 |
|---|---|
| `taste notifications --limit 5` | 查看高信号通知 |
| `taste feed --limit 3` | 快速看推荐 feed |
| `taste search "关键词"` | 搜 skill / 工作流 / 能力 |
| `taste skill @handle/name` | 读取某个 skill 详情 |
| `taste save @handle/name` | 保存并本地安装 skill |
| `taste unsave @handle/name` | 取消保存并移除本地安装 |
| `taste clone <skill> --name <new-name>` | 克隆别人的 skill 做 remix |
| `taste publish ./my-skill --tags a,b` | 发布自己的 skill |
| `taste steal <url>` | 把外部链接工作流转成可 remix 的 skill 起点 |
| `taste following` | 查看关注列表 |
| `taste followers` | 查看谁关注了你 |
| `taste follow <handle>` | 关注某个发布者 |

默认使用建议：
- 发现能力缺口、想找 workflow、想找更好工具时，先用 `taste`
- `taste` 是能力市场，不是页面实现主流程的一环

## 12. 动效选型速查

### Anime.js
适合：轻入场、小交互、小强调

### Motion
适合：React 组件状态切换、布局转场、现代 UI 动效

### GSAP
适合：滚动叙事、时间线、多元素联动
路由：
- `gsap-core`：基础补间
- `gsap-timeline`：时间线编排
- `gsap-scrolltrigger`：滚动驱动
- `gsap-react`：React / Next 生命周期与 cleanup
- `gsap-performance`：性能收口

### Three.js
适合：3D Hero、粒子、空间特效、沉浸式展示
- 背景元素特效，如：火星粒子燃烧飘动,logo或元素的粒子组成动画,流体动效,3D旋转特效等

### 硬规则
- 小交互：优先 Anime / Motion
- 滚动叙事：优先 GSAP
- React 里用 GSAP 默认补看 `gsap-react`
- 大滚动场景上线前补看 `gsap-performance`
- 3D 沉浸：优先 Three.js
- 不无原则混用多套动效库

---

## 13. 响应式速判

方案里必须明确：
- 断点策略
- 触控热区
- Pad 横竖屏
- H5 首屏信息优先级
- hover 在触屏设备的替代方式

默认要求：
- 核心操作不依赖 hover
- H5 首屏先露出关键信息
- 按钮和点击区域足够大
- `md` 以下优先单列安全布局

硬指标速判：
- 断点至少覆盖：H5 `<768px`、Pad `768-1279px`、PC `>=1280px`
- 触控热区默认不小于 `44 x 44px`
- 正文默认 `45ch - 65ch`，长文不超过 `75ch`
- H5 首屏默认要露出：标题或价值点、1 个主 CTA、关键首图或关键状态
- Pad 横竖屏都要验证，不能硬缩桌面布局
- 外链图片要确认无破图，交付时说明是否依赖外网 CDN

---

## 14. 什么时候切回完整指南

遇到以下情况，不要只看速查表，必须回到 `docs/webgen-design-guide.md`：
- 需要出正式方案
- 需要判断 skill 串联顺序
- 需要做动效技术选型
- 需要确认响应式与降级策略
- 需要交付前完整检查
- 需要更新设计规范本身

## 15. 开工前最后 10 秒检查

开工前快速问自己：
- 用户确认方案了吗？
- 是否明确了断点、状态、交互反馈和降级策略？
- 若用了 `impeccable` 或 `gsap-*`，调用是否已经细化到具体子命令 / skill？
- 若是 landing / 营销 / 作品集 / 重设计，`Design Read` 和三档位写了吗？
- 若要配图，用户是否明确同意线上找图，图片来源和校验策略清楚了吗？
- 页面角色清楚了吗？
- 结构是不是又落回 AI 默认模板了？
- 是否真的需要卡片、渐变、玻璃、重动效？
- 图标是否仍保持 Lucide 统一？
- 动效库选型是否过重？
- 移动端是否有明确降级方案？
- Loading / Empty / Error / Active 是否会补？
- 这版是否可运行、可预览、可交付？
- 是否能用一句话说明这页的记忆点是什么？
