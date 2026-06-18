# Code Output Contract

## 目标

让 skill 的输出可以直接交给 webgen 主流程执行，而不是变成泛泛建议。

## 输出必须包含

### 1. Design Summary

必须写：

- 页面目标
- Design Read
- 结构分区
- 视觉方向
- 动效与降级

### 2. Implementation Plan

必须写：

- 先做什么
- 后做什么
- 哪些部分独立实现
- 哪些部分最后收口

### 3. File Plan

必须写：

- 具体文件路径
- 新建还是修改
- 每个文件负责什么

### 4. Verification Checklist

必须写：

- build / preview
- 关键交互
- 响应式
- 状态补齐

## 输出风格

- 短
- 明确
- 面向执行
- 文件路径优先

## 禁止输出

- 长篇设计散文
- 反复回贴模板全文
- workflow / publish / session 规则源码
- 无法落盘的抽象口号

## 好的 File Plan 示例

```markdown
## File Plan
- 修改 `src/generated/page.js`：只做组装与挂载
- 新建 `src/generated/sections/hero.js`：首屏叙事区
- 新建 `src/generated/sections/proof.js`：信任背书区
- 新建 `src/generated/styles/page.css`：全局页面样式
- 新建 `src/generated/modules/motion.js`：GSAP 初始化与降级判断
```
