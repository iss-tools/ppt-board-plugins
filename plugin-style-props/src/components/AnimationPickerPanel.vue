<template>
  <div class="animation-picker-flyout custom-scroll" :class="{ dark: isDarkTheme }" @mousedown.stop @touchstart.stop>
    <div class="flyout-header">
      <div class="flyout-title">{{ t('panel.select_animation_effect') }}</div>
      <button class="close-btn" @click="$emit('close')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    
    <div class="flyout-section">
      <div class="anim-grid no-anim">
        <div class="anim-box" 
             :class="{ active: modelValue === '' }"
             :title="t('panel.no_effect')"
             @click="updateAnim('')">
          <div class="anim-icon">{{ t('panel.no') }}</div>
        </div>
      </div>
    </div>

    <div v-for="(anims, category) in filteredAnimates" :key="category" class="flyout-section">
      <div class="flyout-section-title">{{ t('animations.categories.' + category.toLowerCase().replace(/[^a-z0-9]+/g, '_')) || category }}</div>
      <div class="anim-grid">
        <div v-for="anim in anims" :key="anim" 
             class="anim-box" 
             :class="{ active: modelValue === anim }"
             :title="t('animations.effects.' + anim.replace('animate__', '')) || anim.replace('animate__', '')"
             @click="updateAnim(anim)"
             @mouseenter="hoverAnim = anim"
             @mouseleave="hoverAnim = null"
             @animationend="onAnimationEnd(anim)">
          <div class="anim-icon" :class="[hoverAnim === anim ? `animate__animated ${anim}` : '']">
            <div class="anim-preview-box"></div>
          </div>
          <span class="anim-name">{{ t('animations.effects.' + anim.replace('animate__', '')) || anim.replace('animate__', '') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';
import { animates, animTranslations, categoryTranslations } from '../assets/animate';

const props = defineProps<{
  modelValue: string;
  type: 'in' | 'emphasis' | 'out'; // To optionally filter enter/exit/emphasis if needed
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const emit = defineEmits(['update:modelValue', 'close']);

const hoverAnim = ref<string | null>(null);

const onAnimationEnd = (anim: string) => {
  // Re-trigger animation by clearing and setting it again if hovered
  if (hoverAnim.value === anim) {
    hoverAnim.value = null;
    setTimeout(() => {
      hoverAnim.value = anim;
    }, 50);
  }
};

const updateAnim = (val: string) => {
  emit('update:modelValue', val);
  emit('close');
};

// We can filter the animates object based on the type ('in', 'emphasis', 'out')
// 'Entrance', 'Exit', 'Attention seekers'
const filteredAnimates = computed(() => {
  const result: Record<string, string[]> = {};
  for (const [category, list] of Object.entries(animates)) {
    const isExit = category.toLowerCase().includes('exit');
    const isEnter = category.toLowerCase().includes('entrance') || category.toLowerCase().includes('in');
    const isEmphasis = !isExit && !isEnter; // like 'Attention seekers'
    
    if (props.type === 'in' && isEnter) {
      result[category] = list;
    } else if (props.type === 'out' && isExit) {
      result[category] = list;
    } else if (props.type === 'emphasis' && isEmphasis) {
      result[category] = list;
    }
  }
  
  // If the filter removes everything (fallback), just return all
  if (Object.keys(result).length === 0) return animates;
  return result;
});
</script>

<style scoped>
.animation-picker-flyout {
  width: 280px;
  max-height: 360px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--canvas-border-color, #f1f3f5);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 200;
  cursor: default;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.flyout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flyout-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--canvas-text-color, #333);
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--canvas-text-muted, #868e96);
  padding: 4px;
  border-radius: 4px;
}
.close-btn:hover {
  background: var(--canvas-bg-hover, #f1f3f5);
  color: var(--canvas-text-color, #333);
}

.flyout-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flyout-section-title {
  font-size: 11px;
  color: var(--canvas-text-muted, #868e96);
}

.anim-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.anim-grid.no-anim {
  grid-template-columns: 1fr;
}

.anim-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--canvas-border-color, rgba(0,0,0,0.1));
  cursor: pointer;
  transition: all 0.2s;
  background: var(--canvas-btn-bg, #f8f9fa);
}

.anim-box:hover {
  border-color: var(--canvas-active-border, #b197fc);
  background: var(--canvas-active-bg, #f3f0ff);
}

.anim-box.active {
  background: var(--canvas-active-bg, #f3f0ff);
  border-color: var(--canvas-active-text, #6e56cf);
  box-shadow: 0 0 0 1px var(--canvas-active-text, #6e56cf);
}

.anim-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  color: #495057;
  font-size: 12px;
  /* Add duration for preview */
  --animate-duration: 0.8s;
}

.anim-preview-box {
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #b197fc, #748ffc);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(116, 143, 252, 0.4);
}

.anim-name {
  font-size: 10px;
  color: var(--canvas-text-muted, #868e96);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.anim-box:hover .anim-name {
  color: var(--canvas-active-text, #6e56cf);
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
  --canvas-active-bg: rgba(110, 86, 207, 0.2);
  --canvas-active-border: rgba(110, 86, 207, 0.5);
  --canvas-active-text: #b197fc;
}


</style>
