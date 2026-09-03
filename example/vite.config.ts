import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  // GitHub Pages 部署在 /best-dialog/ 子路径，生产构建（build/preview）需设置 base；
  // 本地开发保持 '/'
  base: mode === 'production' ? '/best-dialog/' : '/',
  // 组件源码位于仓库根 src/（相对路径引入），去重保证只使用 example 内唯一的 vue 实例
  resolve: {
    dedupe: ['vue'],
  },
  server: {
    port: 3200,
    open: true,
  },
}))
