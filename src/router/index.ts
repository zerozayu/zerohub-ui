import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// 1. 定义路由组件.
// 也可以从其他文件导入
const Home = () => import("@/views/Home.vue");
const Search = () => import("@/views/search/index.vue");
const Upload = () => import("@/views/upload/upload.vue");
const Video = () => import("@/views/video/video.vue");


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        meta: {
            title: "首页",
        },
        component: Home,
    },
    {
        path: "/upload",
        name: "upload",
        meta: {
            title: "upload",
        },
        component: Upload,
    },
    {
        path: "/search",
        name: "search",
        meta: {
            title: "search",
        },
        component: Search,
    },
    {
        path: "/video",
        name: "video",
        meta: {
            title: "video",
        },
        component: Video,
    },
];

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
     // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHistory(),
    routes, // `routes: routes` 的缩写
});

export default router;

