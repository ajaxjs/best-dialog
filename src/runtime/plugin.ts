import { defineNuxtPlugin } from '#app'
import { createApp, h } from 'vue'
import { BestDialogContainer } from './index'

export default defineNuxtPlugin((_nuxtApp) => {
  if (import.meta.client) {
    const el = document.createElement('div')
    el.id = '__best-dialog'
    document.body.appendChild(el)

    const app = createApp({
      render: () => h(BestDialogContainer),
    })
    app.mount(el)
  }
})
