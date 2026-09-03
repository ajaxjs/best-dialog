import {
  defineComponent,
  ref,
  shallowRef,
  computed,
  watch,
  onMounted,
  onUnmounted,
  h,
  markRaw,
  Teleport,
  Transition,
  type PropType,
  type CSSProperties,
  type VNode,
} from 'vue'

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type DialogPosition =
  | 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export type DialogEffect = 'fade' | 'slide' | 'zoom'

export type DialogContentType = string | object | null | undefined

export interface DialogAction {
  label?: string
  onClick?: (close: () => void) => void | Promise<void> | boolean
  as?: 'button' | 'a'
  href?: string
  target?: string
  class?: string
  primary?: boolean
  [key: string]: any
}

export type DialogActionItem = string | DialogAction

export interface DialogCloseEvent {
  source: 'button' | 'overlay' | 'close-btn' | 'esc'
  index: number
  button?: DialogAction
}

export interface DialogOptions {
  title?: string | object
  content?: DialogContentType
  html?: boolean
  url?: string
  actions?: DialogActionItem[]
  position?: DialogPosition
  effect?: DialogEffect
  overlay?: boolean
  overlayClose?: boolean
  escClose?: boolean
  closable?: boolean
  class?: string | string[] | Record<string, boolean>
  style?: CSSProperties | string
  width?: string | number
  fullscreen?: boolean
  zIndex?: number
  onOpen?: () => void
  onClose?: (e: DialogCloseEvent) => void
  onOk?: (value?: any) => void
  onCancel?: (e: DialogCloseEvent) => void
  [key: string]: any
}

// ────────────────────────────────────────────────────────────
// Dialog Store
// ────────────────────────────────────────────────────────────

interface StoreItem {
  id: string
  visible: boolean
  options: DialogOptions
}

const store = ref<StoreItem[]>([])
let _uid = 0
function uid() { return `bd-${++_uid}` }

// markRaw 内容/标题组件，避免存入响应式 store 时被 Proxy 代理
// （否则 Vue 运行时会警告 "Component made a reactive object"）
function sanitizeOptions(o: DialogOptions): DialogOptions {
  const r = { ...o }
  if (r.content && typeof r.content === 'object') r.content = markRaw(r.content)
  if (r.title && typeof r.title === 'object') r.title = markRaw(r.title)
  return r
}

function storeAdd(id: string, options: DialogOptions) {
  const o = sanitizeOptions(options)
  const existing = store.value.find(d => d.id === id)
  if (existing) { existing.options = o; existing.visible = true }
  else store.value.push({ id, visible: true, options: o })
}

function storeHide(id: string) {
  const d = store.value.find(d => d.id === id)
  if (d) d.visible = false
}

function storeRemove(id: string) {
  const i = store.value.findIndex(d => d.id === id)
  if (i !== -1) store.value.splice(i, 1)
}

function storeClose(id: string, e?: DialogCloseEvent) {
  const item = store.value.find(d => d.id === id)
  if (!item) return
  item.visible = false
  item.options.onClose?.(e || { source: 'overlay', index: -1 })
  // 语义回调：primary 按钮点击 → onOk；取消按钮 / 叉叉 / ESC / 遮罩 → onCancel
  if (e) {
    if (e.source === 'button' && e.button?.primary) item.options.onOk?.()
    else item.options.onCancel?.(e)
  }
  setTimeout(() => storeRemove(id), 420)
}

// ────────────────────────────────────────────────────────────
// useDialog — 链式 API + alert / confirm / prompt
// ────────────────────────────────────────────────────────────

export interface DialogHandle {
  close: () => void
  onClose: (cb: (e: DialogCloseEvent) => void) => DialogHandle
  onOk: (cb: (value?: any) => void) => DialogHandle
  onCancel: (cb: (e: DialogCloseEvent) => void) => DialogHandle
  open: (opts?: DialogOptions) => DialogHandle
  alert: (content: string, title?: string) => DialogHandle
  confirm: (content: string, title?: string) => DialogHandle
  prompt: (placeholder?: string, title?: string, defaultValue?: string) => DialogHandle
}

