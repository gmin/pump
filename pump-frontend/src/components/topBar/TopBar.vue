<template>
  <div>
    <header
      class="header"
      :class="{
        fixed,
        theme,
        transparent,
      }"
    >
      <div class="header-left">
        <slot name="left">
          <div v-show="back" class="back-wrapper" @click="handleBack">
            <svg-icon name="back" />
          </div>
        </slot>
      </div>

      <div class="header-middle">
        <slot>
          {{ title }}
        </slot>
      </div>

      <div class="header-right">
        <slot name="right" />
      </div>
    </header>

    <div v-if="fixed" class="header-placeholder" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  back: {
    type: Boolean,
    default: true,
  },
  border: {
    type: Boolean,
    default: true,
  },
  to: {
    type: String,
    default: '',
  },
  fixed: {
    type: Boolean,
    default: true,
  },
  theme: {
    type: Boolean,
    default: false,
  },
  transparent: {
    type: Boolean,
    default: false,
  },
});

const handleBack = () => {
  if (props.to) {
    router.push(props.to);
  } else {
    router.go(-1);
  }
};
</script>

<style lang="less" scoped>
.header {
  display: flex;
  height: var(--top-bar-height);
  overflow: hidden;
  color: var(--white);
  text-align: center;
  background: var(--background);
  box-sizing: content-box;
  align-items: center;

  &.theme {
    background: #cdd6f7;
    background-size: 100% 100%;
  }

  &.fixed {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
  }

  &.transparent {
    background: transparent;
  }

  &-left {
    display: flex;
    align-items: center;
    width: 100px;
    height: 100%;
    padding-left: 16px;

    .back-wrapper {
      position: relative;

      &::after {
        position: absolute;
        overflow: hidden;
        pointer-events: none;
        background-color: var(--black);
        border-radius: 50%;
        content: '';
        opacity: 0;
        inset: -10px;
      }

      &:active::after {
        opacity: 0.1;
      }
    }
  }

  &-middle {
    font-size: 15px;
    font-weight: bold;
    flex: 1;
  }

  &-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100px;
    height: 100%;
    padding-right: 12px;
    overflow: hidden;
    font-size: 13px;
  }
}

.header-placeholder {
  height: var(--top-bar-height);
  box-sizing: content-box;
}
</style>
