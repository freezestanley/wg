---
name: "webgen-design-to-code"
description: "把网页需求从设计决策推进到可落地代码方案。凡是用户要求生成或重做 landing page、营销站、作品集、品牌页、专题页，且任务重点在 Design Read、页面结构拆分、视觉方向、动效策略、响应式方案、以及最终代码如何拆文件落盘时，都应使用这个 skill。即使用户只说“做个官网”“重设计这个页面”“把设计变成代码”，也要触发。遇到 session 路由、preview 管理、publish 上传、workflow gate 推进时，不使用本 skill，交回 webgen 主流程。"
---

# webgen-design-to-code

这个 skill 只处理“设计到代码”这一段，不接管 session、workflow、preview、publish。

## 适用范围

- landing page
- 营销站
- 作品集
- 品牌页
- 专题页
- 已有页面的重设计

## 不适用范围

- session 路由、锁定与恢复
- Gate 推进与 workflow 状态变更
- preview 端口治理
- publish 上传与轮询
- 后端 API 编排与服务端实现

## 输入约束

先读最小输入，禁止默认读全文：

1. `.webgen/context-summary.txt`
2. `.webgen/discovery-gap.txt`
3. 当前要改文件的局部窗口
4. 只有确有必要时，再窄读 `DISCOVERY.md` 对应段落

如果已经拿到足够摘要，停止继续读长文档。

## 必读参考

按需读取，不要全读：

- 设计档位：`references/design-read.md`
- 拆分规则：`references/page-splitting.md`
- 响应式规则：`references/responsive-policy.md`
- 代码输出契约：`references/code-output-contract.md`

## 工作流程

### 1. 形成设计实现摘要

先把输入压成短摘要，只保留：

- 页面目标
- 受众与场景
- 结构分区
- 视觉方向
- 动效策略
- 响应式策略
- 风险与降级

### 2. 形成 Design Read

必须给出：

- `Design Read`
- `DESIGN_VARIANCE`
- `MOTION_INTENSITY`
- `VISUAL_DENSITY`
- `Atmosphere Layer`

档位定义见 `references/design-read.md`。

### 3. 生成代码拆分计划

先决定文件怎么拆，再决定代码怎么写。

优先拆成：

- 入口文件
- `sections`
- `components`
- `styles`
- `modules`

禁止把长页面一次性灌进单文件。详细规则见 `references/page-splitting.md`。

### 4. 生成实现顺序

默认顺序：

1. 页面骨架
2. 主 section
3. 样式层
4. 动效与交互
5. 状态补齐
6. 响应式收口

### 5. 生成验证清单

至少覆盖：

- 构建或运行是否通过
- 页面是否能访问
- 核心交互是否正常
- `PC / Pad / H5` 是否覆盖
- `Loading / Empty / Error / Active Feedback` 是否补齐

## 输出格式

每次必须只输出这 4 段，禁止散写：

```markdown
## Design Summary
- ...

## Implementation Plan
- ...

## File Plan
- ...

## Verification Checklist
- ...
```

要求：

- 每段保持短而可执行
- 优先写文件路径、模块边界、实现顺序
- 不回贴长文档、长模板、长脚本源码

## 硬约束

1. 长文档全文最多读取一次
2. 读后立刻摘要化
3. 后续只准窄读
4. 大页面先拆再写
5. 默认补齐核心交互状态
6. 默认覆盖 `PC / Pad / H5`
7. 动效要写明移动端降级策略

## 质量标准

好的输出应满足：

- 设计方向清楚，不空泛
- 文件拆分明确，可直接落盘
- 不把 workflow / publish 混进来
- 不依赖反复读取旧模板全文
- 能直接被 webgen 主流程接走执行

## 示例

**示例 1：**

输入：`做一个冲浪板品牌官网，要有海洋氛围和滚动叙事。`

输出应体现：

- 海洋 / 高冲击 / 叙事型 `Design Read`
- Hero / Story / Product / Proof / CTA 结构
- GSAP ScrollTrigger 的使用边界
- 移动端弱化 pin / scrub
- 页面拆成多个 section 文件

**示例 2：**

输入：`把现有 SaaS 官网首页重设计，但不要改 session、preview、publish 流程。`

输出应体现：

- 只负责设计到代码
- 明确要改的页面文件
- 不触碰 workflow 与发布链路
