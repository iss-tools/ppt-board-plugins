<template>
  <div class="effect-picker-flyout" :class="{ dark: isDarkTheme }">
    <div class="flyout-title">{{ t('panel.gradient_effect') || '渐变预设 (Gradient Presets)' }}</div>
    <div class="effect-grid custom-scroll">
      <div 
        v-for="(preset, index) in presets" 
        :key="index"
        class="effect-item"
        @click="selectPreset(preset)"
        :title="`Preset ${index}`"
      >
        <div class="effect-preview" v-if="index === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <div class="effect-preview" v-else>
          <div class="preview-box" :style="preset"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const emit = defineEmits(['select']);

const selectPreset = (styles: Record<string, any>) => {
  emit('select', styles);
};

const presets = computed(() => {
  const list = [];
  // First item is always 'none'
  list.push({ backgroundImage: 'none' });
  
  const gradients = [
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)',
    'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
    'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
    'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
    'linear-gradient(135deg, #9795f0 0%, #fbc8d4 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(135deg, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
    'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
    'linear-gradient(135deg, #9795f0 0%, #fbc8d4 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
    'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
  ];

  for (let i = 0; i < gradients.length; i++) {
    list.push({ backgroundImage: gradients[i] });
  }

  return list;
});
</script>

<style scoped>
.effect-picker-flyout {
  width: 320px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: default;
  box-sizing: border-box;
}

.flyout-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--canvas-text-color, #333);
}

.effect-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
.custom-scroll:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

.effect-item {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  background: var(--canvas-bg-light, #f8f9fa);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.effect-item:hover {
  background: var(--canvas-panel-bg, #ffffff);
  border-color: #d0ebff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.effect-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-sizing: border-box;
}

.preview-box {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
}

/* Dark Theme Overrides */
.dark, :host-context(.dark) {
  --canvas-panel-bg: #2c2c2c;
  --canvas-bg-light: #1e1e1e;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  --canvas-border-color: #555;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-input-bg: #1e1e1e;
}
</style>
