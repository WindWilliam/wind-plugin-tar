/*
 * @Author: zf
 * @Date: 2024-08-25 14:39:40
 * @Description: 编译配置
 */

import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'vite-plugin-tar',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [/node:.*/],
      output: {
        exports: 'named',
      },
    },
  },
})