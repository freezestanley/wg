---
name: "webgen-page-design-gate"
description: "重构设计流程：design-taste-frontend 出初始蓝图，Impeccable 审查与专项优化；teach-impeccable 属于 skills/impeccable 内部流程。"
---

# 更新目标
将页面设计流程统一调整为以下顺序，并要求写入相关设计流程文档：

1. **生成初始蓝图（design-taste-frontend 主导）**
   - 使用 `design-taste-frontend` 先生成视觉独特的页面蓝图、布局骨架、层级方案与微交互方向。
   - 典型提示词示例：
     - “使用 design-taste-frontend 的方式，生成一个视觉独特的 HTML 布局。我喜欢大胆的非对称布局和印象深刻的微交互。”
2. **全面质量审查（Impeccable /audit）**
   - 对初始方案或首版页面执行一次 `impeccable audit`，做专业体检。
   - 审查内容覆盖：可访问性、响应式、性能、视觉层级、信息节奏、交互反馈、边缘情况。
3. **精准精雕细琢（Impeccable 专项优化）**
   - 根据 `audit` 报告，按问题类型调用专项能力：
     - `/arrange`：修复页面各模块的间距和视觉节奏
     - `/typeset`：优化字体层级、行高、阅读舒适度与信息清晰度
     - `/colorize`：将凭直觉的颜色替换为更科学、更和谐的配色方案
     - `/polish`：处理最后的细节微调，确保交付物精致度
     - `/animate`：为特定交互增添恰到好处的动效
     - `/harden`：处理边缘情况，保证在各种设备和场景下稳定运行
4. **记住风格（teach-impeccable）**
   - 在项目推进过程中，如风格方向逐渐稳定，应允许在 `skills/impeccable` 体系内使用 `teach-impeccable` 记录风格与设计原则，作为后续迭代的长期约束。

# 规则要求
- 高审美页面仍保留：最终宣称“验证完成”前，必须完成页面实看设计复核；CDP 截图验收默认关闭，只有用户明确要截图时才执行。
- 默认主导者改为 `design-taste-frontend` 负责初始蓝图。
- `Impeccable` 成为默认的质量审查与专项优化主轴。
- `teach-impeccable` 视为 `skills/impeccable` 内部的风格沉淀步骤，不单独脱离该体系描述。
- 相关主流程、设计指南、速查表、路由模板、错误处理文档都应反映这一流程。

# 推荐流程文案
对高审美页面，默认流程心智改成：

**先由 `design-taste-frontend` 产出初始蓝图，再用 `impeccable audit` 做全面体检，然后根据问题调用 `arrange / typeset / colorize / polish / animate / harden` 做专项优化；风格稳定后在 `skills/impeccable` 体系内用 `teach-impeccable` 记住风格；最终必须完成页面实看设计复核，只有用户明确要求截图时才追加 CDP 截图验收。**
