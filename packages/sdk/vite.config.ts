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
      external: ['@msw-controller/core'],
      output: {
        globals: {
          '@msw-controller/core': 'MSWControllerCore'
        }
      }
    },
    sourcemap: true,
    minify: true
  }
})