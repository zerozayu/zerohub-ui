import axios, { AxiosResponse } from "axios";
import { nanoid } from "nanoid";
import { transParams } from "@/utils/commons";
import cache from "@/plugins/cache"
// import useUserStore from "@/store/modules/user";
import errorCode from "@/utils/errorCode";
import { ElNotification, ElMessageBox, ElLoading, ElMessage } from "element-plus";

axios.defaults.headers["Content-Type"] = "application/json;chartset=utf-8";

// 创建 axios 实例
export const service: any = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    // 超时
    timeout: 1000 * 30
});

// 是否显示重新登录
export let isRelogin = { show: false };

// request 拦截器
service.interceptors.request.use(
    (config: any) => {
        // 是否需要设置 token
        const isToken = (config.headers || {}).isToken === false;
        // 是否需要防止数据重复提交
        const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;
        const requestId = nanoid();
        if (getToken() && !isToken) {
            // 请求加上随机 ID
            config.headers["RequestId"] = requestId;
            config.headers["Authorization"] = "Bearer " + getToken();
        }
        // get请求映射params参数
        if (config.method === "get" && config.params) {
            let url = config.url + "?" + transParams(config.params);
            url = url.slice(0, -1);
            config.params = {};
            config.url = url;
        }

        if (!isRepeatSubmit && (config.method === "post" || config.method === "put")) {
            const requestObj = {
                url: config.url,
                data: typeof config.data === "object" ? JSON.stringify(config.data) : config.data,
                time: new Date().getTime(),
            };

            const sessionObj = cache.session.getJSON("sessionObj");

            if (sessionObj === undefined || sessionObj == null || sessionObj === "") {
                cache.session.setJSON("sessionObj", requestObj);
            } else {
                // 请求地址
                const s_url = sessionObj.url;
                // 请求数据
                const s_data = sessionObj.data;
                // 请求时间
                const s_time = sessionObj.time;
                // 间隔时时间（ms），小于此时间视为重复提交
                const interval = 1000;

                if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
                    const message = "数据正在处理，请勿重复提交";
                    console.warn(`[${s_url}]: ` + message);
                    return Promise.reject(new Error(message));
                } else {
                    cache.session.setJSON("sessionObj", requestObj);
                }
            }
        }
        return config;
    },
    (error: Error) => {
        console.log(error);
        Promise.reject(error);
    }
)

// 响应拦截器
service.interceptors.response.use((res: AxiosResponse) => {
    // 未设置状态码则默认成功状态
    const code: number = res.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode[999];

    // 二进制数据则直接返回
    if (res.request.responseType === "blob" || res.request.responseType === "arraybuffer") {
        return res.data;
    }
    if (code === 401) {
        if (!isRelogin.show) {
            isRelogin.show = true;
            ElMessageBox.confirm(
                "登录状态已过期，您可以继续留在该页面，或者重新登陆",
                "系统提示",
                {
                    confirmButtonText: "重新登陆",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(() => {
                    isRelogin.show = false;
                    // todo 登录
                    // useUserStore().logOut().then(() => {
                    //     location.href = "/index";
                    // });
                })
                .catch(() => {
                    isRelogin.show = false;
                });
        }
        return Promise.reject("无效的回话，或者会话已过期，请重新登陆。")
    } else if (code === 500) {
        ElMessage({
            message: msg,
            type: "error",
        });
        return Promise.reject(new Error(msg));

    } else if (code !== 200) {
        ElNotification.error({
            title: msg
        });
        return Promise.reject("error");
    } else {
        return res.data;
    }
})



// todo getToken
function getToken() {
    return true;
}

export default service;
