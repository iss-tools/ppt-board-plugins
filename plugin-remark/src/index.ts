import type { CanvasPlugin, CanvasPluginContext } from '@iss-ai/ppt-board';
import RemarkOverlay from './components/RemarkOverlay.vue';
import { useRemarkUser } from './composables/useRemarkUser';
import { useRemarkStore } from './store/useRemarkStore';

export const RemarkPlugin: CanvasPlugin = {
  name: 'vue-canvas-plugin-remark',

  install(ctx: CanvasPluginContext) {
    console.log('[RemarkPlugin] 🚀 Plugin Installed Successfully!');

    // Initialize random user identity
    const { initUser } = useRemarkUser();
    const currentUser = initUser();
    console.log('[RemarkPlugin] Current User:', currentUser);

    const remarkStore = useRemarkStore(ctx);

    // ==========================================
    // 1. INJECT UI COMPONENTS
    // ==========================================
    ctx.api.editor.registerOverlay({ component: RemarkOverlay });

    // ==========================================
    // 2. CONTEXT MENU ACTIONS (Add Remark)
    // ==========================================
    ctx.api.editor.registerContextMenuItem({
      id: 'plugin-ctx-add-remark',
      label: 'Add Remark / 添加批注',
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
      label: 'Toggle Remarks',
      tooltip: 'Show/Hide Remarks on Canvas',
      position: 'right',
      onClick: () => {
        remarkStore.toggleShowRemarks();
      },
    });
  },

  destroy() {
    console.log('[RemarkPlugin] 🛑 Plugin Destroyed and cleaned up.');
  },
};

