import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const HelloWorld = () => import("@/components/HelloWorld.vue");

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "index",
        meta: {
            title: "首页",
        },
        component: HelloWorld,
    },
    {
        path: "/helloworld",
        name: "helloworld",
        meta: {
            title: "helloworld",
        },
        component: HelloWorld,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

