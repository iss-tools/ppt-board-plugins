import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import NaivePropertyPanel from './components/NaivePropertyPanel.vue';
import NaiveWidget from './components/NaiveWidget.vue';

import { markRaw } from 'vue';
import * as NaiveUI from 'naive-ui';

export const NaiveUIPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-naiveui',

  install(ctx: CanvasPluginContext) {
    console.log('[NaiveUIPlugin] 🚀 Installing Naive UI Widget Engine...');

    // 1. Register the Universal Naive Widget
    const naiveComponents: Record<string, any> = {};
    for (const key of Object.keys(NaiveUI)) {
      if (key.startsWith('N')) {
         naiveComponents[key] = markRaw(NaiveWidget);
      }
    }

    ctx.api.elements.register({ 
      NaiveWidget: markRaw(NaiveWidget),
      ...naiveComponents
    });

    console.log('[NaiveUIPlugin] ✅ Registered NaiveWidget.');


    // 2. Register the Universal Property Panel Overlay
    // This panel will show up on the right when any 'N...' component is selected
    ctx.api.editor.registerOverlay({ component: NaivePropertyPanel, show: () => true });

    // 3. Register a Toolbar Item to quickly add a test Naive UI Button
    ctx.api.editor.registerToolbarItem({
      id: 'plugin-btn-add-naive-button',
      icon: '🟢',
      label: 'NButton',
      tooltip: 'Add Naive UI Button',
      position: 'right',
      onClick: () => {
        const id = `NButton_${Date.now()}`;
        ctx.api.elements.add({
          id,
          type: 'NButton',
          x: 100,
          y: 100,
          width: 120,
          height: 40,
          props: {
            type: 'primary'
          },
          slots: {
            default: 'Primary Button'
          }
        });
      },
    });

    // Add a test Card
    ctx.api.editor.registerToolbarItem({
      id: 'plugin-btn-add-naive-card',
      icon: '🗂️',
      label: 'NCard',
      tooltip: 'Add Naive UI Card',
      position: 'right',
      onClick: () => {
        const id = `NCard_${Date.now()}`;
        ctx.api.elements.add({
          id,
          type: 'NaiveWidget',
          x: 150,
          y: 150,
          width: 300,
          height: 200,
          props: {
            naiveType: 'NCard',
            title: 'Naive Card',
            hoverable: true
          },
          slots: {
            default: 'This is the card body content. You can add more HTML here.',
            header: 'Card Header Slot',
            footer: 'Card Footer Slot'
          }
        });
      },
    });
  },

  destroy() {
    console.log('[NaiveUIPlugin] 🛑 Plugin Destroyed.');
  },
};

// Export the plugin as default as well
export default NaiveUIPlugin;
