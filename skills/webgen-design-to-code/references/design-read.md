# Design Read Reference

## 必填字段

- `Design Read`
- `DESIGN_VARIANCE`
- `MOTION_INTENSITY`
- `VISUAL_DENSITY`
- `Atmosphere Layer`

## 档位定义

### DESIGN_VARIANCE

- `low`
  - 保守、稳定、设计变化小
- `medium`
  - 在常见结构上做明确差异化
- `high`
  - 布局、节奏、视觉语言都有明显个性

### MOTION_INTENSITY

- `low`
  - 基础转场、轻 hover、轻 reveal
- `medium`
  - 明显 section reveal、滚动联动、数值动效
- `high`
  - 强叙事滚动、pin、scrub、分层时序动画

### VISUAL_DENSITY

- `low`
  - 留白多、信息稀疏、节奏舒展
- `medium`
  - 信息与留白平衡
- `high`
  - 信息密度高、视觉刺激强、层次多

### Atmosphere Layer

- `none`
  - 无额外氛围层
- `subtle`
  - 轻背景纹理、轻渐变、轻光影
- `signature`
  - 氛围层是页面识别点的一部分

## 输出写法

推荐压成一行或短列表：

```text
Design Read: 海洋、热烈、滚动叙事、高冲击品牌感
DESIGN_VARIANCE: high
MOTION_INTENSITY: high
VISUAL_DENSITY: medium
Atmosphere Layer: signature
```

## 使用原则

- 档位必须服务实现，不是装饰
- 动效档位越高，越要同时写移动端降级策略
- 若页面是企业信息型而非强品牌表达，优先 `medium` 以下
