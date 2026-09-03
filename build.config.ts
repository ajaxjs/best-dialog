import { defineBuildConfig } from 'unbuild'
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export default defineBuildConfig({
  entries: [
    'src/module',
    'src/runtime/index',
    'src/runtime/plugin',
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
      const outDir = ctx.options.outDir || 'dist'
      mkdirSync(join(outDir, 'runtime'), { recursive: true })
      copyFileSync(
        join(ctx.options.rootDir, 'src/runtime/style.css'),
        join(outDir, 'runtime/style.css'),
      )
    },
  },
})
