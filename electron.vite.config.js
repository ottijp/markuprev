import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  main: {
  },
  preload: {
    build: {
      rollupOptions: {
        input: [
          'src/preload/index.js',
          'src/preload/preload-webview.js',
        ],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [
      vue(),
      vuetify(),
    ],
  },
})
