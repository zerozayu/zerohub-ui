<template>
  <div class="file-up-app">
    <el-tabs
      v-model="activeName"
      class="file-upload-tabs"
      disabled
      @tab-change="handleTabChange"
    >
      <el-tab-pane :name="tabName.uploadBody">
        <div class="upload-body">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleFileListChange"
            drag
          >
            <svg-icon class="upload-icon" name="upload"></svg-icon>
            <div class="el-upload__text">拖拽到此处也可以上传</div>

            <el-button class="el-button-upload" size="large" type="primary"
              >上传文件</el-button
            >
          </el-upload>

          <!-- 进度显示 -->
          <div class="progress-box">
            <span>上传进度：{{ percent.toFixed() }}%</span>
            <el-button type="primary" size="small" @click="handleClickBtn">{{
              upload ? " 暂停" : "继续"
            }}</el-button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane lazy :name="tabName.uploadContent">
        <div class="upload-content">
          <div class="file-queue">
            <div class="file-queue-title">
              <span class="file-queue-title-text">上传文件</span>
            </div>
          </div>
          <div class="task-list">
            <div class="task-item" v-for="file in fileList">
              <el-card class="box-card">
                <template #header>
                  <div class="card-header">
                    <span>{{ file.filename }}</span>
                  </div>
                </template>
                {{ JSON.stringify(file) }}
              </el-card>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import SparkMD5 from "spark-md5";
import uploadHttp from "@/api/upload";
import { reactive, ref } from "vue";
import type { TabsPaneContext, UploadInstance } from "element-plus";
import { onBeforeRouteLeave } from "vue-router";

// define tabs name
const tabName = {
  uploadBody: "uploadBody",
  uploadContent: "uploadContent",
};
const activeName = ref(tabName.uploadBody);

/**
 * 当 tabs name 改变之后
 */
const handleTabChange = (pane: TabsPaneContext) => {
  // console.log(pane);
};

// 文件列表
interface fileInfo {
  filename: string;
}
const fileList = reactive<fileInfo[]>([]);

// 文件分片列表
const chunkList = reactive([]);
let hash = "";
const percent = ref(0);
const fileUrl = ref("");
const upload = ref(true);
const percentCount = ref(0);
let filename = "";


/**
 * 文件列表改变时，将选取的文件分片
 *
 * @param file 选择的文件
 */
const handleFileListChange = async (file: any) => {
  if (!file) {
    return;
  }

  percent.value = 0;
  percentCount.value = 0;
  fileUrl.value = "";
  // 获取文件并转成 ArrayBuffer 对象
  console.log("fileParam", file);

  const fileObj = file.raw;
  filename = fileObj.name;
  console.log("filename1", filename);

  hash = await fileToBuffer(fileObj).then();

  console.log("hash", hash);

  // 将文件按固定大小（ 1M ）进行切片，注意此处声明了多个常量
  const chunkSize = 1048576,
    // 计算总共多少切片
    chunkListLength = Math.ceil(fileObj.size / chunkSize),
    // 文件后缀名
    suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1];

  // 生成切片，这里后端要求传递的参数为字节数据块（chunk）和每个数据块的文件名（fileName)
  // 切片时的初始位置
  let curChunk = 0;
  for (let i = 0; i < chunkListLength; ++i) {
    const item = {
      chunk: fileObj.slice(curChunk, curChunk + chunkSize),
      // 文件名按照 hash_1.jpg 的格式命名
      file: `${hash}_${i}.${suffix}`,
    };
    console.log("item", item);

    curChunk += chunkSize;
    chunkList.push(item);
  }
  fileList.push({ filename: fileObj.name });

  // 切换标签页并发起上传请求
  // activeName.value = tabName.uploadContent;
  sendUploadRequest();
};

/**
 * 发送上传当前文件分片的请求
 */
