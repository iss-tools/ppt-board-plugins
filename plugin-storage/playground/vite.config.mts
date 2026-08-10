import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [
    UnoCSS(),
    vue()
  ],
  resolve: {
    alias: {
      '@iss-ai/ppt-board': path.resolve(__dirname, '../../../ppt-board/src/index.ts'),
      '@iss-ai/vue-canvas-core': path.resolve(__dirname, '../../../vue-canvas-core/src/index.ts')
    }
  }
});