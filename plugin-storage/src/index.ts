import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import DocumentStoragePanel from './components/DocumentStoragePanel.vue';

export const StoragePlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-storage',

  install(ctx: CanvasPluginContext) {
    console.log('[StoragePlugin] 🚀 Plugin Installed Successfully!');

    // Inject a floating panel into the canvas area
    ctx.api.editor.registerOverlay({ component: DocumentStoragePanel });
  },

  destroy() {
    console.log('[StoragePlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};

// Keep ExamplePlugin for backward compatibility if playground uses it
export const ExamplePlugin = StoragePlugin;
