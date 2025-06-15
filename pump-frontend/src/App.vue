<template>
  <div class="app-root">
    <keep-alive :include="state.keepAlive">
      <router-view class="app-view" />
    </keep-alive>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const state = reactive({
  keepAlive: [],
});
</script>

<style lang="less">
.app-root {
  height: 100vh;
  -webkit-overflow-scrolling: touch;
}

.app-view {
  position: relative;
  min-height: 100%;
}
</style>
