<script setup lang="ts">
import { ref } from 'vue'

import { GlobalStore } from '@/store'
const global = GlobalStore();

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <h1>helloworld</h1>
  <div>{{ global }}</div>
  
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

</template>

<style lang="less" scoped>
.read-the-docs {
  color: rgb(231, 3, 3);
}

div{
  color: @primary-color;
}
</style>
