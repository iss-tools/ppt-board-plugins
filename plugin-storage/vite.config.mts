import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin(),
    vue(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    outDir: 'lib',
    emptyOutDir: false,
    sourcemap: false,
    lib: {
      entry: './src/index.ts',
      name: 'PluginStorage',
      fileName: (format) => `index.${format === 'es' ? 'esm' : (format === 'cjs' ? 'cjs' : format === 'iife' ? 'min' : format)}.js`,
      formats: ['es', 'cjs', 'umd', 'iife'],
    },
    rollupOptions: {
      external: ['naive-ui','vue','@iss-ai/ppt-board'],
      output: {
        globals: {
          vue: 'Vue',
          '@iss-ai/ppt-board': 'PptBoard',
        }
      }
    }
  }
});