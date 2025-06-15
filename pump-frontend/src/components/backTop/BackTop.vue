<template>
  <transition>
    <div v-show="show" class="back-top">
      <img src="./backTop.png" @click="backTop" />
    </div>
  </transition>
</template>

<script setup>
import throttle from 'lodash/throttle';
import { computed, onMounted, reactive } from 'vue';

import { getRealSize } from '@/utils/dom';

const DURATION = 300;

const props = defineProps({
  height: {
    type: Number,
    default: 500,
  },
});

const state = reactive({
  scrollTop: 0,
});

onMounted(() => {
  const doc = document;

  doc.addEventListener(
    'scroll',
    throttle(() => {
      state.scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
    }, 50),
  );
});

const show = computed(() => getRealSize(props.height) >= state.scrollTop);

const backTop = () => {
  const scrollTop = state.scrollTop;
  const doc = document;

  for (let i = 60; i >= 0; i--) {
    setTimeout(
      (i) => {
        let val = (scrollTop * i) / 60;
        doc.documentElement.scrollTop = val;
        doc.body.scrollTop = val;
      },
      (DURATION / 60) * (60 - i),
      i,
    );
  }
};
</script>

<style lang="less" scoped>
.back-top {
  position: fixed;
  right: 4px;
  bottom: 62px;
  z-index: 5;
  opacity: 0.88;

  &.v {
    &-enter-active,
    &-leave-active {
      transition: all 0.3s;
    }

    &-enter,
    &-leave-to {
      opacity: 0;
    }
  }

  img {
    width: 58px;
  }
}
</style>
