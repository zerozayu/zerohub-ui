<template>
  <div class="uploadWrapper">
    <el-upload
      action="#"
      multiple
      :auto-upload="false"
      :show-file-list="true"
      :on-change="handleChange"
      drag
    >
      <!-- 这个图标的书写方式，element-plus和element有区别，注意一下！ -->
      <el-icon class="el-icon-upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
  </div>

  <!-- 进度显示 -->
  <div class="progress-box">
    <span>上传进度：{{ percent.toFixed() }}%</span>
    <el-button type="primary" size="small" @click="handleClickBtn">{{
      upload ? " 暂停" : "继续"
    }}</el-button>
  </div>
</template>

<script lang="ts" setup>
import SparkMD5 from "spark-md5";
import uploadHttp from "@/api/upload";
import { reactive, ref } from "vue";

const chunkList = reactive([]);
const hash = ref("");
const percent = ref(0);
const fileUrl = ref("");
const upload = ref(true);
const percentCount = ref(0);
const filename = ref("");

const handleChange = async (file: any) => {
  if (!file) {
    return;
  }

  percent.value = 0;
  percentCount.value = 0;
  fileUrl.value = "";
  // 获取文件并转成 ArrayBuffer 对象
  const fileObj = file.raw;
  filename.value = fileObj.name;
  let buffer: ArrayBuffer;
  buffer = (await fileToBuffer(fileObj).catch((e: Error) => {
    console.log(e);
  })) as ArrayBuffer;

  // 将文件按固定大小（ 6M）进行切片，注意此处声明了多个常量
  const chunkSize = 1048576,
    // 计算总共多少切片
    chunkListLength = Math.ceil(fileObj.size / chunkSize),
    // 文件后缀名
    suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1];

  // 根据文件内容生成 hash 值
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(buffer);
  hash.value = spark.end();

  // 生成切片，这里后端要求传递的参数为字节数据块（chunk）和每个数据块的文件名（fileName)
  // 切片时的初始位置
  let curChunk = 0;
  for (let i = 0; i < chunkListLength; ++i) {
    const item = {
      chunk: fileObj.slice(curChunk, curChunk + chunkSize),
      // 文件名按照 hash_1.jpg 的格式命名
      filename: `${hash.value}_${i}.${suffix}`,
    };
    curChunk += chunkSize;
    chunkList.push(item);
  }

  sendRequest();
};

const sendRequest = (): void => {
  // 请求集合
  const requestList = [];
  console.log("chunkList", chunkList);

  chunkList.forEach((item, index) => {
    const fn = () => {
      const formData = new FormData();
      formData.append("chunk", item.chunk);
      formData.append("filename", item.filename);
      console.log("item", item);
      console.log("formData", formData);

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
  // 文件切片全部发送完毕后，需要请求 "/merge" 接口，把文件的hash 传递给服务器
  const complete = () => {
    uploadHttp.merge(hash.value, filename.value).then((res) => {
      // 请求发送成功
      if (res.code === 200) {
        // this.fileUrl = res.data.path;
        console.log(res);
      }
    });
  };

  const send = async () => {
    if (!upload.value) {
      return;
    }
    if (i >= requestList.length) {
      // 发送完毕
      complete();
      return;
    }
    await requestList[i]();
    i++;
    send();
  };
  // 发送请求
  send();
};

const handleClickBtn = (): void => {
  upload.value = !upload.value;
  // 如果不暂停则继续上传
  if (upload.value) {
    sendRequest();
  }
};

/**
 * 将 File 对象转为 ArrayBuffer
 */
const fileToBuffer = (file: any): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e) => {
      resolve(e.target?.result as ArrayBuffer);
    };
    fr.readAsArrayBuffer(file);
    fr.onerror = () => {
      reject(new Error("转换文件格式发生错误"));
    };
  });
};
</script>

<style scoped lang="less">
.progress-box {
  box-sizing: border-box;
  width: 360px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #ecf1ff;
  font-size: 14px;
  border-radius: 4px;
}
.uploadWrapper {
  width: 360px;
}
</style>
