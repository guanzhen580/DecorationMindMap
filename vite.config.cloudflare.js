// CloudFlare Pages专用配置文件
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 导出适用于CloudFlare Pages的Vite配置
export default defineConfig({
  plugins: [react()],
  // 移除开发环境代理，使用CloudFlare Pages Functions或其他后端服务
  // 前端将直接调用外部API
  //build: {
  //  // 确保构建产物适配CloudFlare Pages
  //  outDir: 'dist',
  //  assetsDir: 'assets',
  //  sourcemap: false,
  //  // 使用Vite默认的minify配置
  //  minify: 'esbuild'
  //},
  //// 定义全局变量，可在前端代码中使用
  //define: {
  //  'import.meta.env.VITE_CLOUDFLARE_DEPLOYED': 'true'
  //}
})
