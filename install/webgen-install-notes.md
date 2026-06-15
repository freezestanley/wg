# webgen 迁移安装记录

> 目的：为了便于将 `webgen` 这个 agent 快速部署到其他机器上的 OpenClaw，所有“迁移前需要预先安装的内容、依赖、配置、初始化事项”统一记录在 `install/` 目录下。

## 2026-06-14

### webgen 本地安装项
- `/webgen` 这个 skill 不放在全局，放在 `webgen` agent 自己的 `workspace/skills/` 下。
- OpenClaw 配置中，需显式开启跨 agent / 跨 session 路由所需能力：
  - `tools.agentToAgent.enabled = true`
  - `tools.sessions.visibility = "all"`

### webgen 依赖 skill 本地安装项
- `impeccable`：已从手动下载目录中的 OpenClaw skill 子目录安装到 `webgen` 本地 skill 目录。
- `impeccable-uxui`：与 `impeccable` 高度重复，已确认不再保留。
- `taste-skill`：已安装到 `webgen` 本地 skill 目录。
- `superpowers`：已安装到 `webgen` 本地 skill 目录。
- `frontend-design`：已安装到 `webgen` 本地 skill 目录。
- `gsap-skills` 仓库内容已拆分安装到 `webgen` 本地 skill 目录，包含：
  - `gsap-core`
  - `gsap-frameworks`
  - `gsap-performance`
  - `gsap-plugins`
  - `gsap-react`
  - `gsap-scrolltrigger`
  - `gsap-timeline`
  - `gsap-utils`

### 本次安装结果
- 已成功安装到 `webgen` 本地：
  - `webgen`
  - `impeccable`
  - `taste-skill`
  - `superpowers`
  - `frontend-design`
  - `gsap-core`
  - `gsap-frameworks`
  - `gsap-performance`
  - `gsap-plugins`
  - `gsap-react`
  - `gsap-scrolltrigger`
  - `gsap-timeline`
  - `gsap-utils`
- 已移除相关全局副本，避免与“仅放在 webgen 下”的要求冲突。
- `impeccable-uxui` 已移除，避免与 `impeccable` 重复。
- GitHub 直接 clone 不稳定，但通过用户手动下载到本地目录后，已完成安装。

### 安装来源备注
- `https://github.com/pbakaus/impeccable`
  - 仓库根目录不是单一 OpenClaw skill 根目录
  - 实际使用其 `.agents/skills/impeccable/` 作为安装入口
- `https://github.com/greensock/gsap-skills`
  - 仓库根目录不是单一 skill 根目录
  - 实际按 `skills/` 下多个独立 skill 分别安装

### 说明
- `/webgen` skill 用作其他 agent 调用常驻 `webgen` agent 的统一入口。
- 迁移到新机器或新 OpenClaw 环境时，应确认 `/webgen` 及其依赖 skill 都安装在 `webgen/workspace/skills/` 下，而不是全局 managed skills 下。
- 同时必须确认 OpenClaw 已具备以下路由前置条件，否则 `SO-003b` 设计的“接待 session → 独立项目 session”会被当前环境限制降级：
  - `tools.agentToAgent.enabled = true`
  - `tools.sessions.visibility = "all"`
- 推荐初始化命令：
  - `openclaw config set tools.agentToAgent.enabled true --strict-json`
  - `openclaw config set tools.sessions.visibility '"all"' --strict-json`
- 若 GitHub 直连不稳定，可采用“先手动下载仓库，再从仓库内实际 skill 子目录安装”的方式。
- 后续若补充安装方式、依赖来源、自动化脚本、初始化顺序，也继续记录在 `install/` 目录下。
