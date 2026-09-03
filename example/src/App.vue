<template>
  <div class="app">
    <h1>best-dialog 示例</h1>
    <p class="subtitle">轻量、精美、丝滑的 Vue3 对话框组件</p>

    <!-- 模板组件 -->
    <section>
      <h2>1. 模板组件 &lt;BestDialog&gt;</h2>
      <div class="btn-grid">
        <button @click="basicShow = true">基础用法</button>
        <button @click="slotShow = true">插槽用法</button>
        <button @click="actionsSlotShow = true">Actions 插槽</button>
        <button @click="htmlShow = true">HTML 内容</button>
      </div>
    </section>

    <!-- 组合式 -->
    <section>
      <h2>2. 组合式 useDialog — 链式 API</h2>
      <div class="btn-grid">
        <button @click="dialog.open()">open()</button>
        <button @click="dialog.open({ content: '动态更新的内容！', title: '新标题' })">
          open(新内容)
        </button>
        <button @click="dialogChained">open().onClose()</button>
      </div>
    </section>

    <!-- 高级方法 -->
    <section>
      <h2>3. 高级方法 alert / confirm / prompt</h2>
      <div class="btn-grid">
        <button @click="dialog.alert('这是一条提示信息')">alert</button>
        <button @click="dialogConfirm">confirm</button>
        <button @click="dialogPrompt">prompt</button>
      </div>
    </section>

    <!-- 函数式 -->
    <section>
      <h2>4. 函数式 showDialog</h2>
      <div class="btn-grid">
        <button @click="showAlert">简单提示</button>
        <button @click="showConfirm">确认对话框</button>
        <button @click="showAsync">异步按钮</button>
        <button @click="showLink">链接按钮</button>
        <button @click="showComponent">组件内容</button>
        <button @click="showCancelDemo">onOk / onCancel</button>
      </div>
    </section>

    <!-- 位置 -->
    <section>
      <h2>5. 不同位置</h2>
      <div class="btn-grid">
        <button @click="showAt('center')">center</button>
        <button @click="showAt('top')">top</button>
        <button @click="showAt('bottom')">bottom</button>
        <button @click="showAt('left')">left</button>
        <button @click="showAt('right')">right</button>
        <button @click="showAt('top-left')">top-left</button>
        <button @click="showAt('top-right')">top-right</button>
        <button @click="showAt('bottom-left')">bottom-left</button>
        <button @click="showAt('bottom-right')">bottom-right</button>
      </div>
    </section>

    <!-- 动画效果 -->
    <section>
      <h2>6. 动画效果</h2>
      <div class="btn-grid">
        <button @click="showEffect('fade')">fade</button>
        <button @click="showEffect('slide')">slide</button>
        <button @click="showEffect('zoom')">zoom</button>
      </div>
    </section>

    <!-- 特殊 -->
    <section>
      <h2>7. 特殊用法</h2>
      <div class="btn-grid">
        <button @click="showNoOverlay">无遮罩</button>
        <button @click="showFullscreen">全屏</button>
        <button @click="showCustomStyle">自定义样式</button>
        <button @click="showCallback">回调 + 事件信息</button>
      </div>
    </section>

    <!-- ─── 模板对话框实例 ──────────────────────────── -->

    <!-- 基础 -->
    <BestDialog
      v-model="basicShow"
      title="基础对话框"
      content="这是一个简单的对话框示例。"
      :actions="['取消', { label: '确定', primary: true }]"
      @close="onBasicClose"
    />

    <!-- 插槽 -->
    <BestDialog v-model="slotShow" :width="500" :actions="['关闭']">
      <template #title>
        <span style="color: #165dff">🎨 自定义标题（插槽）</span>
      </template>
      <div>
        <p style="margin-bottom: 12px; color: #4e5969">通过默认插槽渲染，可放任意 Vue 组件：</p>
        <input v-model="slotInput" placeholder="输入..."
          style="width:100%;padding:8px 12px;border:1px solid #e5e6eb;border-radius:6px;font-size:14px;outline:none" />
        <p v-if="slotInput" style="margin-top:12px;color:#165dff">
          你输入了：<strong>{{ slotInput }}</strong>
        </p>
      </div>
    </BestDialog>

    <!-- Actions 插槽 -->
    <BestDialog v-model="actionsSlotShow" title="Actions 插槽" content="底部按钮由 actions 插槽自定义。">
      <template #actions="{ close }">
        <button class="bd-dialog__btn" @click="close()">自定义取消</button>
        <button class="bd-dialog__btn bd-dialog__btn--primary" @click="onActionsOk(close)">
          自定义确定
        </button>
      </template>
    </BestDialog>

    <!-- HTML -->
    <BestDialog
      v-model="htmlShow"
      title="HTML 内容"
      content="<p style='color:#4e5969'>支持 <strong>HTML</strong>，包括 <code style='background:#f2f3f5;padding:2px 6px;border-radius:4px'>code</code> 标签。</p>"
      html
      :actions="['知道了']"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'
