import { createApp, h } from 'vue'
import { BestDialogContainer } from '../../src/index'
import '../../src/style.css'
import App from './App.vue'

// 挂载主应用
const app = createApp(App)
app.mount('#app')

// 挂载全局对话框容器（供 useDialog / showDialog 使用）
const el = document.createElement('div')
el.id = '__best-dialog'
document.body.appendChild(el)
createApp({ render: () => h(BestDialogContainer) }).mount(el)
