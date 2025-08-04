import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts']
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MSWControllerSDK',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // 完全移除外部依赖配置，让所有依赖都被打包进来
    },
    sourcemap: true,
    minify: true
  }
})