export function useDialog(defaults: DialogOptions = {}): DialogHandle {
  const id = uid()
  // shallowRef：避免 defaults 中的内容组件被深层 reactive 代理
  const options = shallowRef<DialogOptions>({ ...defaults })

  let _onClose: ((e: DialogCloseEvent) => void) | null = null
  let _onOk: ((value?: any) => void) | null = null
  let _onCancel: ((e: DialogCloseEvent) => void) | null = null
  let _okValue: (() => any) | undefined
  let _closing = false

  onUnmounted(() => storeRemove(id))

  function doClose(e?: DialogCloseEvent) {
    if (_closing) return
    _closing = true
    const evt = e || { source: 'overlay' as const, index: -1 }
    _onClose?.(evt)
    storeHide(id)
    setTimeout(() => { storeRemove(id); _closing = false }, 420)
  }

  function open(opts?: DialogOptions): DialogHandle {
    if (opts) options.value = { ...options.value, ...opts }
    _onClose = null
    _onOk = null
    _onCancel = null
    _okValue = undefined
    _closing = false

    // 包装回调，使链式 .onClose() / .onOk() / .onCancel() 与 store 的 options 回调打通
    const userOnClose = options.value.onClose
    options.value.onClose = (e: DialogCloseEvent) => {
      userOnClose?.(e)
      if (!_closing) {
        _closing = true
        _onClose?.(e)
      }
    }

    const userOnOk = options.value.onOk
    options.value.onOk = () => {
      userOnOk?.(_okValue?.())
      _onOk?.(_okValue?.())
    }

    const userOnCancel = options.value.onCancel
    options.value.onCancel = (e: DialogCloseEvent) => {
      userOnCancel?.(e)
      _onCancel?.(e)
    }

    storeAdd(id, options.value)
    options.value.onOpen?.()
    return handle
  }

  const handle: DialogHandle = {
    close: () => doClose(),

    onClose(cb) {
      _onClose = cb
      return handle
    },

    onOk(cb) {
      _onOk = cb
      return handle
    },

    onCancel(cb) {
      _onCancel = cb
      return handle
    },

    open,

    alert(content, title) {
      open({
        title: title || '提示',
        content,
        actions: [{ label: '确定', primary: true }],
      })
      return handle
    },

    confirm(content, title) {
      open({
        title: title || '确认',
        content,
        actions: [
          { label: '取消' },
          { label: '确定', primary: true },
        ],
      })
      return handle
    },

    prompt(placeholder, title, defaultValue) {
      const inputVal = ref(defaultValue ?? '')
      const PromptInput = markRaw(defineComponent({
        setup() {
          return () => h('input', {
            class: 'bd-dialog__input',
            type: 'text',
            placeholder: placeholder || '请输入...',
            value: inputVal.value,
            onInput: (e: Event) => { inputVal.value = (e.target as HTMLInputElement).value },
          })
        },
      }))
      open({
        title: title || '输入',
        content: PromptInput,
        actions: [
          { label: '取消' },
          { label: '确定', primary: true },
        ],
      })
      // onOk 取值器：点击确定时回传输入值
      _okValue = () => inputVal.value
      return handle
    },
  }

  return handle
}

// ────────────────────────────────────────────────────────────
// showDialog
// ────────────────────────────────────────────────────────────

export function showDialog(options: DialogOptions) {
  const id = uid()
  storeAdd(id, options)
  options.onOpen?.()
  const close = (e?: DialogCloseEvent) => storeClose(id, e)
  return close
}

// ────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────

function effectForPos(pos: string): DialogEffect {
  return pos === 'center' ? 'zoom' : 'slide'
}

function normActions(raw?: DialogActionItem[]): DialogAction[] {
  if (!raw?.length) return []
  return raw.map(a => typeof a === 'string' ? { label: a } : a)
}

const XIcon = defineComponent({
  setup() {
    return () => h('svg', {
      viewBox: '0 0 24 24', width: 18, height: 18,
      fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }, [
      h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
      h('line', { x1: 6, y1: 6, x2: 18, y2: 18 }),
    ])
  },
})

