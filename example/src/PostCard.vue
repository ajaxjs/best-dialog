<script setup lang="ts">
defineProps<{
  title?: string
  close?: () => void
}>()
</script>

<template>
  <div class="post-card">
    <div class="post-card__cover">🖼️</div>
    <h3 class="post-card__title">{{ title }}</h3>
    <p class="post-card__desc">
      这是一个由外部 Vue 组件完全自定义的弹窗内容：
      支持 props 传值、内部状态与交互，UI 由组件自己决定。
    </p>
    <button class="post-card__btn" @click="close?.()">我知道了</button>
  </div>
</template>

<style scoped>
.post-card {
  text-align: center;
  padding: 8px 4px;
}
.post-card__cover {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  background: linear-gradient(135deg, #165dff, #7c3aed);
}
.post-card__title {
  margin: 0 0 8px;
  font-size: 17px;
  color: #1d2129;
}
.post-card__desc {
  margin: 0 0 20px;
  color: #4e5969;
  font-size: 14px;
  line-height: 1.6;
}
.post-card__btn {
  padding: 9px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #165dff;
  color: #fff;
  font-size: 14px;
}
.post-card__btn:hover {
  background: #3c7eff;
}
</style>
