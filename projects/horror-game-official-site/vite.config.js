import { defineConfig } from "vite";
import zipPack from 'vite-plugin-zip-pack';
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8787";
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || "4173");


export default defineConfig({
  server: {
    host,
    port,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  },
    plugins: [
    zipPack({
      // 源目录（相对于项目根目录）
      inDir: 'dist',
      // 输出的 ZIP 文件名（相对于项目根目录或 outDir）
      outDir: '.',
      outFileName: 'dist.zip',
      // 可选：是否覆盖已存在的 ZIP 文件
      overwrite: true
    })
  ],
  preview: {
    host,
    port,
    strictPort: true
  }
});
