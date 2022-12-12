<template>
  <video
    class="video-play"
    controls
    autoplay
    src="http://192.168.0.106:8081/backend-api/video/hls"
  />
</template>

<script lang="ts" setup>
import { hlsHttp } from "@/api/video";

</script>

<style scoped lang="less">
.video-play {
  width: 100%;
  height: 100%;
}
</style>
