<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="12">
            <router-link to="/upload">upload</router-link>
          </el-col>
          <el-col :span="12">
            <router-link to="/search">Search</router-link>
          </el-col>

        </el-row>

      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>

</style>
