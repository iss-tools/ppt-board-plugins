<template>
  <n-config-provider
    v-if="isVisible"
    class="plugin-style-props-overlay"
    :theme="isDarkTheme ? darkTheme : null"
    :class="{ dark: isDarkTheme, 'is-mobile': isMobile }"
  >
    <!-- Desktop Layout -->
    <div v-if="!isMobile" class="panel-container" @mousedown.stop @touchstart.stop>
      <n-tabs type="segment" animated>
        <n-tab-pane name="style" :tab="t('main.style')">
          <StyleTab :elements="selectedElements" />
        </n-tab-pane>
        <n-tab-pane name="props" :tab="t('main.props')">
          <PropsTab :elements="selectedElements" />
        </n-tab-pane>
        <n-tab-pane name="animation" :tab="t('main.animation')">
          <AnimationTab :elements="selectedElements" />
        </n-tab-pane>
        <n-tab-pane name="timeline" :tab="t('main.timeline')">
          <TimelineTab :elements="allElements" />
        </n-tab-pane>
      </n-tabs>
    </div>

    <!-- Mobile Layout -->
    <template v-else>
      <div
        class="mobile-actions-bar"
        :class="{ dark: isDarkTheme }"
        @mousedown.stop
        @touchstart.stop
      >
        <n-button
          circle
          :type="activeMobileTab === 'style' ? 'primary' : 'default'"
          @click="toggleMobileTab('style')"
          class="action-toggle-btn"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
              <path
                d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
              />
            </svg>
          </template>
        </n-button>
        <!-- <n-button
          circle
          :type="activeMobileTab === 'props' ? 'primary' : 'default'"
          @click="toggleMobileTab('props')"
          class="action-toggle-btn"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </template>
        </n-button>
        <n-button
          circle
          :type="activeMobileTab === 'animation' ? 'primary' : 'default'"
          @click="toggleMobileTab('animation')"
          class="action-toggle-btn"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2L18 6L7 17L3 13L14 2Z"></path>
              <path d="M14 2L18 6"></path>
              <path d="M9 22L15 22"></path>
            </svg>
          </template>
        </n-button> -->
        <n-button
          circle
          :type="activeMobileTab === 'timeline' ? 'primary' : 'default'"
          @click="toggleMobileTab('timeline')"
          class="action-toggle-btn"
        >
          <template #icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </template>
        </n-button>
      </div>

      <div v-if="activeMobileTab" class="mobile-tab-panel" @mousedown.stop @touchstart.stop>
        <div class="mobile-tab-header">
          <span class="mobile-tab-title">{{ getTabTitle(activeMobileTab) }}</span>
          <n-button text style="font-size: 20px" @click="activeMobileTab = null">
            <template #icon>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </template>
          </n-button>
        </div>
        <div class="mobile-tab-content">
          <StyleTab v-if="activeMobileTab === 'style'" :elements="selectedElements" />
          <PropsTab v-else-if="activeMobileTab === 'props'" :elements="selectedElements" />
          <AnimationTab v-else-if="activeMobileTab === 'animation'" :elements="selectedElements" />
          <TimelineTab v-else-if="activeMobileTab === 'timeline'" :elements="allElements" />
        </div>
      </div>
    </template>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { NConfigProvider, NTabs, NTabPane, NButton, darkTheme } from 'naive-ui';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from './composables/useI18n';
import StyleTab from './components/StyleTab.vue';
import PropsTab from './components/PropsTab.vue';
import AnimationTab from './components/AnimationTab.vue';
import TimelineTab from './components/TimelineTab.vue';

const ctx = useCanvasContext();
const state = ctx.state;
const { t } = useI18n();

const isDarkTheme = computed(() => state.editor?.theme === 'dark');
const isMobile = computed(() => !!state.runtime.isMobile);
const activeMobileTab = ref<string | null>(null);

const selectedElements = computed(() => {
  if (!state.runtime.selectedIds || state.runtime.selectedIds.size === 0) return [];
  const selectedIds = Array.from(state.runtime.selectedIds);
  return state.runtime.activeElements.filter(el => selectedIds.includes(el.id));
});

const allElements = computed(() => {
  return state.runtime.activeElements || [];
});

const isVisible = computed(() => selectedElements.value.length > 0 && !state.runtime.isDragging);

const toggleMobileTab = (tab: string) => {
  if (activeMobileTab.value === tab) {
    activeMobileTab.value = null;
  } else {
    activeMobileTab.value = tab;
  }
};

const getTabTitle = (tab: string) => {
  switch (tab) {
    case 'style':
      return t('main.style');
    case 'props':
      return t('main.props');
    case 'animation':
      return t('main.animation');
    case 'timeline':
      return t('main.timeline');
    default:
      return '';
  }
};

// Reset active tab when selection changes to empty
watch(
  () => selectedElements.value.length,
  len => {
    if (len === 0) {
      activeMobileTab.value = null;
    }
  }
);
</script>

<style scoped lang="scss">
.plugin-style-props-overlay {
  position: absolute;
  left: 16px;
  top: 16px;
  width: 335px;
  max-height: calc(100vh - 96px);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 999;
  pointer-events: auto;
  overflow: hidden;
}

.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 12px;
}

/* Dark Theme Overrides */
.plugin-style-props-overlay.dark {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #e0e0e0;
}

/* Mobile layout overrides */
.plugin-style-props-overlay.is-mobile {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-height: none;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  pointer-events: none;
}

.action-toggle-btn {
  width: 40px;
  height: 40px;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-actions-bar.dark {
  background: #2c2c2c;
  border-color: #444;
  .action-toggle-btn {
    background-color: #2c2c2c;
  }
}
.mobile-actions-bar {
  position: fixed;
  bottom: 76px;
  left: 8px;
  display: flex;
  flex-direction: row;
  pointer-events: auto;
  padding: 2px;
  .action-toggle-btn {
    background-color: #fff;
    box-shadow: none;
    border: none !important;
  }
  :deep(.action-toggle-btn) {
    --n-border: none !important;
    --n-border-hover: none !important;
    --n-border-pressed: none !important;
    --n-border-focus: none !important;
  }
}

.plugin-style-props-overlay.dark .mobile-actions-bar {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
}

.mobile-tab-panel {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  width: 90vw;
  max-width: 360px;
  max-height: 60vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  overflow: hidden;
  z-index: 1000;
}

.plugin-style-props-overlay.dark .mobile-tab-panel {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid #444;
}

.mobile-tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.plugin-style-props-overlay.dark .mobile-tab-header {
  border-bottom-color: #444;
}

.mobile-tab-title {
  font-size: 14px;
  font-weight: 500;
}

.mobile-tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}
</style>
