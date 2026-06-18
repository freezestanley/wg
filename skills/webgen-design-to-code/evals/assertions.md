# webgen-design-to-code Eval Assertions Draft

## 目标

这批断言只验证 skill 是否把“设计到代码”稳定抽出来，不评价最终页面视觉好坏。

## 通用断言

### A1. 输出格式完整

必须同时出现以下 4 段：

- `Design Summary`
- `Implementation Plan`
- `File Plan`
- `Verification Checklist`

失败信号：

- 缺任一段
- 用自由散文替代固定结构

### A2. 明确给出 Design Read 档位

必须出现：

- `Design Read`
- `DESIGN_VARIANCE`
- `MOTION_INTENSITY`
- `VISUAL_DENSITY`
- `Atmosphere Layer`

失败信号：

- 只写模糊视觉描述
- 缺档位字段

### A3. 有代码拆分计划

必须给出明确文件边界，至少体现以下之一：

- `sections`
- `components`
- `styles`
- `modules`

失败信号：

- 只说“实现页面”
- 没有文件路径或拆分层次

### A4. 有响应式策略

必须覆盖：

- `PC`
- `Pad`
- `H5`

失败信号：

- 只写“响应式适配”
- 没提 Pad 或触屏替代

### A5. 有状态补齐意识

必须显式提到以下至少 3 个：

- `Loading`
- `Empty`
- `Error`
- `Active Feedback`

失败信号：

- 完全没有交互状态设计

### A6. 不混入 workflow 范围外内容

输出中不应把以下内容当作本 skill 的职责：

- session 路由
- preview 端口治理
- publish 上传
- workflow gate 推进

失败信号：

- 把发布、preview、session lock 写进主方案

## 逐题强化断言

### Eval 1：冲浪板品牌 landing page

额外要求：

- 应体现海洋 / 品牌叙事 / 强 CTA
- 应提及 GSAP 或滚动叙事策略
- 应提及移动端滚动降级

### Eval 2：作品集首页重设计

额外要求：

- 应明确这是“只做设计到代码”
- 不应触碰 session / preview / publish
- 应写出现有页面的改造边界

### Eval 3：SaaS 官网首页升级

额外要求：

- 应明确状态补齐策略
- 应兼顾品牌升级与信息清晰度
- 应给出响应式和文件拆分方案
