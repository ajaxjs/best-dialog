import { defineNuxtModule, addComponent, addImports, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'best-dialog',
    configKey: 'bestDialog',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {},
  setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // 注册全局组件
    addComponent({
      name: 'BestDialog',
      filePath: resolve('./runtime/index'),
      export: 'BestDialog',
    })

    // 自动导入 composables
    addImports([
      { name: 'useDialog',  from: resolve('./runtime/index') },
      { name: 'showDialog', from: resolve('./runtime/index') },
    ])

    // 注册插件（挂载全局容器 + 样式）
    addPlugin({
      src: resolve('./runtime/plugin'),
      mode: 'client',
    })

    // 注册 CSS
    nuxt.options.css.push(resolve('./runtime/style.css'))
  },
})
