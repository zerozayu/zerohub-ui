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
            :on-change="handleChange"
            drag
          >
            <svg-icon class="upload-icon" name="upload"></svg-icon>
            <div class="el-upload__text">拖拽到此处也可以添加</div>

            <el-button class="el-button-upload" size="large" type="primary"
              >添加待上传文件</el-button
            >
          </el-upload>

          <!-- 进度显示 -->
          <!-- <div class="progress-box">
            <span>上传进度：{{ percent.toFixed() }}%</span>
            <el-button type="primary" size="small" @click="handleClickBtn">{{
              upload ? " 暂停" : "继续"
            }}</el-button>
          </div> -->
        </div>
      </el-tab-pane>
      <el-tab-pane lazy :name="tabName.uploadContent">
        <div class="upload-content">
          <div class="file-quexue">
            <div class="file-queue-title">
              <span class="file-queue-title-text">上传文件</span>
            </div>
          </div>
          <el-button type="primary" @click="handleClickUploadBtn"
            >上传文件</el-button
          >
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
import uploadHttp from "@/api/upload";
import { ElButton, ElCard, ElTabPane, ElTabs, ElUpload, TabPaneName, TabsPaneContext } from "element-plus";
import SparkMD5 from "spark-md5";
import { reactive, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

/**
 * 切换标签页
 */
// 定义标签名
const tabName = {
  uploadBody: "uploadBody",
  uploadContent: "uploadContent",
};

const activeName = ref(tabName.uploadBody);

// 当 tabsname 改变之后
const handleTabChange = (name: TabPaneName) => {
  console.log(name);
  
};

// 浏览器页面返回操作
onBeforeRouteLeave((to, from, next) => {
  if (activeName.value === tabName.uploadContent) {
    activeName.value = tabName.uploadBody;
    // 清空文件列表信息
    fileList.length = 0;
  } else {
    next();
  }
});

/**
 * 文件上传-预处理阶段
 */
// 文件
interface FileInfo {
  filename: string;
  fileHash: string;
  chunkList: ChunkInfo[];
}

interface ChunkInfo {
  chunk: Blob;
  chunkHash: string;
  currChunkNo: number;
}

const fileList = reactive([]);

// 文件状态改变时
const handleChange = async (file: any) => {
  if (!file) {
    console.log("取消文件选择");
    return;
  }

  const fileObj = file.raw;

  // 切换 tabs 标签页
  activeName.value = tabName.uploadContent;

  const fileInfo: FileInfo = await handleFile(fileObj).catch();

  fileList.push(fileInfo);
};

const handleFile = (file: File): Promise<FileInfo> => {
  // 将文件按固定大小进行切片(5MB)
  const chunkSize = 5 * 1024 * 1024;
  // 切片数量
  const chunkListLength = Math.ceil(file.size / chunkSize);
  // 文件后缀名
  const fileSuffix = /\.([0-9A-z]+)$/.exec(file.name)[1];

  // 切片列表
  const chunkList = [];
  // 当前文件切片序号
  let currChunkNo = 0;
  // 当前文件块
  let currChunk: Blob;
  // 当前时间
  let time = new Date().getTime();

  const fileReader = new FileReader();
  const spark = new SparkMD5.ArrayBuffer();
  const chunkSpark = new SparkMD5.ArrayBuffer();

  const loadNext = () => {
    let start = currChunkNo * chunkSize;
    let end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    currChunk = file.slice(start, end);

    fileReader.readAsArrayBuffer(currChunk);
  };
  loadNext();

  return new Promise((resolve, reject) => {
    // 处理load事件。该事件在读取操作完成时触发。
    fileReader.onload = async (ev) => {
      spark.append(ev.target.result as ArrayBuffer);
      currChunkNo++;
      chunkSpark.append(ev.target.result as ArrayBuffer);
      const chunkHash = chunkSpark.end();
      chunkSpark.reset();

      // todo 校验此文件块是否存在  以及同名文件怎么剔除
      const checkResult = await uploadHttp
        .check(chunkHash, currChunkNo.toString())
        .then()
        .catch();

      // 切片未完成
      if (currChunkNo <= chunkListLength) {
        console.log(
          `第${currChunkNo}/${chunkListLength}分片解析完成\n该分片的 hash 值为${chunkHash}\n`
        );
        console.log("checkResult", checkResult);

        if (!checkResult.data) {
          // 记录 chunkList
          const chunkObj: ChunkInfo = {
            chunk: currChunk,
            chunkHash: chunkHash,
            currChunkNo: currChunkNo,
          };
          chunkList.push(chunkObj);
        }
        loadNext();
      }
      // 切片完成
      else {
        console.log("加载完成");
        let fileHash = spark.end(); //得到md5

        // 完整需上传的列表信息
        const fileInfo: FileInfo = {
          filename: file.name,
          fileHash: fileHash,
          chunkList: chunkList,
        };

        console.log(
          `MD5计算完成：${
            file.name
          } \n文件Hash(MD5)为：${fileHash} \n分片：${chunkListLength} 大小:${
            file.size
          } 用时：${new Date().getTime() - time} ms`
        );
        // 释放spark缓存
        spark.destroy();
        chunkSpark.destroy();
        resolve(fileInfo);
      }
    };
    fileReader.onerror = () => {
      console.warn("文件切片出现错误");
      reject(new Error("文件切片出现错误"));
    };
  });
};

/**
 * 文件上传-发送文件相关操作
 */
const requestList = [];
// 点击上传按钮
const handleClickUploadBtn = () => {
  console.log("fileList", fileList);

  // todo 修改为 web worker 进行操作
  fileList.forEach((fileInfo, index) => {
    const filename: string = fileInfo.filename;
    const fileHash: string = fileInfo.fileHash;
    const chunkList: ChunkInfo[] = fileInfo.chunkList;
    console.log(
      `filename: ${filename}\nfileHash: ${fileHash}\nchunkList: `,
      chunkList
    );
    chunkList.forEach((chunkInfo, index) => {
      const fn = () => {
        const formData = new FormData();
        formData.append("chunk", chunkInfo.chunk);
        formData.append("fileHash", fileHash);
        formData.append("chunkHash", chunkInfo.chunkHash);
        formData.append("currChunkNo", chunkInfo.currChunkNo.toString());

        return uploadHttp.chunk(formData).then((res) => {
          console.log(res);
        });
      };
      requestList.push(fn);
    });

    console.log("requestList", requestList);

    sendUploadFileListRequest(filename, fileHash);
  });
};

// 发送上传文件列表请求
let i = 0;
const sendUploadFileListRequest = async (
  filename: string,
  fileHash: string
) => {
  if (i >= requestList.length) {
    console.log("文件分片发送完毕");

    // 发送完毕
    sendMergeFileListRequest(filename, fileHash);
    return;
  }
  await requestList[i]();
  i++;
  console.log("文件块-" + i + "发送完毕");
  sendUploadFileListRequest(filename, fileHash);
};

// 发送合并文件列表请求
const sendMergeFileListRequest = (filename: string, fileHash: string) => {
  uploadHttp.merge(fileHash, filename).then((res) => {
    if (res.code === 200) {
      console.log(`mergeRequestResponse\n${filename}`, res);
    }
  });
};
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
