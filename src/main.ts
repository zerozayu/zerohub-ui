import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import store from '@/store/index';
import "./assets/style/global.less";
import router from './router';

// element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// svg 图标
import 'virtual:svg-icons-register'


createApp(App)
// 可以传入一个包含 size 和 zIndex 属性的全局配置对象。 size 用于设置表单组件的默认尺寸，zIndex 用于设置弹出组件的层级，zIndex 的默认值为 2000。
.use(ElementPlus, { size: 'small', zIndex: 3000 })
.use(store)
.use(router)
.mount('#app');

