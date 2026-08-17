import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import RemarkOverlay from './components/RemarkOverlay.vue';
import { useRemarkUser } from './composables/useRemarkUser';
import { useRemarkStore } from './store/useRemarkStore';
import { useI18n } from './composables/useI18n';

export const RemarkPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-remark',

  install(ctx: CanvasPluginContext) {
    console.log('[RemarkPlugin] 🚀 Plugin Installed Successfully!');

    // Initialize random user identity
    const { initUser } = useRemarkUser();
    const currentUser = initUser();
    console.log('[RemarkPlugin] Current User:', currentUser);

    const remarkStore = useRemarkStore(ctx);
    const { t } = useI18n(ctx);

    // ==========================================
    // 1. INJECT UI COMPONENTS
    // ==========================================
    ctx.api.editor.registerOverlay({ component: RemarkOverlay });

    // ==========================================
    // 2. CONTEXT MENU ACTIONS (Add Remark)
    // ==========================================
    ctx.api.editor.registerContextMenuItem({
      id: 'plugin-ctx-add-remark',
      get label() { return t('remark.addRemark'); },
      icon: '💬',
      show: menuCtx => menuCtx.selectedIds.length === 1,
      onClick: menuCtx => {
        const targetId = menuCtx.selectedIds[0];
        const element = ctx.state.runtime.activeElements.find(e => e.id === targetId);
        if (element) {
          remarkStore.addRemarkThread(targetId, element, {
            id: `comment_${Date.now()}`,
            userId: currentUser.userId,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            content: 'New remark...',
            timestamp: Date.now()
          });
        }
      },
    });

    // ==========================================
    // 3. TOOLBAR ACTIONS (Toggle Visibility)
    // ==========================================
    ctx.api.editor.registerToolbarItem({
      id: 'plugin-btn-toggle-remark',
      icon: '👁️',
      get label() { return t('remark.toggleRemarks'); },
      get tooltip() { return t('remark.toggleRemarks'); },
      position: 'right',
      onClick: () => {
        remarkStore.toggleShowRemarks();
      },
    });
    // ==========================================
    // 4. CONTEXT MENU & SHORTCUT (Toggle Remarks)
    // ==========================================
    ctx.api.editor.registerContextMenuItem({
      id: 'plugin-ctx-toggle-remark',
      get label() {
        return remarkStore.showRemarks.value
          ? t('remark.hide')
          : t('remark.show');
      },
      shortcut: 'Cmd+Shift+R',
      onClick: () => {
        remarkStore.toggleShowRemarks();
      },
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle remarks with Cmd/Ctrl + Shift + R
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        remarkStore.toggleShowRemarks();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Save handler to context so we can remove it on destroy
    (ctx as any)._remarkKeydownHandler = handleKeyDown;
  },

  destroy(ctx?: CanvasPluginContext) {
    if (ctx && (ctx as any)._remarkKeydownHandler) {
      window.removeEventListener('keydown', (ctx as any)._remarkKeydownHandler);
    }
    console.log('[RemarkPlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};

