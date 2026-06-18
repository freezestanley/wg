# Projects Root Config Design

**目标**

- 将项目根目录从固定的 `workspace/projects` 改为 `config.js` 可配置。
- 支持配置为 `~/claw-workspace`。
- 支持把现有 `workspace/projects/*` 一并迁移到新目录。

**现状摘要**

- 多个脚本直接把项目根写死为 `$WORKSPACE_ROOT/projects`。
- `config.js` 当前只承载 `preview` 和 `publish` 配置，没有路径层。
- 测试也默认项目目录固定在 `workspace/projects`。

**设计结论**

1. 新增 `config.js -> paths.projectsRoot` 作为唯一配置入口。
2. 新增统一路径脚本 `scripts/webgen-paths.sh`，负责：
   - 读取 `paths.projectsRoot`
   - 展开 `~`
   - 将相对路径解析为相对 `workspace` 的绝对路径
   - 提供 `projects-root` / `project-root <slug>` 查询
3. 所有核心脚本不再直接拼接 `workspace/projects`，统一走 `webgen-paths.sh`。
4. 新增迁移脚本，把旧目录项目整体迁移到新目录。
5. 测试补齐“配置后 project-init / project-guard / preview-manager 走新目录”的覆盖。

**兼容策略**

- 未配置 `paths.projectsRoot` 时，默认仍回退到 `workspace/projects`。
- 可通过环境变量 `WEBGEN_PROJECTS_ROOT` 临时覆盖。

**风险**

- 旧测试若直接写死 `workspace/projects` 会失效，需要同步改成读取统一路径。
- 迁移真实目录时若存在运行中的 preview，需要先停掉相关进程后再移动。

**实施后状态**

- 新项目默认进入 `~/claw-workspace/<slug>`。
- 旧项目迁移后仍保留原有 `.webgen`、workflow、preview 配置结构。