// ── 按钮渲染 (带 dataset 事件信息) ──
function renderBtn(
  a: DialogAction,
  close: (e?: DialogCloseEvent) => void,
  isLast: boolean,
  index: number,
): VNode {
  const label = a.label || '确定'
  const primary = a.primary ?? isLast
  const cls = ['bd-dialog__btn', { 'bd-dialog__btn--primary': primary }, a.class]

  if (a.as === 'a') {
    return h('a', {
      class: cls, href: a.href || '#', target: a.target,
      'data-index': String(index),
    }, label)
  }

  async function click() {
    const evt: DialogCloseEvent = { source: 'button', index, button: a }
    if (!a.onClick) { close(evt); return }
    const r = a.onClick(() => close(evt))
    if (r instanceof Promise) { if ((await r) !== false) close(evt) }
    else if (r !== false) close(evt)
  }
  return h('button', {
    class: cls, type: 'button', onClick: click,
    'data-index': String(index),
  }, label)
}

// ────────────────────────────────────────────────────────────
// renderDialogBox
// ────────────────────────────────────────────────────────────

function renderDialogBox(
  o: DialogOptions,
  close: (e?: DialogCloseEvent) => void,
  bodySlot?: VNode[],
  actionsSlot?: VNode[],
): VNode {
  const pos = o.position || 'center'
  const showOverlay = o.overlay !== false
  const showClose = o.closable !== false
  const isFS = !!o.fullscreen
  const w = o.width ?? '440px'
  const wStyle = typeof w === 'number' ? `${w}px` : w

  const dStyle: CSSProperties = {
    ...(typeof o.style === 'string' ? {} : (o.style as CSSProperties || {})),
    ...(isFS ? {} : { width: wStyle }),
    ...(o.zIndex ? { zIndex: o.zIndex } : {}),
  }

  const actions = normActions(o.actions)

  // 内容
  let body: any = null
  if (bodySlot) {
    body = bodySlot
  } else if (o.url) {
    body = h('iframe', { src: o.url, class: 'bd-dialog__iframe', frameborder: '0', allow: 'fullscreen' })
  } else if (o.html && typeof o.content === 'string') {
    body = h('div', { class: 'bd-dialog__html', innerHTML: o.content })
  } else if (typeof o.content === 'string') {
    body = h('p', { class: 'bd-dialog__text' }, o.content)
  } else if (o.content) {
    body = [h(o.content as any)]
  }

  // 标题
  let titleNode: any = null
  if (o.title) {
    titleNode = typeof o.title === 'string'
      ? h('span', { class: 'bd-dialog__title' }, o.title)
      : Array.isArray(o.title) ? o.title : h(o.title as any)
  }

  // 底部: actions 插槽优先
  let footer: any = null
  if (actionsSlot) {
    footer = h('div', { class: 'bd-dialog__footer' }, actionsSlot)
  } else if (actions.length > 0) {
    footer = h('div', { class: 'bd-dialog__footer' },
      actions.map((a, i) => renderBtn(a, close, i === actions.length - 1, i)))
  }

  return h('div', {
    class: ['bd-overlay', pos, { 'bd-fullscreen': isFS }],
    style: showOverlay ? undefined : { background: 'transparent', pointerEvents: 'none' },
    onClick: (e: MouseEvent) => {
      if (e.target === e.currentTarget && o.overlayClose !== false) {
        close({ source: 'overlay', index: -1 })
      }
    },
  }, [
    h(Transition, {
      name: `bd-${o.effect || effectForPos(pos)}`,
      appear: true,
    }, () =>
      h('div', {
        class: ['bd-dialog', o.class, { 'bd-dialog--fullscreen': isFS }],
        style: dStyle,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': typeof o.title === 'string' ? o.title : undefined,
        onClick: (e: MouseEvent) => e.stopPropagation(),
      }, [
        showClose && h('button', {
          class: 'bd-dialog__close', type: 'button',
          'aria-label': '关闭',
          onClick: () => close({ source: 'close-btn', index: -1 }),
        }, [h(XIcon)]),

        titleNode && h('div', { class: 'bd-dialog__header' }, [titleNode]),
        h('div', { class: 'bd-dialog__body' }, [body]),
        footer,
      ]),
    ),
  ])
}

