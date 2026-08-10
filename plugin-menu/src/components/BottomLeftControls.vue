<template>
  <div class="bottom-left-controls" :class="{ dark: isDarkTheme }">
    <!-- Zoom Controls -->
    <div class="control-group">
      <button class="icon-btn" @click="zoomOut" :title="t('controls.zoomOut')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <span class="zoom-percentage" @click="resetZoom" :title="t('controls.resetZoom')">
        {{ Math.round((canvasState?.runtime?.scale || 1) * 100) }}%
      </span>
      <button class="icon-btn" @click="zoomIn" :title="t('controls.zoomIn')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <!-- Undo / Redo -->
    <div class="control-group">
      <button class="icon-btn" @click="undo" :title="t('controls.undo')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
        </svg>
      </button>
      <button class="icon-btn" @click="redo" :title="t('controls.redo')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
        </svg>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

const ctx = useCanvasContext();
const { t } = useI18n();
const canvasState = ctx.state;
const pluginApi = ctx.api;

const isDarkTheme = computed(() => {
  return canvasState?.editor?.theme === 'dark';
});

const zoomIn = () => {
  if (pluginApi && pluginApi.editor && pluginApi.editor.setScale && canvasState && canvasState.runtime) {
    const newScale = Math.min(3, canvasState.runtime.scale + 0.1);
    pluginApi.editor.setScale(newScale);
  }
};

const zoomOut = () => {
  if (pluginApi && pluginApi.editor && pluginApi.editor.setScale && canvasState && canvasState.runtime) {
    const newScale = Math.max(0.1, canvasState.runtime.scale - 0.1);
    pluginApi.editor.setScale(newScale);
  }
};

const resetZoom = () => {
  if (pluginApi && pluginApi.editor && pluginApi.editor.setScale) {
    pluginApi.editor.setScale(1);
  }
  if (canvasState && canvasState.runtime) {
    canvasState.runtime.offsetX = 0;
    canvasState.runtime.offsetY = 0;
  }
};

const undo = () => {
  if (ctx.history && ctx.history.undo) {
    ctx.history.undo();
  }
};

const redo = () => {
  if (ctx.history && ctx.history.redo) {
    ctx.history.redo();
  }
};
</script>

<style scoped>
.bottom-left-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 12px;
}

.control-group {
  display: flex;
  align-items: center;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--canvas-text-color, #495057);
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
  color: var(--canvas-active-color, #339af0);
}

.zoom-percentage {
  font-size: 13px;
  font-weight: 500;
  color: var(--canvas-text-color, #333);
  min-width: 48px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.zoom-percentage:hover {
  color: var(--canvas-active-color, #339af0);
}

/* Dark Theme Overrides */
.dark .control-group {
  background: #232324;
  border-color: #3f3f46;
}

.dark .icon-btn {
  color: #e5e7eb;
}

.dark .icon-btn:hover {
  background: #3f3f46;
  color: #60a5fa;
}

.dark .zoom-percentage {
  color: #e5e7eb;
}

.dark .zoom-percentage:hover {
  color: #60a5fa;
}
</style>
