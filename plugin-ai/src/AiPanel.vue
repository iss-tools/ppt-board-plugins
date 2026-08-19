<template>
  <n-config-provider
    class="plugin-ai-overlay"
    :theme="isDarkTheme ? darkTheme : null"
    :class="{ dark: isDarkTheme }"
    :locale="currentLocale"
    :date-locale="currentDateLocale"
  >
    <!-- Floating AI Button -->
    <button
      v-if="!isOpen"
      class="ai-floating-btn"
      @click="isOpen = true"
      @mousedown.stop
      @touchstart.stop
      :title="t('panel.chat')"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        />
      </svg>
    </button>

    <!-- Main AI Window -->
    <div v-else class="panel-container" @mousedown.stop @touchstart.stop>
      <div class="panel-header">
        <div class="header-left">
          <span class="title">✨</span>
          <div class="icon-nav">
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'chat' }"
              @click="activeTab = 'chat'"
              :title="t('panel.chat')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button
              class="nav-btn"
              :class="{ active: activeTab === 'provider' }"
              @click="activeTab = 'provider'"
              :title="t('panel.provider')"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <n-button text style="font-size: 20px" @click="isOpen = false"> ✕ </n-button>
      </div>

      <div class="panel-content">
        <ChatTab v-show="activeTab === 'chat'" />
        <ProviderTab v-show="activeTab === 'provider'" />
      </div>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import { NConfigProvider, NButton, darkTheme, zhCN, dateZhCN, enUS, dateEnUS } from 'naive-ui';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from './composables/useI18n';
import ChatTab from './components/ChatTab.vue';
import ProviderTab from './components/ProviderTab.vue';

const ctx = useCanvasContext();
const { t } = useI18n();
const state = ctx.state;

const isDarkTheme = computed(() => state.editor?.theme === 'dark');

watchEffect(() => {
  if (isDarkTheme.value) {
    document.body.classList.add('plugin-ai-dark');
  } else {
    document.body.classList.remove('plugin-ai-dark');
  }
});
const currentLocale = computed(() => (state.editor?.language === 'zh' ? zhCN : enUS));
const currentDateLocale = computed(() => (state.editor?.language === 'zh' ? dateZhCN : dateEnUS));
const isOpen = ref(false);
const activeTab = ref('chat');
</script>

<style scoped>
.plugin-ai-overlay {
  --ai-bg: var(--canvas-panel-bg);
  --ai-panel-bg: var(--canvas-bg-color);
  --ai-border: var(--canvas-border-color);
  --ai-text: var(--canvas-text-color);
  --ai-text-muted: var(--canvas-text-muted);
  --ai-hover: var(--canvas-btn-hover-bg);
  --ai-input-bg: transparent;
  --ai-message-bg: var(--canvas-btn-bg);
  --ai-code-bg: var(--board-bg-color);
  --ai-primary: var(--canvas-accent-color);
  --ai-primary-hover: var(--canvas-active-color);
  --ai-danger: #ef4444;
  --ai-danger-bg: #fee2e2;
}

.plugin-ai-overlay.dark {
  --ai-danger-bg: #451a1a;
}
</style>

<style scoped>
.plugin-ai-overlay {
  position: absolute;
  right: 112px;
  top: 32px;
  z-index: 99;
  pointer-events: auto;
}

.ai-floating-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--ai-bg);
  border: 1px solid var(--ai-border);
  color: var(--ai-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  padding: 0;
  outline: none;
}

:global(body.plugin-ai-dark) .ai-floating-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.ai-floating-btn:hover {
  background: var(--ai-hover);
}

.panel-container {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 350px;
  height: calc(100vh - 96px);
  background: var(--canvas-panel-bg, #ffffff);
  color: var(--ai-text);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
}

.panel-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--ai-border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 18px;
}

.icon-nav {
  display: flex;
  gap: 8px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--ai-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: var(--ai-hover);
  color: var(--ai-text);
}

.nav-btn.active {
  background: transparent;
  color: var(--ai-primary);
  box-shadow: none;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.plugin-ai-overlay.dark .icon-nav {
  background: transparent;
}

.plugin-ai-overlay.dark .nav-btn.active {
  color: #818cf8;
}
</style>
