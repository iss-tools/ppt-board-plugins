<template>
  <div class="effect-picker-flyout" :class="{ dark: isDarkTheme }">
    <div class="flyout-title">{{ type === 'shadow' ? t('panel.box_shadow') || '盒子阴影 (Box Shadow)' : t('panel.border_effect') || '边框特效 (Border)' }}</div>
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

const props = defineProps<{
  type: 'shadow' | 'border';
}>();

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
  if (props.type === 'shadow') {
    list.push({ boxShadow: '' });
    for (let i = 1; i <= 50; i++) {
      const offsetX = Math.floor(Math.random() * 20) - 10;
      const offsetY = Math.floor(Math.random() * 20) - 10;
      const blur = Math.floor(Math.random() * 30);
      const spread = Math.floor(Math.random() * 10) - 2;
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      const a = (Math.random() * 0.5 + 0.1).toFixed(2);
      
      const shadow = `${offsetX}px ${offsetY}px ${blur}px ${spread}px rgba(${r},${g},${b},${a})`;
      
      // Sometimes add multiple shadows
      if (Math.random() > 0.7) {
        const shadow2 = `inset 0px 0px 10px rgba(255,255,255,0.5)`;
        list.push({ boxShadow: `${shadow}, ${shadow2}` });
      } else {
        list.push({ boxShadow: shadow });
      }
    }
  } else {
    list.push({ border: '' });
    const styles = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'];
    for (let i = 1; i <= 50; i++) {
      const width = Math.floor(Math.random() * 10) + 1;
      const style = styles[Math.floor(Math.random() * styles.length)];
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      
      list.push({ border: `${width}px ${style} rgb(${r},${g},${b})` });
    }
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
  background-color: #e9ecef;
  border-radius: 4px;
}

/* Dark Theme Overrides */
.dark, :host-context(.dark) {
  --canvas-panel-bg: #2c2c2c;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  --canvas-border-color: #555;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-input-bg: #1e1e1e;
}


</style>
