<template>
  <div class="text-effect-picker-panel" :class="{ dark: isDarkTheme }">
    <div class="panel-header">
      <div class="title">{{ title }}</div>
    </div>
    
    <div class="effect-grid custom-scroll">
      <div
        v-for="(preset, index) in presets"
        :key="index"
        class="effect-item"
        @click="selectEffect(preset)"
      >
        <div class="effect-preview" v-if="index === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <div class="effect-preview" v-else>
          <span :style="preset">Aa</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';
import { TEXT_EFFECT_PRESETS } from '../utils/textEffectPresets';

const props = defineProps<{
  type: string; // 'transform' | 'stroke' | 'shadow' | 'texture' | 'gradient' | 'glow' | '3d'
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const emit = defineEmits<{
  (e: 'select', styles: Record<string, string>): void;
}>();

const titleMap = computed<Record<string, string>>(() => ({
  transform: t('panel.transform') || '变形特效',
  stroke: t('panel.stroke_effect') || '描边特效',
  shadow: t('panel.drop_shadow') || '投影特效',
  texture: t('panel.texture') || '纹理特效',
  gradient: t('panel.gradient') || '渐变特效',
  glow: t('panel.glow') || '发光特效',
  '3d': t('panel.3d') || '3D特效'
}));

const title = computed(() => titleMap.value[props.type] || t('panel.text_effect') || '文字特效');

const presets = computed(() => {
  return (TEXT_EFFECT_PRESETS as Record<string, any[]>)[props.type] || [];
});

const selectEffect = (preset: Record<string, string>) => {
  emit('select', preset);
};
</script>

<style scoped>
.text-effect-picker-panel {
  width: 280px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #eef0f4;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.effect-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.effect-item {
  height: 60px;
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.effect-item:hover {
  border-color: #18a058;
  background: var(--canvas-panel-bg, #ffffff);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transform: translateY(-1px);
}

.effect-preview {
  font-size: 28px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 4px;
}

/* 针对浅色文本特效的背景 */
.text-effect-picker-panel[data-type="glow"] .effect-item,
.text-effect-picker-panel[data-type="shadow"] .effect-item {
  background: #2c2c2c;
  border-color: #444;
}

/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
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
