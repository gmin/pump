<template>
  <svg
    class="svg-icon"
    :class="'svg-icon-' + props.name"
    v-bind="$attrs"
    :style="{
      width: getRealSize(props.size),
      height: getRealSize(props.size),
    }"
  >
    <use :xlink:href="'#' + props.name" />
  </svg>
</template>

<script setup>
import svgIcons from '@/assets/svgIcons';
import { getRealSize } from '@/utils/dom';

// https://free-icons.github.io/free-icons/
const props = defineProps({
  name: {
    type: String,
    required: true,
    default: '',
    validator(val) {
      return svgIcons[val];
    },
  },
  size: {
    type: Number,
    default: 16,
  },
});
</script>

<style lang="less" scoped>
.svg-icon {
  display: inline-block;
  fill: currentcolor;
}
</style>
