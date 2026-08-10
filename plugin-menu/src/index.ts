import { CanvasPlugin, CanvasPluginContext, CanvasEventNames } from '@iss-ai/ppt-board';
import MenuPanel from './MenuPanel.vue';
import BottomLeftControls from './components/BottomLeftControls.vue';
import BottomRightHelp from './components/BottomRightHelp.vue';

export const MenuPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-menu',

  install(ctx: CanvasPluginContext) {
    console.log('[MenuPlugin] 🚀 Plugin Installed Successfully!');

    const show = () => {
      return ctx.state.runtime.mode !== 'preview';
    };

    // Inject the menu panel (top-left menu)
    ctx.api.editor.registerOverlay({ show, component: MenuPanel });
    // Inject the zoom and undo/redo controls (bottom-left)
    ctx.api.editor.registerOverlay({ show, component: BottomLeftControls });
    // Inject the help button (bottom-right)
    ctx.api.editor.registerOverlay({ show, component: BottomRightHelp });
  },

  destroy() {
    console.log('[MenuPlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};