// ────────────────────────────────────────────────────────────
// BestDialog — 模板组件
// ────────────────────────────────────────────────────────────

export const BestDialog = defineComponent({
  name: 'BestDialog',
  inheritAttrs: false,
  props: {
    modelValue:    { type: Boolean, default: false },
    title:         { type: [String, Object] as PropType<string | object>, default: undefined },
    content:       { type: [String, Object] as PropType<DialogContentType>, default: undefined },
    html:          { type: Boolean, default: false },
    url:           { type: String, default: undefined },
    actions:       { type: Array as PropType<DialogActionItem[]>, default: undefined },
    position:      { type: String as PropType<DialogPosition>, default: 'center' },
    effect:        { type: String as PropType<DialogEffect>, default: undefined },
    overlay:       { type: Boolean, default: true },
    overlayClose:  { type: Boolean, default: true },
    escClose:      { type: Boolean, default: true },
    closable:      { type: Boolean, default: true },
    width:         { type: [String, Number], default: '440px' },
    fullscreen:    { type: Boolean, default: false },
    zIndex:        { type: Number, default: undefined },
    dialogClass:   { type: [String, Array, Object] as PropType<any>, default: undefined },
    dialogStyle:   { type: [String, Object] as PropType<CSSProperties | string>, default: undefined },
  },
  emits: ['update:modelValue', 'open', 'close', 'ok', 'cancel'],
  setup(props, { emit, slots }) {
    const localVisible = ref(props.modelValue)
    const effect = computed(() => props.effect || effectForPos(props.position))

    watch(() => props.modelValue, v => {
      localVisible.value = v
      if (v) emit('open')
    })

    function close(e?: DialogCloseEvent) {
      localVisible.value = false
      emit('update:modelValue', false)
      emit('close', e)
      // primary 按钮点击 → ok；取消按钮 / 叉叉 / ESC / 遮罩 → cancel
      if (e) {
        if (e.source === 'button' && e.button?.primary) emit('ok')
        else emit('cancel', e)
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && localVisible.value && props.escClose) {
        close({ source: 'esc', index: -1 })
      }
    }
    onMounted(() => document.addEventListener('keydown', onKey))
    onUnmounted(() => document.removeEventListener('keydown', onKey))

    return () => {
      if (!localVisible.value) return null

      const bodySlot = slots.default ? slots.default() : undefined
      const actionsSlot = slots.actions ? slots.actions({ close }) : undefined

      const opts: DialogOptions = {
        title: props.title,
        content: props.content,
        html: props.html,
        url: props.url,
        actions: props.actions,
        position: props.position,
        effect: props.effect,
        overlay: props.overlay,
        overlayClose: props.overlayClose,
        closable: props.closable,
        class: props.dialogClass,
        style: props.dialogStyle,
        width: props.width,
        fullscreen: props.fullscreen,
        zIndex: props.zIndex,
      }

      if (slots.title) opts.title = slots.title() as any

      return h(Teleport, { to: 'body' }, [
        h(Transition, { name: 'bd-overlay', appear: true }, () =>
          renderDialogBox(opts, close, bodySlot, actionsSlot),
        ),
      ])
    }
  },
})

// ────────────────────────────────────────────────────────────
// BestDialogContainer — 程序式调用容器
// ────────────────────────────────────────────────────────────

export const BestDialogContainer = defineComponent({
  name: 'BestDialogContainer',
  setup() {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      for (let i = store.value.length - 1; i >= 0; i--) {
        const d = store.value[i]
        if (d.visible && d.options.escClose !== false) {
          storeClose(d.id, { source: 'esc', index: -1 })
          break
        }
      }
    }
    onMounted(() => document.addEventListener('keydown', onKey))
    onUnmounted(() => document.removeEventListener('keydown', onKey))

    return () =>
      h(Teleport, { to: 'body' },
        store.value.map(item => {
          const o = item.options
          const close = (e?: DialogCloseEvent) => storeClose(item.id, e)

          return h(Transition, {
            name: 'bd-overlay',
            appear: true,
            key: item.id,
          }, () =>
            item.visible
              ? renderDialogBox(o, close)
              : null,
          )
        }),
      )
  },
})
