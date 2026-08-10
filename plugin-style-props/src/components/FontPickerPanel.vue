<template>
  <div class="font-picker-flyout" :class="{ dark: isDarkTheme }">
    <div class="flyout-title">{{ t('panel.copyright_free_fonts') }}</div>
    
    <div class="font-list custom-scroll">
      <div v-for="font in fonts" :key="font.fontFamily" 
           class="font-item" 
           :class="{ active: modelValue === font.fontFamily }"
           :style="{ fontFamily: font.fontFamily }"
           @click="selectFont(font.fontFamily)"
           :title="font.name">
        {{ font.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

import { fonts } from '../assets/font';

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue', 'close']);

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const selectFont = (fontFamily: string) => {
  emit('update:modelValue', fontFamily);
  emit('close');
};
</script>

<style scoped>
.font-picker-flyout {
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

.font-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

/* Custom Scrollbar for a cleaner look */
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

.font-item {
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  color: var(--canvas-text-color, #333);
  background: var(--font-item-bg, #f8f9fa);
  border: 1px solid transparent;
  text-align: center;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.font-item:hover {
  background: var(--font-item-hover-bg, #ffffff);
  border-color: var(--font-item-hover-border, #d0ebff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.font-item.active {
  background: var(--font-item-active-bg, #e7f5ff);
  border-color: var(--font-item-active-border, #339af0);
  color: var(--font-item-active-text, #1971c2);
  font-weight: 500;
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
  
  --font-item-bg: #3a3a3a;
  --font-item-hover-bg: #4a4a4a;
  --font-item-hover-border: #4263eb;
  --font-item-active-bg: rgba(51, 154, 240, 0.15);
  --font-item-active-border: #339af0;
  --font-item-active-text: #74c0fc;
}


</style>
