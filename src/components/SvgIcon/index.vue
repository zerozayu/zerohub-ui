<template>
  <svg :class="svgClass" aria-hidden="true">
    <use class="svg-use" :xlink:href="symbolId"></use>
  </svg>
</template>

<script lang="ts" setup name="SvgIcon">
import { computed, ref } from "vue";

interface Props {
  prefix?: string;
  name: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  prefix: "icon",
  className: "",
});

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return "svg-icon";
});

const currentColor = ref("#1296db");

</script>

<style scoped lang="less">
.svg-icon {
  vertical-align: -0.1em; /* 因icon大小被设置为和字体大小一致，而span等标签的下边缘会和字体的基线对齐，故需设置一个往下的偏移比例，来纠正视觉上的未对齐效果 */
  fill: v-bind(currentColor); /* 定义元素的颜色，currentColor是一个变量，这个变量的值就表示当前元素的color值，如果当前元素未设置color值，则从父元素继承 */
  overflow: hidden;
}
</style>
