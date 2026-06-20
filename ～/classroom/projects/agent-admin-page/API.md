# API

## 输入素材总览

- API 文档：未提供
- 数据样例：未提供
- 鉴权资料：未提供
- 代理/Mock 约束：已确认当前可先 mock

## 接口目标

- 当前首版不接真实接口，目标为展示 Agent 管理页交互与信息架构

## Base URL

- 预留 `/api`
- 真实远端地址待后续提供

## 鉴权方式

- 待后续补充

## Endpoint 清单

- `GET /api/agents`：获取 Agent 列表（预留）
- `GET /api/agents/:id`：获取 Agent 详情（预留）
- `POST /api/agents/:id/toggle`：启停 Agent（预留）
- `POST /api/agents`：新增 Agent（预留）

## 代理约定

- 开发期默认使用 `/api`
- 当前页面使用本地 mock 数据
- 后续提供接口文档后再切换到 vite proxy

## Blocking

- 当前状态：`Not Blocking`
- 缺少 API 契约是否阻塞最终实现：否，当前可先交付 mock 版本

## 执行状态

- Proposal Gate：`Pass`
- Verification Gate：`Pending`
- Design Review Gate：`Pending`

## 复用决策

- 请求层沿用模板内 `src/lib/api.js`
- 暂不引入额外 SDK
