<template>
  <div v-if="pluginState.pastePrompt.show" class="echarts-paste-overlay" :style="overlayStyle">
    <div class="prompt-card">
      <div class="header">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>Table Data Detected</span>
      </div>
      <div class="content">
        <p>You pasted {{ pluginState.pastePrompt.data.length }} rows of tabular data. How would you like to insert it?</p>
        <div class="actions">
          <button class="btn-chart" @click="handleChoice('chart')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
            Insert as Data Chart
          </button>
          <button class="btn-table" @click="handleChoice('table')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM21 9H3M21 15H3M9 3v18M15 3v18"/></svg>
            Insert as Data Table
          </button>
          <button class="btn-cancel" @click="handleChoice('cancel')">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { pluginState } from '../store';
import { useCanvasContext } from '@iss-ai/ppt-board';

const { state } = useCanvasContext();

const overlayStyle = computed(() => {
  // Try to position near the mouse, but bound to window
  if (!state) return {};
  
  // mouse coordinates are in canvas space, convert to screen space
  const scale = state.runtime?.scale || 1;
  const offsetX = state.runtime?.offsetX || 0;
  const offsetY = state.runtime?.offsetY || 0;

  const screenX = pluginState.pastePrompt.x * scale + offsetX;
  const screenY = pluginState.pastePrompt.y * scale + offsetY;

  return {
    left: `${screenX + 20}px`,
    top: `${screenY + 20}px`,
  };
});

const handleChoice = (choice: 'chart' | 'table' | 'cancel') => {
  if (pluginState.resolvePrompt) {
    pluginState.resolvePrompt(choice);
  }
};
</script>

<style scoped>
.echarts-paste-overlay {
  position: absolute;
  z-index: 9999;
  font-family: system-ui, -apple-system, sans-serif;
}

.prompt-card {
  width: 280px;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #e0e0e0);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  color: var(--canvas-text-color, #333);
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid var(--canvas-border-color, #e0e0e0);
  font-weight: 600;
  font-size: 14px;
}

.content {
  padding: 16px;
}

.content p {
  margin: 0 0 16px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--canvas-text-color-secondary, #666);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-chart {
  background: var(--canvas-active-color, #1a73e8);
  color: #fff;
}
.btn-chart:hover {
  background: var(--canvas-active-color-hover, #1557b0);
}

.btn-table {
  background: transparent;
  border: 1px solid var(--canvas-border-color, #dcdcdc) !important;
  color: var(--canvas-text-color, #333);
}
.btn-table:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn-cancel {
  background: transparent;
  color: var(--canvas-text-color-secondary, #666);
}
.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
