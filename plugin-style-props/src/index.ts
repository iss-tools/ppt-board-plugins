import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import MainPanel from './MainPanel.vue';

export const StylePropsPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-style-props',

  install(ctx: CanvasPluginContext) {
    console.log('[StylePropsPlugin] 🚀 Plugin Installed Successfully!');

    // Inject the main overlay containing tabs
    ctx.api.editor.registerOverlay({ component: MainPanel });
  },

  destroy() {
    console.log('[StylePropsPlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};
