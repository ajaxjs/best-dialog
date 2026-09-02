# best-dialog

轻量、精美、丝滑的 Vue3 对话框组件，原生支持 Nuxt 3。

## 特性

- **三种调用方式** — 模板组件 / 组合式（链式 API）/ 函数式
- **高级方法** — `alert` / `confirm` / `prompt` 开箱即用
- **精美动画** — zoom / slide / fade 三种过渡效果，GPU 加速
- **灵活定位** — 9 种位置（center / top / bottom / left / right / 四角）
- **丰富内容** — 文本 / HTML / iframe / Vue 组件 / 插槽
- **actions 插槽** — 完全自定义底部按钮区域
- **事件信息** — `onClose(e)` 返回触发事件详情（按钮 index / btn 配置）
- **暗色模式** — 自动跟随系统 `prefers-color-scheme`
- **响应式** — 移动端自适应布局
- **无障碍** — ARIA 属性 + ESC 关闭
- **TypeScript** — 完整类型推导

## 安装

### Nuxt 3

```bash
npm install best-dialog
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['best-dialog'],
})
```

安装后即可直接使用 `<BestDialog>`、`useDialog`、`showDialog`，无需手动导入。

### Vue 3 (Vite / Webpack)

```bash
npm install best-dialog
```

```ts
// main.ts
import { createApp, h } from 'vue'
import { BestDialogContainer } from 'best-dialog/runtime'
import 'best-dialog/src/runtime/style.css'

const app = createApp(App)

// 挂载全局对话框容器（供 useDialog / showDialog 使用）
const el = document.createElement('div')
document.body.appendChild(el)
createApp({ render: () => h(BestDialogContainer) }).mount(el)

app.mount('#app')
```

---

## 使用方式

### 1. 模板组件 `<BestDialog>`

```vue
<template>
  <button @click="show = true">打开</button>

  <!-- 基础 -->
  <BestDialog v-model="show" title="提示" content="内容"
    :actions="['取消', { label: '确定', primary: true }]"
    @close="onClose" />

  <!-- 插槽 -->
  <BestDialog v-model="show2">
    <template #title><span>自定义标题</span></template>
    <div>自定义内容</div>
    <template #actions="{ close }">
      <button class="bd-dialog__btn" @click="close">关闭</button>
    </template>
  </BestDialog>
</template>
```

### 2. 组合式 `useDialog` — 链式 API

```ts
const dialog = useDialog({
  title: '确认',
  content: '确定删除？',
  actions: ['取消', { label: '确定', primary: true }],
})

// ── 基础 ──
const close = dialog.open()            // 返回 close 方法
const close2 = dialog.open({ content: '新内容' }) // 合并新选项

// ── 链式 onClose ──
dialog.open()
  .onClose((e) => {
    console.log('关闭来源:', e.source)         // 'button' | 'overlay' | 'close-btn' | 'esc'
    console.log('按钮索引:', e.currentTarget.dataset.index)
    console.log('按钮配置:', e.currentTarget.dataset.btn)
  })

// ── alert ──
dialog.alert('操作成功！')

// ── confirm ──
dialog.confirm('确定删除吗？')
  .onOk(() => { /* 用户点了确定 */ })
  .onClose((e) => { /* 任何方式关闭 */ })

// ── prompt ──
dialog.prompt('请输入您的姓名')
  .onOk((value) => { console.log('输入:', value) })
```

### 3. 函数式 `showDialog`

```ts
const close = showDialog({
  title: '提示',
  content: '操作成功',
  actions: ['知道了'],
})

setTimeout(close, 3000)
```

---

## API 参考

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `boolean` | `false` | v-model 控制显隐 |
| `title` | `string \| Component` | — | 标题 |
| `content` | `string \| Component` | — | 内容 |
| `html` | `boolean` | `false` | HTML 渲染 content |
| `url` | `string` | — | iframe 地址（优先于 content）|
| `actions` | `DialogActionItem[]` | — | 底部按钮 |
| `position` | `DialogPosition` | `'center'` | 位置 |
| `effect` | `DialogEffect` | 自动 | 动画：fade / slide / zoom |
| `overlay` | `boolean` | `true` | 显示遮罩 |
| `overlayClose` | `boolean` | `true` | 点击遮罩关闭 |
| `escClose` | `boolean` | `true` | ESC 关闭 |
| `closable` | `boolean` | `true` | 显示关闭按钮 |
| `width` | `string \| number` | `'440px'` | 宽度 |
| `fullscreen` | `boolean` | `false` | 全屏 |
| `zIndex` | `number` | — | 自定义 z-index |
| `dialogClass` | `string \| object` | — | 对话框 class |
| `dialogStyle` | `CSSProperties` | — | 对话框 style |

### 插槽

| 插槽 | 作用域 | 说明 |
|------|--------|------|
| `default` | — | 主体内容 |
| `title` | — | 标题区域 |
| `actions` | `{ close }` | 底部按钮区域 |

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `boolean` | v-model 更新 |
| `open` | — | 打开 |
| `close` | `DialogCloseEvent` | 关闭（含事件信息）|

### DialogCloseEvent

```ts
interface DialogCloseEvent {
  source: 'button' | 'overlay' | 'close-btn' | 'esc'
  currentTarget: {
    dataset: {
      index?: number    // 按钮索引
      btn?: DialogAction // 按钮配置
    }
  }
}
```

---

## useDialog 完整 API

```ts
const dialog = useDialog(options?)

dialog.open(opts?)          // 打开，返回 close 函数
  .onClose(e => {})         // 链式：关闭回调
  .onOk(value => {})        // 链式：确认回调（confirm/prompt 用）

dialog.close()              // 关闭

dialog.alert(content, title?)                  // 快捷提示
dialog.confirm(content, title?).onOk(() => {})  // 确认框
dialog.prompt(placeholder?, title?, default?)   // 输入框
     .onOk(value => {})
```

---

## Actions 详解

```ts
type DialogActionItem = string | {
  label?: string
  onClick?: (close: () => void) => void | Promise<void> | boolean
  as?: 'button' | 'a'
  href?: string
  target?: string
  class?: string
  primary?: boolean   // 默认最后一个为 primary
}
```

**onClick 返回值：**
- `undefined` / `true` → 自动关闭
- `false` → 不关闭
- `Promise<false>` → 异步后不关闭

```ts
showDialog({
  actions: [
    '取消',
    {
      label: '提交',
      primary: true,
      onClick: async (close) => {
        const ok = await submitForm()
        if (!ok) return false  // 验证失败，不关闭
      },
    },
  ],
})
```

---

## 位置

```
┌─────────────────────────────────────┐
│ top-left    │   top    │  top-right │
│─────────────┼──────────┼────────────│
│    left     │  center  │   right    │
│─────────────┼──────────┼────────────│
│ bottom-left │  bottom  │bottom-right│
└─────────────────────────────────────┘
```

动画自动匹配：center→zoom，其他→slide（方向自适应）。可通过 `effect` 覆盖。

---

## 样式定制

```css
/* 覆盖圆角 */
.bd-dialog { border-radius: 20px; }

/* 覆盖主按钮色 */
.bd-dialog__btn--primary {
  background: #7c3aed;
  border-color: #7c3aed;
}
```

```vue
<BestDialog
  :dialog-class="['my-dialog']"
  :dialog-style="{ borderRadius: '20px' }"
/>
```

## 许可证

MIT
