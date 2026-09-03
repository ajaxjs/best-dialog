import { defineBuildConfig } from 'unbuild'
import { copyFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

// 产物扁平输出到 dist/（index.mjs / module.mjs / plugin.mjs / style.css，无 runtime 子目录）。
// package.json 的 exports 将 '.' 映射到 dist/index.mjs，
// 使用方仍可简洁导入：`best-dialog` / `best-dialog/style.css`。
export default defineBuildConfig({
  entries: [
    'src/module',
    'src/index',
    'src/plugin',
  ],
  declaration: true,
  clean: true,
  failOnWarn: false,
  rollup: {
    emitCJS: false,
    inlineDependencies: true,
  },
  externals: [
    'vue',
    '@nuxt/kit',
    '@nuxt/schema',
    '#app',
  ],
  hooks: {
    'build:done'(ctx) {
      const root = ctx.options.rootDir
      // 注意：ctx.options.outDir 已是绝对路径
      const dist = ctx.options.outDir || join(root, 'dist')

      // 样式不参与编译，直接拷贝到 dist 根
      copyFileSync(join(root, 'src/style.css'), join(dist, 'style.css'))

      // 删除重复的 .d.ts（保留 .d.mts，与 exports 的 types 声明一致）
      for (const name of ['index', 'module', 'plugin']) {
        rmSync(join(dist, `${name}.d.ts`), { force: true })
      }
    },
  },
})
