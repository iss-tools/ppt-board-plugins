import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import AiPanel from './AiPanel.vue';

export const AIPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-ai',

  install(ctx: CanvasPluginContext) {
    console.log('[AIPlugin] 🚀 Plugin Installed Successfully!');

    // Inject the main AI Panel (contains floating button and the window)
    ctx.api.editor.registerOverlay({ component: AiPanel });
  },

  destroy() {
    console.log('[AIPlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};
