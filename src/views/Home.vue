<script setup lang="ts">
import { ref } from 'vue'

import { GlobalStore } from '@/store'
const global = GlobalStore();

</script>

<template>
  <h1>Home</h1>
  <div>{{ global }}</div>

</template>

<style lang="less" scoped>
.read-the-docs {
  color: rgb(231, 3, 3);
}

div{
  color: @primary-color;
}
</style>
