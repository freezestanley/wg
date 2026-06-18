# Page Splitting Reference

## 目标

避免把长页面一次性灌进单文件，降低生成风险、上下文负担和后续维护成本。

## 默认拆分

优先按下面层次拆：

1. `entry`
2. `sections`
3. `components`
4. `styles`
5. `modules`

## 推荐目录

```text
src/
  generated/
    page.js
    sections/
      hero.js
      story.js
      proof.js
      cta.js
    components/
      section-title.js
      stat-card.js
    styles/
      page.css
      hero.css
    modules/
      motion.js
      data.js
```

## 何时必须拆

出现以下任一情况就拆：

- 页面包含 4 个以上大 section
- 同时有长 HTML、长 CSS、长 JS
- 有滚动叙事或复杂动效
- 一次写入明显会很长

## 入口文件职责

入口文件只负责：

- 导入
- 组装
- 挂载

入口文件不要承担：

- 整页长模板
- 全部样式
- 全部动效逻辑

## section 文件职责

每个 section 只负责本区块：

- 结构
- 局部文案
- 局部类名
- 必要的 data hooks

## 禁止事项

- 禁止整页 HTML/CSS/JS 一次性灌入 `page.js`
- 禁止为了省步骤继续在过大的文件上追加长块
- 禁止在替换型任务中反复整段重读旧模板