import { BestDialog, useDialog, showDialog, type DialogCloseEvent } from '../../src/index'

// ── 模板组件状态 ──
const basicShow = ref(false)
const slotShow = ref(false)
const actionsSlotShow = ref(false)
const htmlShow = ref(false)
const slotInput = ref('')

function onBasicClose(e: DialogCloseEvent) {
  console.log('[模板] 关闭:', e.source, 'index:', e.index, 'button:', e.button)
}

function onActionsOk(close: () => void) {
  console.log('[Actions 插槽] 确定被点击')
  close()
}

// ── 组合式 useDialog ──
const dialog = useDialog({
  title: '组合式对话框',
  content: '通过 useDialog 创建，支持链式 API。',
  actions: [
    '取消',
    { label: '确定', primary: true },
  ],
})

// open().onClose() 链式调用
function dialogChained() {
  dialog.open({ title: '链式调用', content: '关闭时会触发 onClose 回调。' })
    .onClose((e) => {
      console.log('[链式] 关闭来源:', e.source, 'index:', e.index)
      if (e.source === 'button') {
        console.log('[链式] 按钮索引:', e.index)
        console.log('[链式] 按钮配置:', e.button)
      }
    })
}

// confirm 用法
function dialogConfirm() {
  dialog.confirm('确定要删除这条记录吗？', '确认删除')
    .onOk(() => {
      console.log('[confirm] 用户确认了删除')
    })
    .onCancel(() => {
      console.log('[confirm] 用户取消了删除')
    })
    .onClose((e) => {
      console.log('[confirm] 关闭来源:', e.source, 'index:', e.index, 'button:', e.button)
    })
}

// prompt 用法
function dialogPrompt() {
  dialog.prompt('请输入您的姓名', '用户输入')
    .onOk((value) => {
      console.log('[prompt] 用户输入:', value)
    })
}

// ── 函数式示例 ──
function showAlert() {
  const close = showDialog({
    title: '提示',
    content: '3 秒后自动关闭。',
    actions: ['知道了'],
    position: 'top',
  })
  setTimeout(close, 3000)
}

function showConfirm() {
  showDialog({
    title: '确认操作',
    content: '确定要删除这条记录吗？',
    actions: [
      '取消',
      { label: '确认删除', primary: true },
    ],
    onClose: (e) => {
      console.log('[showDialog] 关闭:', e.source, 'index:', e.index)
    },
  })
}

function showAsync() {
  showDialog({
    title: '异步提交',
    content: '点击提交按钮模拟异步请求...',
    actions: [
      '取消',
      {
        label: '提交',
        primary: true,
        onClick: async (close) => {
          await new Promise(r => setTimeout(r, 1000))
          console.log('[async] 完成')
        },
      },
    ],
  })
}

function showLink() {
  showDialog({
    title: '外部链接',
    content: '是否前往外部网站？',
    actions: [
      '取消',
      { as: 'a', label: '前往 GitHub', href: 'https://github.com', target: '_blank', primary: true },
    ],
  })
}

