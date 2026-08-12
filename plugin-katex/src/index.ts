import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import MathElement from './components/MathElement.vue';
import zhLocale from './locales/zh';
import enLocale from './locales/en';

export const KatexPlugin: CanvasPlugin = {
  name: 'plugin-katex',

  install(ctx: CanvasPluginContext) {
    console.log('[KatexPlugin] 🚀 Plugin Installed Successfully!');

    // 1. Register Locales (Assuming context has a way to register locales, or we merge them. 
    // If ctx.api.editor.t doesn't support dynamic registering, we can manually check or just use them locally.
    // For now, if the app uses i18n, we might need a standard way, but we will rely on ctx.api.editor.t with a fallback)
    // Here we can inject into the global window or just use it internally.
    const locales = {
      zh: zhLocale.katex,
      en: enLocale.katex,
    };
    
    // Polyfill translation if host doesn't have it
    const originalT = ctx.api.editor.t;
    ctx.api.editor.t = (key: string, ...args: any[]) => {
      if (key.startsWith('katex.')) {
        const lang = ctx.state.editor.language || 'zh';
        const keys = key.split('.').slice(1);
        let val: any = locales[lang as keyof typeof locales];
        for (const k of keys) {
          if (val) val = val[k];
        }
        if (val) return val;
      }
      return originalT ? originalT(key, ...args) : key;
    };

    // 2. Register MathElement Component
    if (ctx.api.elements && ctx.api.elements.register) {
      ctx.api.elements.register({ MathElement });
    }

    // 3. Register Toolbar Button
    if (ctx.api.editor && ctx.api.editor.registerToolbarItem) {
      ctx.api.editor.registerToolbarItem({
        id: 'katex-formula',
        icon: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4H6l6 8-6 8h12"></path></svg>',
        label: ctx.api.editor.t ? ctx.api.editor.t('katex.toolbar.tooltip') || '公式 (Formula)' : 'Formula',
        onClick: () => {
          // Get current view center to place the element
          const { offsetX, offsetY, scale } = ctx.state.runtime;
          const cx = (window.innerWidth / 2 - offsetX) / scale;
          const cy = (window.innerHeight / 2 - offsetY) / scale;
          
          const newId = `MathElement_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          ctx.api.elements.add({
            id: newId,
            type: 'MathElement',
            x: cx - 100,
            y: cy - 30,
            width: 200,
            height: 80,
            props: {
              latex: 'a^2 + b^2 = c^2',
              fontSize: 32,
            }
          });
          
          // Select it automatically
          if (ctx.state.runtime) {
            ctx.state.runtime.selectedIds.clear();
            ctx.state.runtime.selectedIds.add(newId);
          }
        }
      });
    }

    // 6. Handle Paste Event via hooks
    const handlePaste = (e: ClipboardEvent | null, pasteContext: any, rawText: string, html: string, mouseX: number, mouseY: number) => {
      // Only process paste if we are in edit mode
      if (ctx.state.runtime.mode !== 'edit') return;
      if (pasteContext && pasteContext.handled) return;

      const text = rawText ? rawText.trim() : '';
      if (!text) return;

      // Check if it's LaTeX (heuristic)
      const isLatex = text.startsWith('$$') || text.startsWith('\\') || (text.startsWith('$') && text.endsWith('$'));
      if (isLatex) {
        if (pasteContext) {
          pasteContext.handled = true;
        }
        
        let latex = text;
        // clean up $$ or $ wrapping
        if (latex.startsWith('$$') && latex.endsWith('$$')) {
          latex = latex.substring(2, latex.length - 2).trim();
        } else if (latex.startsWith('$') && latex.endsWith('$')) {
          latex = latex.substring(1, latex.length - 1).trim();
        }

        ctx.api.elements.add({
          id: `MathElement_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'MathElement',
          x: mouseX - 100,
          y: mouseY - 50,
          width: 200,
          height: 100,
          props: {
            latex,
            fontSize: 24,
          }
        });
      }
    };
    
    ctx.hooks.on('paste', handlePaste);
    
    // Store it so we can remove it on destroy
    (this as any)._pasteHandler = handlePaste;
    (this as any)._ctx = ctx;
  },

  destroy() {
    console.log('[KatexPlugin] 🛑 Plugin Destroyed');
    if ((this as any)._pasteHandler && (this as any)._ctx) {
      (this as any)._ctx.hooks.off('paste', (this as any)._pasteHandler);
    }
  },
};

export default KatexPlugin;
