# best-dialog

轻量、精美、丝滑的 Vue3 对话框组件，原生支持 Nuxt 3。

**[在线演示 Demo](https://ajaxjs.github.io/best-dialog/)** · [GitHub](https://github.com/ajaxjs/best-dialog)

## 特性

- **三种调用方式** — 模板组件 / 组合式（链式 API）/ 函数式
- **高级方法** — `alert` / `confirm` / `prompt` 开箱即用
- **语义回调** — `onOk` / `onCancel`，确定、取消、叉叉、ESC 一目了然
- **精美动画** — zoom / slide / fade 三种过渡效果，GPU 加速
- **灵活定位** — 9 种位置（center / top / bottom / left / right / 四角）
- **丰富内容** — 文本 / HTML / iframe / Vue 组件 / 插槽（组件自动 `markRaw`，无响应式警告）
- **actions 插槽** — 完全自定义底部按钮区域
- **事件信息** — `onClose(e)` 返回触发事件详情（source / 按钮索引 / 按钮配置）
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

> 安装后即可直接使用 `<BestDialog>`、`useDialog`、`showDialog`，无需手动导入。

### Vue 3 (Vite / Webpack)

```bash
npm install best-dialog
```

```ts
// main.ts
import { createApp, h } from 'vue'
import { BestDialogContainer } from 'best-dialog'
import 'best-dialog/style.css'

const app = createApp(App)

// 挂载全局对话框容器（供 useDialog / showDialog 使用）
const el = document.createElement('div')
document.body.appendChild(el)
createApp({ render: () => h(BestDialogContainer) }).mount(el)

app.mount('#app')
```

> 若只使用模板组件 `<BestDialog>`，可以省略容器挂载。

---

## 使用方式

### 1. 模板组件 `<BestDialog>`

```vue
<template>
  <button @click="show = true">打开</button>

  <!-- 基础 -->
  <BestDialog v-model="show" title="提示" content="内容"
    :actions="['取消', { label: '确定', primary: true }]"
    @ok="onOk" @cancel="onCancel" @close="onClose" />

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
dialog.open()                          // 打开（返回 handle，支持链式）
dialog.open({ content: '新内容' })      // 合并新选项
dialog.close()                         // 关闭

// ── 链式回调 ──
dialog.open()
  .onOk(() => { /* 点击了 primary 按钮 */ })
  .onCancel((e) => { /* 取消按钮 / 叉叉 / ESC / 遮罩 */ })
  .onClose((e) => { /* 任何方式关闭 */ })

// ── alert ──
dialog.alert('操作成功！')

// ── confirm ──
dialog.confirm('确定删除吗？')
  .onOk(() => { /* 用户点了确定 */ })
  .onCancel(() => { /* 用户点了取消 */ })

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

### 4. 语义回调 `onOk` / `onCancel`

除 `onClose` 外，所有 API 均支持语义回调，关闭来源自动归类：

| 关闭方式 | onOk | onCancel |
|---------|------|----------|
| 点击 primary 按钮（确定） | ✅ | — |
| 点击普通按钮（取消） | — | ✅ |
| 点击右上角叉叉 | — | ✅ |
| 按 ESC | — | ✅ |
| 点击遮罩 | — | ✅ |

```ts
// showDialog：options 直接传
showDialog({
  title: '删除确认',
  content: '确定要删除这条记录吗？',
  actions: ['取消', { label: '确定', primary: true }],
  onOk: () => doDelete(),
  onCancel: (e) => console.log('取消来源:', e.source),
})

// useDialog：链式或 options 均可
dialog.confirm('确定删除吗？').onOk(doDelete)

// BestDialog 组件：@ok / @cancel 事件
<BestDialog v-model="show" @ok="doOk" @cancel="onCancel" />
```

> `prompt` 的 `onOk` 回调参数为输入框的值。

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
| `close` | `DialogCloseEvent` | 任何方式关闭（含事件信息）|
| `ok` | — | 点击 primary 按钮 |
| `cancel` | `DialogCloseEvent` | 取消按钮 / 叉叉 / ESC / 遮罩 |

### DialogCloseEvent

```ts
interface DialogCloseEvent {
  source: 'button' | 'overlay' | 'close-btn' | 'esc'  // 关闭来源
  index: number                                       // 按钮索引，非按钮关闭为 -1
  button?: DialogAction                               // 按钮配置（source 为 button 时）
}
```

---

## useDialog 完整 API

```ts
const dialog = useDialog(options?)

dialog.open(opts?)          // 打开，返回 DialogHandle（可继续链式）
dialog.close()              // 关闭

// DialogHandle 链式回调
dialog.open()
  .onOk(value => {})        // 确认回调（prompt 的 value 为输入值）
  .onCancel(e => {})        // 取消回调（取消按钮 / 叉叉 / ESC / 遮罩）
  .onClose(e => {})         // 任意关闭回调

dialog.alert(content, title?)                     // 快捷提示
dialog.confirm(content, title?)                   // 确认框
dialog.prompt(placeholder?, title?, default?)    // 输入框
```

`options` 中也可以直接声明 `onOk` / `onCancel` / `onClose`，与链式回调等价（两者会同时触发）。

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
  primary?: boolean   // 默认最后一个按钮为 primary
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

## 内容渲染优先级

`default 插槽` > `url`（iframe）> `content`：
- `content` 为字符串 → 文本段落
- `content` 为字符串且 `html: true` → HTML 渲染
- `content` 为 Vue 组件 → 直接渲染（内部自动 `markRaw`，避免响应式代理警告）

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
