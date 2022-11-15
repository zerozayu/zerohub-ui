import axios from "axios";
import { ElMessage } from "element-plus";

/**
 * upload 使用，去除短时间重复提交校验
 * ToDo 尚未添加 token
 */

export const service: any = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 1000 * 30
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token
    if (localStorage.getItem("token")) {
      config.headers.Authorization = "Bearer " + localStorage.getItem("token");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    ElMessage.error(error.response.data.message);
    return Promise.reject(error.response.data);
  }
);

export default service;
