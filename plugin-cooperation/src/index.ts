import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import CooperationPanel from './CooperationPanel.vue';
import { initStore, ablySync } from './store';

export interface CooperationPluginOptions {
  useP2P?: boolean;
  ablyApiKey?: string;
}

export function createCooperationPlugin(options?: CooperationPluginOptions): CanvasPlugin {
  return {
    name: 'plugin-cooperation',
    install(ctx: CanvasPluginContext) {
      console.log('[CooperationPlugin] 🚀 Plugin Installed Successfully! Options:', options);

      // Initialize state store
      initStore(ctx, options);

      // Inject the floating cooperation window
      ctx.api.editor.registerOverlay({ component: CooperationPanel });

      // Handle auto-connect from URL hash
      setTimeout(() => {
        try {
          const hash = window.location.hash;
          if (hash.includes('?')) {
            const urlParams = new URLSearchParams(hash.split('?')[1]);
            const sessionId = urlParams.get('session');
            const sessionKey = urlParams.get('key');
            const role = urlParams.get('role') as 'edit' | 'view';

            if (sessionId && sessionKey && (role === 'edit' || role === 'view')) {
              console.log('[CooperationPlugin] Auto connecting to session:', sessionId, 'as', role);
              if (ablySync) {
                ablySync.connect(sessionId, sessionKey, role);
              }
            }
          }
        } catch (e) {
          console.error('[CooperationPlugin] Failed to parse URL hash for auto-connect', e);
        }
      }, 500); // slight delay to ensure canvas is ready
    },
    destroy() {
      if (ablySync) {
        ablySync.disconnect();
      }
      console.log('[CooperationPlugin] 🛑 Plugin Destroyed and cleaned up.');
    },
  };
}

export const CooperationPlugin: CanvasPlugin = createCooperationPlugin({ useP2P: true });
