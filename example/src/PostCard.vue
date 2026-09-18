<script setup lang="ts">
defineProps<{
  title?: string
  close?: () => void
}>()
</script>

<template>
  <div class="post-card">
    <button class="post-card__close" aria-label="关闭" @click="close?.()">×</button>
    <div class="post-card__cover">🖼️</div>
    <h3 class="post-card__title">{{ title }}</h3>
    <p class="post-card__desc">
      这个弹窗由外部 Vue 组件完全渲染：结构为 .bd-overlay &gt; 组件，
      没有内置的 bd-dialog 卡片外壳，背景、圆角、阴影、关闭按钮全部由组件自己决定。
      遮罩、定位、动画、ESC 关闭等基础能力仍然保留。
    </p>
    <button class="post-card__btn" @click="close?.()">我知道了</button>
  </div>
</template>

<style scoped>
.post-card {
  position: relative;
  width: 400px;
  max-width: calc(100vw - 48px);
  padding: 36px 28px 28px;
  text-align: center;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
}
.post-card__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #86909c;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}
.post-card__close:hover {
  background: #f2f3f5;
  color: #4e5969;
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
  text-align: left;
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
