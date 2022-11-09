<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <router-link to="/helloworld">test </router-link>
        <router-link to="/search">Search</router-link>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>

</style>
