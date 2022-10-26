import { defineStore, createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist';

interface GlobalState {
    token: string,
    userInfo: any
}


// defineStore 调用后返回一个函数，调用该函数获得 Store 实体
export const GlobalStore = defineStore({
    // id: 必须的，在所有的 Store 中唯一的
    id: 'GlobalState',
    // state: 返回对象的函数
    state: (): GlobalState => ({
        token: '',
        userInfo: {},
    }),
    getters: {},
    actions: {
        // 不使用箭头函数
        setToken(token: string) {
            this.token = token;
        },
        setUserInfo(userInfo: any) {
            this.userInfo = userInfo;
        },
    },
    // 持久化
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'GlobalState',
                storage: localStorage,
                // storage: sessionStorage,
            }
        ]
    },
});

const pinia = createPinia();
pinia.use(piniaPersist);

export default pinia;
