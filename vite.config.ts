import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// jsx 语法支持
import vueJsx from '@vitejs/plugin-vue-jsx';

// 设置别名
import * as path from 'path';

// 按需导入-自动导入
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// svg 图标
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';



// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 获取环境配置文件
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      vueJsx({}),
      // AutoImport({
      //   resolvers: [ElementPlusResolver()],
      // }),
      // Components({
      //   resolvers: [ElementPlusResolver()],
      // }),
      createSvgIconsPlugin({
        // 指定需要缓存的图标文件夹
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // 指定symbolId格式
        symbolId: '[name]',

        /**
         * 自定义插入位置
         * @default: body-last
         */
        // inject?: 'body-last' | 'body-first'

        /**
         * custom dom id
         * @default: __svg__icons__dom__
         */
        // customDomId: '__svg__icons__dom__',
      }),
    ],
    resolve: {
      // 设置别名
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      // css 预处理器
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(__dirname, 'src/assets/style/global.less')}";`,
        }
      }
    },
    server: {
      host: "0.0.0.0", // 默认为localhost
      port: 4444, // 端口号
      open: false, // 是否自动打开浏览器
      proxy: {
        // 本地开发环境通过代理实现跨域，生产环境使用 nginx 转发
        "/dev-api": {
          target: "http://localhost:8081", // 后端服务实际地址
          changeOrigin: true,
          //rewrite: (path) => path.replace(/^\/dev-api/, ""),
          rewrite: path => path.replace(new RegExp('^' + env.VITE_APP_BASE_API), '')
        },
      },
    },
  }

})
