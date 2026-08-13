import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    UnoCSS(),
    vue()
  ]
});