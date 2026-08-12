import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import MyLibraryPanel from './MyLibraryPanel.vue';
import { initStore, pluginState, addPersonalComponent } from './store';
import { parseExcalidrawElements } from './utils/excalidraw-parser';

export const MyLibraryPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-my-library',

  install(ctx: CanvasPluginContext, options?: { libraryUrl?: string }) {
    console.log('[MyLibraryPlugin] 🚀 Plugin Installed Successfully!');

    if (options?.libraryUrl) {
      pluginState.libraryUrl = options.libraryUrl;
    }

    // Intercept URL for dynamic library import (e.g., ?addLibrary=... or #addLibrary=...)
    const checkUrlForLibrary = () => {
      let addLibrary: string | null = null;
      let token: string | null = null;
      let isHash = false;
      
      // Check query parameters first
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('addLibrary')) {
        addLibrary = searchParams.get('addLibrary');
        token = searchParams.get('token');
      } 
      // Fallback to hash parameters (Excalidraw style)
      else if (window.location.hash.includes('addLibrary=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        addLibrary = hashParams.get('addLibrary');
        token = hashParams.get('token');
        isHash = true;
      }
      
      if (addLibrary) {
        let url = decodeURIComponent(addLibrary);
        if (token) {
          url += (url.includes('?') ? '&' : '?') + `token=${token}`;
        }
        
        pluginState.pendingImportUrl = url;
        pluginState.isDrawerVisible = true;
        
        // Clean up the URL so it doesn't trigger again on reload
        const newUrl = new URL(window.location.href);
        if (isHash) {
          newUrl.hash = '';
        } else {
          newUrl.searchParams.delete('addLibrary');
          newUrl.searchParams.delete('token');
        }
        window.history.replaceState(null, '', newUrl.toString());
      }
    };

    window.addEventListener('hashchange', checkUrlForLibrary);
    // Check initially in case the app was loaded with the hash or query string
    setTimeout(checkUrlForLibrary, 500); // Slight delay to let UI mount

    // Initialize state & sync with persistent data
    initStore(ctx);

    // Register Overlay panel which now includes the toggle button
    ctx.api.editor.registerOverlay({ component: MyLibraryPanel });

    // Register addToLibrary handler to save components to personal library
    ctx.hooks.on('addToLibrary', async (elements: any[]) => {
      try {
        await addPersonalComponent(elements);
        // Optionally auto-open the panel to show the newly added item
        pluginState.isPanelVisible = true;
      } catch (e) {
        console.error('Failed to add to library', e);
      }
    });

    // Register paste handler to intercept excalidraw components
    ctx.hooks.on('paste', (e: any, pasteContext: any, text: string, html: string, mouseX: number, mouseY: number) => {
      console.log('[MyLibraryPlugin] Received paste event!', { handled: pasteContext.handled, textLength: text?.length, htmlLength: html?.length });
      if (pasteContext.handled) return;
      try {
        console.log('[MyLibraryPlugin] Attempting to parse JSON...');
        const parsed = JSON.parse(text);
        console.log('[MyLibraryPlugin] Parsed JSON:', { type: parsed?.type, hasElements: Array.isArray(parsed?.elements) });
        if (parsed && parsed.type === 'excalidraw/clipboard' && Array.isArray(parsed.elements)) {
          console.log('[MyLibraryPlugin] Match! Processing excalidraw elements...');
          pasteContext.handled = true;
          
          const newElements = parseExcalidrawElements(parsed.elements);
          if (newElements.length === 0) {
            console.log('[MyLibraryPlugin] No valid elements found after parsing.');
            return;
          }

          // Center elements on mouse cursor
          let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
          newElements.forEach(el => {
            if (el.x < minX) minX = el.x;
            if (el.y < minY) minY = el.y;
            if (el.x + (el.width || 0) > maxX) maxX = el.x + (el.width || 0);
            if (el.y + (el.height || 0) > maxY) maxY = el.y + (el.height || 0);
          });

          const centerX = minX + (maxX - minX) / 2;
          const centerY = minY + (maxY - minY) / 2;
          const diffX = mouseX - centerX;
          const diffY = mouseY - centerY;

          const newGroupIds: Record<string, string> = {};
          ctx.state.runtime.selectedIds.clear();

          newElements.forEach((el, idx) => {
            const newId = `${el.type}_${Date.now()}_${idx}`;
            el.id = newId;
            el.x += diffX;
            el.y += diffY;

            if (el.groupId) {
              if (!newGroupIds[el.groupId]) {
                newGroupIds[el.groupId] = `group_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
              }
              el.groupId = newGroupIds[el.groupId];
            }

            ctx.api.elements.add(el);
            ctx.state.runtime.selectedIds.add(newId);
          });
          console.log('[MyLibraryPlugin] Successfully pasted excalidraw elements:', newElements.length);
        }
      } catch (err) {
        console.error('[MyLibraryPlugin] Paste handler error:', err);
      }
    });
  },

  destroy() {
    console.log('[MyLibraryPlugin] 🛑 Plugin Destroyed.');
    if ((this as any)._cleanup) {
      (this as any)._cleanup();
    }
    // Note: If we had a reference to checkHashForLibrary, we could removeEventListener here.
  },
};
