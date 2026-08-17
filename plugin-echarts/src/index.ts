import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import EChartsElement from './components/EChartsElement.vue';
import ETableElement from './components/ETableElement.vue';
import PastePromptOverlay from './components/PastePromptOverlay.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { requestPasteChoice } from './store';
import { useI18n } from './composables/useI18n';

export const EChartsPlugin: CanvasPlugin = {
  name: 'plugin-echarts',

  install(ctx: CanvasPluginContext) {
    console.log('[EChartsPlugin] 🚀 Plugin Installed Successfully!');

    // 1. Register Components
    if (ctx.api.elements && ctx.api.elements.register) {
      ctx.api.elements.register({ 
        echarts: EChartsElement,
        'e-table': ETableElement 
      });
    }

    // 2. Register UI Overlay
    if (ctx.api.editor && ctx.api.editor.registerOverlay) {
      ctx.api.editor.registerOverlay({ component: PastePromptOverlay });
      ctx.api.editor.registerOverlay({ component: SettingsPanel });
    }

    // 3. Register Toolbar Items
    const { t } = useI18n(ctx);
    if (ctx.api.editor && ctx.api.editor.registerToolbarItem) {
      const defaultData = [
        ['Product', '2015', '2016', '2017'],
        ['Matcha Latte', '43.3', '85.8', '93.7'],
        ['Milk Tea', '83.1', '73.4', '55.1'],
        ['Cheese Cocoa', '86.4', '65.2', '82.5'],
        ['Walnut Brownie', '72.4', '53.9', '39.1']
      ];

      // Add Chart
      ctx.api.editor.registerToolbarItem({
        id: 'echarts-add-chart',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',
        get label() { return t('echarts.toolbar.addChart'); },
        onClick: () => {
          const { offsetX, offsetY, scale } = ctx.state.runtime;
          const cx = (window.innerWidth / 2 - offsetX) / scale;
          const cy = (window.innerHeight / 2 - offsetY) / scale;
          const newId = `echarts_${Date.now()}`;
          ctx.api.elements.add({
            id: newId,
            type: 'echarts',
            x: cx - 200,
            y: cy - 150,
            width: 400,
            height: 300,
            props: { dataset: { source: defaultData } }
          });
          if (ctx.state.runtime) {
            ctx.state.runtime.selectedIds.clear();
            ctx.state.runtime.selectedIds.add(newId);
          }
        }
      });

      // Add Table
      ctx.api.editor.registerToolbarItem({
        id: 'echarts-add-table',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
        get label() { return t('echarts.toolbar.addTable'); },
        onClick: () => {
          const { offsetX, offsetY, scale } = ctx.state.runtime;
          const cx = (window.innerWidth / 2 - offsetX) / scale;
          const cy = (window.innerHeight / 2 - offsetY) / scale;
          const newId = `e-table_${Date.now()}`;
          ctx.api.elements.add({
            id: newId,
            type: 'e-table',
            x: cx - 200,
            y: cy - 150,
            width: 400,
            height: 300,
            props: { dataset: { source: defaultData } }
          });
          if (ctx.state.runtime) {
            ctx.state.runtime.selectedIds.clear();
            ctx.state.runtime.selectedIds.add(newId);
          }
        }
      });
    }

    // 3. Handle Paste Event via hooks
    const handlePaste = async (e: ClipboardEvent | null, pasteContext: any, rawText: string, html: string, mouseX: number, mouseY: number) => {
      console.log('[EChartsPlugin] handlePaste triggered', { rawText, html, pasteContext });
      if (ctx.state.runtime.mode !== 'edit') return;
      if (pasteContext && pasteContext.handled) return;

      const text = rawText ? rawText.trim() : '';
      
      // Detect tabular data (TSV or HTML Table)
      const isTableHtml = html && html.toLowerCase().includes('<table');
      const isTsv = text.includes('\t');

      console.log('[EChartsPlugin] detection:', { isTableHtml, isTsv, hasNewline: text.includes('\n') });

      if (isTableHtml || isTsv || (text && text.includes('\n') && !text.includes('<svg'))) {
        console.log('[EChartsPlugin] Matched table conditions, handling...');
        // Mark as handled to prevent core fallback synchronously!
        if (pasteContext) {
          pasteContext.handled = true;
          console.log('[EChartsPlugin] set pasteContext.handled = true', pasteContext);
        }

        // Parse to 2D Array
        const lines = text ? text.split('\n') : [];
        const dataMatrix = lines.length > 0 
          ? lines.map(line => line.split('\t').map(cell => cell.trim()))
          : [['Data from HTML (parsing not implemented)']];

        // Show prompt and wait for user choice
        const choice = await requestPasteChoice(dataMatrix, mouseX, mouseY);

        if (choice === 'cancel') return;

        const newId = `${choice === 'chart' ? 'echarts' : 'e-table'}_${Date.now()}`;
        
        ctx.api.elements.add({
          id: newId,
          type: choice === 'chart' ? 'echarts' : 'e-table',
          x: mouseX,
          y: mouseY,
          width: choice === 'chart' ? 400 : 300,
          height: choice === 'chart' ? 300 : 200,
          props: {
            dataset: {
              source: dataMatrix
            }
          }
        });
        
        if (ctx.state.runtime) {
          ctx.state.runtime.selectedIds.clear();
          ctx.state.runtime.selectedIds.add(newId);
        }
      }
    };

    ctx.hooks.on('paste', handlePaste);

    // Store it so we can remove it on destroy
    (this as any)._pasteHandler = handlePaste;
    (this as any)._ctx = ctx;
  },

  destroy() {
    console.log('[EChartsPlugin] 🛑 Plugin Destroyed');
    if ((this as any)._pasteHandler && (this as any)._ctx) {
      (this as any)._ctx.hooks.off('paste', (this as any)._pasteHandler);
    }
  },
};

export default EChartsPlugin;