const sendUploadRequest = (): void => {
  // 请求集合
  const requestList = [];
  console.log("chunkList", chunkList);

  chunkList.forEach((item, index) => {
    const fn = () => {
      const formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("filename", item.file);

      return uploadHttp.chunk(formData).then((res) => {
        // 成功
        if (res.code === 200) {
          // 避免上传成功后会删除切片改变 chunkList 的长度影响到 percentCount 的值
          if (percentCount.value === 0) {
            percentCount.value = 100 / chunkList.length;
          }
          if (percent.value >= 100) {
            percent.value = 100;
          } else {
            // 改变进度
            percent.value += percentCount.value;
          }

          if (percent.value >= 100) {
            percent.value = 100;
          }

          // 一旦上传成功就删除这一个 chunk，方便断点续传
          chunkList.splice(index, 1);
        }
      });
    };
    requestList.push(fn);
  });

  console.log(requestList);

  // 记录发送的请求个数
  let i = 0;

  const send = async () => {
    if (!upload.value) {
      return;
    }
    console.log();
    if (i >= requestList.length) {
      // 发送完毕
      complete();
      return;
    }
    await requestList[i]();
    i++;
    console.log("文件块-" + i);
    send();
  };
  // 发送请求
  send();
};

// 文件切片全部发送完毕后，需要请求 "/merge" 接口，把文件的hash 传递给服务器
const complete = () => {
  uploadHttp.merge(hash, filename).then((res) => {
    // 请求发送成功
    if (res.code === 200) {
      // this.fileUrl = res.data.path;
      console.log(res);
    }
  });
};

/**
 * 点击暂停按钮
 */
const handleClickBtn = (): void => {
  upload.value = !upload.value;
  // 如果不暂停则继续上传
  if (upload.value) {
    sendUploadRequest();
  }
};

/**
 * 将 File 对象转为 ArrayBuffer
 */
const fileToBuffer = (file: File) => {
  console.log(file);
  const fr = new FileReader();

  fr.readAsArrayBuffer(file);

  return new Promise((resolve, reject) => {
    fr.onload = (e) => {
      console.log("e", e.target.result);
      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(e.target.result as ArrayBuffer);
      hash = spark.end();
      resolve(hash);
    };

    fr.onerror = (e) => {
      console.log(e)
      reject(new Error("转换文件格式发生错误"));
    };
  });
};

/**
 * 浏览器页面返回操作
 */
onBeforeRouteLeave((to, from, next) => {
  if (activeName.value === tabName.uploadContent) {
    activeName.value = tabName.uploadBody;
    // 清空文件列表信息
    fileList.length = 0;
  } else {
    next();
  }
});
</script>

<style scoped lang="less">
.file-up-app {
  height: 100%;

  .upload-body {
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    font-size: 14px;
    text-align: center;

    .upload-icon {
      width: 40px;
      height: 40px;
      color: #999;
    }

    .el-upload__text {
      margin-top: 6px;
    }

    .el-button-upload {
      color: #fff;
      margin: 20px auto;
      width: 200px;
      height: 44px;
      cursor: pointer;
      background: #00a1d6;
      border-radius: 4px;
      transition: background-color 0.3s ease;
      text-align: center;
      line-height: 40px;
      white-space: nowrap;
    }
  }
  .upload-content {
    width: 100%;
    .file-queue {
      padding: 10px 10px 10px 31px;
      height: 100%;
      overflow: hidden;
      .task-list {
        display: flex;
        width: 987px;
        align-items: center;
        margin-top: 11px;
        padding: 12px;
        padding-bottom: 0;
        background: #eeeeef;
        border-radius: 10px;
        flex-wrap: wrap;
      }
    }
    .file-queue-title {
      position: relative;
      font-size: 16px;
      line-height: 22px;
      font-weight: 600;
      color: #212121;
      line-height: 28px;
      height: 70px;
      box-shadow: 0 1px 0 #e7e7e7;
      display: flex;
      align-items: center;
    }
    .file-queue-title-text {
      padding-left: 2px;
    }
  }
}
.progress-box {
  box-sizing: border-box;
  width: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #ecf1ff;
  font-size: 14px;
  border-radius: 4px;
}

.file-upload-tabs {
  :deep(.el-tabs__header) {
    display: none;
  }
}
</style>
