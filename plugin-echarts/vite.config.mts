import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

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
      name: 'PluginEcharts',
      fileName: (format) => `index.${format === 'es' ? 'esm' : (format === 'cjs' ? 'cjs' : format === 'iife' ? 'min' : format)}.js`,
      formats: ['es', 'cjs', 'umd', 'iife'],
    },
    rollupOptions: {
      external: ['@iss-ai/ppt-board','vue', 'naive-ui', /^echarts/],
      output: {
        globals: {
          vue: 'Vue',
          '@iss-ai/ppt-board': 'PptBoard',
          'naive-ui': 'naive',
          'echarts': 'echarts'
        }
      }
    }
  }
});