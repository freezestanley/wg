# WebGen Context Load Reduction Design

## 背景

当前 webgen 在项目初始化、Gate 检查、脚手架校验、设计复核前后，会把过多模板内容、目录列表和重复状态读取带入上下文，导致单轮 token 快速膨胀，并触发 compaction 或重试。

## 根因结论

1. 模板脚手架过胖，`templates/vite-page/scaffold/` 混入了 `node_modules`、`dist`、`.webgen/artifacts` 等重资产。
2. Gate 失败后，agent 缺少轻量状态摘要入口，容易反复整篇读取 `DISCOVERY.md`、`PROJECT.md`。
3. 脚手架校验依赖遍历模板文件集合；模板越大，任何目录输出和校验结果都越重。

## 目标

- 缩小新项目模板复制体积。
- 让脚手架校验只关注必要文件。
- 提供可复用的轻量摘要，减少整篇文档重读。
- 保持现有 workflow / gate 行为不变，不重写主流程。

## 方案

### 1. 模板瘦身

从 `templates/vite-page/scaffold/` 移除以下不应进入项目初始骨架的内容：

- `node_modules/`
- `dist/`
- `.webgen/artifacts/`
- `.webgen/checks/design-review-cdp.json`
- `dist.zip`

保留最小可运行源码、配置、占位文档与运行时文件。

### 2. 轻量脚手架清单

新增 `templates/vite-page/scaffold-manifest.txt`，记录模板必须存在的相对路径。

`project-verify-scaffold.sh` 改为优先读取 manifest 校验，而不是默认遍历整个模板目录。这样可以：

- 固定校验集合
- 避免重资产目录进入校验结果
- 为后续模板扩展保留明确边界

### 3. 项目状态摘要脚本

新增轻量脚本，直接从项目文档和 `.webgen` 状态文件提取：

- 当前阶段
- Gate 状态
- `DISCOVERY.md` Ready 状态
- 是否缺少关键区块

输出只保留短摘要，供 agent 优先读取，减少整篇文档 read。

### 4. Gate 失败摘要化

在 `workflow-check.sh` 中保持原有 gate 逻辑，但把常见失败原因组织成更短、可复用的错误文本，让 agent 在 `DISCOVERY.md` 未 Ready 时先拿到摘要，而不是被迫重读整篇模板。

## 风险与边界

- 旧项目若依赖模板中误带入的 `node_modules` 或 `dist`，不受影响；这里只影响新初始化项目。
- `project-verify-scaffold.sh` 改成 manifest 后，新增脚手架文件时需要同步更新 manifest。
- 这次不改 OpenClaw 工具层的 token 注入行为，只处理 webgen 可控部分。

## 验证标准

1. 模板文件数显著下降，不再包含重资产目录。
2. 新增回归测试能证明 manifest 不包含 `node_modules` / `dist` / `.webgen/artifacts`。
3. `project-verify-scaffold.sh` 仍能通过现有轻量文件集校验。
4. 新的摘要脚本能在不读取整篇文档的前提下输出关键状态。