// ── 组件内容：content 直接传 Vue 组件（内部已自动 markRaw，无响应式警告） ──
const CounterContent = defineComponent({
  setup() {
    const count = ref(0)
    return () => h('div', { style: 'text-align:center' }, [
      h('p', { style: 'color:#4e5969;margin-bottom:12px' }, '这是一个通过 content 传入的 Vue 组件，可正常交互：'),
      h('button', {
        style: 'padding:6px 20px;border:1px solid #165dff;border-radius:6px;background:#165dff;color:#fff;cursor:pointer',
        onClick: () => { count.value++ },
      }, `点击次数：${count.value}`),
    ])
  },
})

function showComponent() {
  showDialog({
    title: '组件内容',
    content: CounterContent,
    width: 380,
    actions: [
      '取消',
      { label: '确定', primary: true },
    ],
    onOk: () => console.log('[组件] onOk：点击了确定'),
    onCancel: (e) => console.log('[组件] onCancel：来源', e.source),
  })
}

// ── onOk / onCancel 语义回调演示 ──
function showCancelDemo() {
  showDialog({
    title: 'onOk / onCancel',
    content: '点击「取消」按钮、右上角叉叉、按 ESC 或点击遮罩，均触发 onCancel；点击「确定」触发 onOk。',
    actions: [
      '取消',
      { label: '确定', primary: true },
    ],
    onOk: () => console.log('[demo] onOk：点击了确定'),
    onCancel: (e) => console.log('[demo] onCancel：来源', e.source),
  })
}

// ── 位置 ──
function showAt(position: any) {
  showDialog({
    title: `位置: ${position}`,
    content: `此对话框位于 ${position} 位置。`,
    position,
    actions: ['关闭'],
  })
}

// ── 动画 ──
function showEffect(effect: any) {
  showDialog({
    title: `动画: ${effect}`,
    content: `使用 ${effect} 动画效果。`,
    effect,
    actions: ['关闭'],
  })
}

// ── 特殊用法 ──
function showNoOverlay() {
  const close = showDialog({
    title: '无遮罩',
    content: '2.5 秒后自动消失。',
    overlay: false,
    position: 'top',
    closable: false,
    actions: [],
  })
  setTimeout(close, 2500)
}

function showFullscreen() {
  showDialog({
    title: '全屏对话框',
    content: '全屏模式，padding 为 0，无滚动条。',
    fullscreen: true,
    actions: [
      '取消',
      { label: '完成', primary: true },
    ],
  })
}

function showCustomStyle() {
  showDialog({
    title: '自定义样式',
    content: '通过 class/style 自定义外观。',
    class: 'my-custom-dialog',
    style: { borderRadius: '20px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' },
    width: 380,
    actions: [
      { label: '取消', style: 'border-color:rgba(255,255,255,.2);color:#ffffffb3' } as any,
      { label: '确认', primary: true, style: 'background:#7c3aed;border-color:#7c3aed' } as any,
    ],
  })
}

function showCallback() {
  showDialog({
    title: '回调 + 事件信息',
    content: '点击不同按钮关闭，查看控制台事件信息。',
    actions: [
      { label: '取消' },
      { label: '拒绝', primary: false },
      { label: '同意', primary: true },
    ],
    onClose: (e) => {
      console.log('[回调] source:', e.source, 'index:', e.index)
      if (e.source === 'button') {
        console.log('[回调] 按钮:', e.button)
      }
    },
  })
}
</script>

<style scoped>
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}
h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
.subtitle { color: #86909c; margin-bottom: 40px; }
section { margin-bottom: 32px; }
section h2 {
  font-size: 15px; font-weight: 600; color: #4e5969;
  margin-bottom: 12px; padding-bottom: 8px;
  border-bottom: 1px solid #e5e6eb;
}
.btn-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-grid button {
  padding: 8px 16px; border: 1px solid #e5e6eb; border-radius: 8px;
  background: #fff; color: #1d2129; font-size: 13px;
  cursor: pointer; transition: all .15s;
}
.btn-grid button:hover { border-color: #165dff; color: #165dff; background: #f0f5ff; }
.btn-grid button:active { transform: scale(.96); }
</style>
