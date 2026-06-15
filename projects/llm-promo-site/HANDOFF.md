# Handoff

## 当前状态

- 大模型宣传官网首版已完成实现，待最终验证与交付打包。

## 最近改动

- 初始化 `vite-page` 模板并写入 session lock。
- 完成 `DISCOVERY.md / PROJECT.md / ASSETS.md / API.md`。
- 重写 `src/generated/page.js`，实现完整单页官网。
- 页面已包含 Hero、核心能力、应用场景、模型能力展示、生态、FAQ、CTA。
- 已补齐 `Loading / Empty / Error / Active Feedback` 交互状态。

## 下一步

1. 执行本地构建验证。
2. 启动预览并检查页面是否正常展示。
3. 如需要，继续打包 `dist.zip` 交付。
4. 等待用户补充真实品牌资产后进入第二轮迭代。

## 预览命令

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`

## 打包说明

- 构建完成后可继续按项目打包脚本输出压缩交付物。

## 风险与注意事项

- 当前品牌名、数据、客户生态均为演示占位。
- 页面未接真实 API，也未使用真实客户 Logo / 实拍图。
- 若进入正式品牌版，优先替换文案、品牌视觉和部署说明。
