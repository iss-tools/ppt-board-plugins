<template>
  <n-config-provider
    v-if="isVisible"
    class="plugin-style-props-overlay"
    :theme="isDarkTheme ? darkTheme : null"
    :class="{ dark: isDarkTheme }"
  >
    <div class="panel-container" @mousedown.stop @touchstart.stop>
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
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NConfigProvider, NTabs, NTabPane, darkTheme } from 'naive-ui';
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

const selectedElements = computed(() => {
  if (!state.runtime.selectedIds || state.runtime.selectedIds.size === 0) return [];
  const selectedIds = Array.from(state.runtime.selectedIds);
  return state.runtime.activeElements.filter(el => selectedIds.includes(el.id));
});

const allElements = computed(() => {
  return state.runtime.activeElements || [];
});

const isVisible = computed(() => selectedElements.value.length > 0 && !state.runtime.isDragging);
</script>

<style scoped>
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
</style>
