import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import EChartsElement from './components/EChartsElement.vue';
import ETableElement from './components/ETableElement.vue';
import PastePromptOverlay from './components/PastePromptOverlay.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { requestPasteChoice } from './store';

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
