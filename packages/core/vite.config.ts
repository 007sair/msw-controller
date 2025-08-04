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
      name: 'MSWControllerCore',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['msw', 'msw/browser'],
      output: {
        globals: {
          'msw': 'MSW',
          'msw/browser': 'MSWBrowser'
        }
      }
    },
    sourcemap: true,
    minify: false
  }
})