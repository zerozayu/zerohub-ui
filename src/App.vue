<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu router :default-active="this.$router.path">
          <svg-icon name="bilibili-bilibili_logo" class-name="svg-class-demo" />
          <el-menu-item index="/search">
            <el-icon><Search /></el-icon>
            <span>文件搜索</span>
          </el-menu-item>
          <el-menu-item index="/upload">
            <el-icon><Upload /></el-icon>
            <span>文件上传</span>
          </el-menu-item>
          <el-menu-item index="/video">
            <el-icon><VideoPlay /></el-icon>
            <span>视频播放</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <!-- <el-header>ZeroHub</el-header> -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.svg-class-demo {
  width: 100px;
  height: 50px;
}
</style>
