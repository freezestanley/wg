# WebGen Restructure Design

## 目标

这次重构只做两件事：

1. 把 `webgen` 从“过度治理的流程系统”收回到“稳定产出页面的项目 agent”。
2. 把默认模板从“开发说明页”升级成“可直接长成成品页的高质量起点”。

## 现状问题

### 1. 治理层过厚

当前工作区把大量约束堆进了：

- `AGENTS.md`
- `docs/webgen-sop-and-gates.md`
- `workflow-*` 脚本
- 模板文档

但这些约束里有一大部分并没有被真正自动执行，只停留在“规则描述”。结果是：

- 用户价值最高的页面设计与实现没有变强
- session / gate / delivery 的话语权反而越来越大
- 文档、脚本、模板之间逐步失配

### 2. 设计链路写成制度，没变成默认引擎

当前规范要求：

- `Design Read`
- `design-taste-frontend`
- `impeccable audit`
- CDP 设计验收

但默认模板却还是一个开发说明页，说明“设计约束”没有被落进最基础的产出链。

### 3. 模板起点太弱

`templates/vite-page` 的职责本来是“页面模版”。

现在它给的是：

- 技术说明
- 运行时说明
- 占位型布局

这会直接拉低所有新项目的第一版上限。

## 重构原则

### 1. 保留少数硬门

只保留真正有必要、且脚本能 enforce 的门：

- `Route Gate`
- `Session Gate`
- `Proposal Gate`
- `Implementation Gate`
- `Verification Gate`
- `Design Review Gate`

说明：

- `Scaffold` 不再作为对外强调的单独治理层，而是并入初始化/实现前检查
- `Asset Input` 不再单独维持复杂 gate，而是归入 Discovery 结果
- `Delivery Gate` 不再作为独立概念泛滥，交付由 `verification + design review + docs sync` 收口

### 2. 设计回路保留，但简化表达

不取消设计要求，只改成真正可执行的默认链：

1. Discovery 中形成 `Design Read`
2. 明确页面方向与三档位
3. 先出首版页面
4. 做实际预览验证
5. 做设计复核
6. 必要时再优化一轮

这里的重点是：

- 让设计流程进入模板与脚本默认路径
- 减少文档里的重复说教
- 不再把大量 skill 名称写成层层审批树

### 3. 模板必须像页面，不像说明书

新模板默认页应满足：

- 有明确品牌气质
- 有真实板块节奏
- 有响应式布局
- 有状态示例
- 有可继续扩展的结构

不能再是：

- “这是 starter page”
- “这里写页面业务代码”
- “runtime.refreshIcons”

## 目标结构

### 工作流阶段

简化为：

1. `routing`
2. `discovery`
3. `proposal`
4. `implementation`
5. `verification`
6. `design-review`

说明：

- `session-check`、`init` 仍然存在于动作层，但不再在所有面向用户的状态描述里反复强调
- `asset-api-sync` 从主流程里降级为实现阶段内动作

### 对外状态表达

项目文档只需要稳定回答 4 个问题：

1. 现在做到哪一步
2. 方案有没有确认
3. 页面有没有实际验证
4. 页面有没有完成设计复核

## 预期收益

### 对用户

- 页面默认起点更好
- agent 解释更短
- 项目推进更直观

### 对实现

- 文档和脚本更一致
- 规则更容易执行
- 更少“口头硬门，实际上没落地”

### 对设计质量

- 模板一开始就有更高审美基线
- 设计验收进入真正默认链路
- 减少 AI 占位页污染

## 本次落地范围

本次只改：

- `AGENTS.md`
- `docs/webgen-sop-and-gates.md`
- 若干 workflow 脚本
- `templates/vite-page/*`
- 相关模板文档

不做：

- 新增新的复杂 session 系统
- 新增新的框架模板
- 引入新的前端框架

## 验收标准

1. 主规范能用更少文字描述清楚主流程
2. workflow 脚本状态模型和规范一致
3. `vite-page` 默认页不再像开发说明页
4. 新模板具备更强的视觉起点
5. 构建与脚手架验证通过
