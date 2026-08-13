import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import ExampleOverlay from './ExampleOverlay.vue';

export const ExamplePlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-example',

  install(ctx: CanvasPluginContext) {
    console.log('[ExamplePlugin] 🚀 Plugin Installed Successfully!');

    // ==========================================
    // 1. LISTEN TO CORE EVENTS
    // ==========================================
    ctx.hooks.on('change', () => {
      console.log(`[ExamplePlugin] Canvas changed!`);
    });

    ctx.hooks.on('select', selectedIds => {
      console.log(`[ExamplePlugin] Selection updated:`, selectedIds);
    });

    ctx.hooks.on('language-change', lang => {
      console.log(`[ExamplePlugin] Language switched to: ${lang}`);
    });

    // ==========================================
    // 2. INJECT UI COMPONENTS
    // ==========================================
    // Inject a floating panel into the canvas area
    ctx.api.editor.registerOverlay({ component: ExampleOverlay });

    // ==========================================
    // 3. REGISTER TOOLBAR ACTIONS
    // ==========================================
    ctx.api.editor.registerToolbarItem({
      id: 'plugin-btn-add-rect',
      icon: '⭐', // You can use emoji or SVG HTML strings here
      label: 'test button!',
      tooltip: 'Example: Add Golden Rect',
      position: 'right',
      onClick: () => {
        // Use context API to mutate the canvas safely
        ctx.api.elements.add({
          id: `rect_${Date.now()}`,
          type: 'TextElement',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          props: {
            text: 'I am from Plugin!',
            style: 'background-color: #ffcc00; border: 2px solid #333; border-radius: 8px;',
          }
        });
        alert('Added a Golden Rectangle to the canvas via Plugin API!');
      },
    });

    // ==========================================
    // 4. CONTEXT MENU ACTIONS
    // ==========================================
    ctx.api.editor.registerContextMenuItem({
      id: 'plugin-ctx-log',
      label: 'Print Info to Console',
      icon: '🖨️',
      show: menuCtx => {
        // Only show if user has selected at least 1 element
        return menuCtx.selectedIds.length > 0;
      },
      onClick: menuCtx => {
        console.log('[ExamplePlugin] Printing selected element IDs:', menuCtx.selectedIds);
      },
    });
  },

  destroy() {
    console.log('[ExamplePlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};
