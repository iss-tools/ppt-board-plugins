<template>
  <div class="color-picker-flyout" :class="{ dark: isDarkTheme }" @mousedown.stop @touchstart.stop>
    <div class="flyout-title">{{ title || t('panel.common_colors') }}</div>
    
    <div class="flyout-section">
      <div class="flyout-section-title">{{ t('panel.color') }}</div>
      <div class="color-grid">
        <div v-for="c in baseColors" :key="c.key" 
             class="color-box" 
             :class="{ active: isBaseColorActive(c.color), transparent: c.color === 'transparent' }"
             :style="{ backgroundColor: c.color === 'transparent' ? '' : c.color }"
             :title="c.key"
             @click="selectBaseColor(c)">
          <span class="color-key">{{ c.key }}</span>
        </div>
      </div>
    </div>
    
    <div class="flyout-section" v-if="currentShades && currentShades.length > 0">
      <div class="flyout-section-title">{{ t('panel.shades') }}</div>
      <div class="shade-grid">
        <div v-for="(shade, i) in currentShades" :key="shade"
             class="shade-box"
             :class="{ active: modelValue === shade, transparent: shade === 'transparent' }"
             :style="{ backgroundColor: shade === 'transparent' ? '' : shade }"
             @click="updateColor(shade)">
          <span class="shade-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            {{ i + 1 }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="flyout-section">
      <div class="flyout-section-title">{{ t('panel.hex') }}</div>
      <n-color-picker 
        :show-alpha="true"
        :value="modelValue === 'transparent' ? '#00000000' : modelValue" 
        @update:value="onColorPickerChange"
        :modes="['hex']"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';
import { NColorPicker } from 'naive-ui';

const props = defineProps<{
  modelValue: string;
  title?: string;
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const emit = defineEmits(['update:modelValue', 'close']);

// Base palette mimicking Excalidraw's layout
const palettes = {
  transparent: ['transparent'],
  white: ['#ffffff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6'],
  gray: ['#f1f3f5', '#e9ecef', '#ced4da', '#868e96', '#343a40'],
  black: ['#343a40', '#212529', '#191919', '#000000', '#000000'],
  beige: ['#f8f0fc', '#f3d9fa', '#eebefa', '#e599f7', '#da77f2'],
  
  cyan: ['#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db'],
  blue: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7'],
  purple: ['#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa'],
  pink: ['#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f06595'],
  salmon: ['#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b'],
  
  green: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c'],
  teal: ['#e6fcf5', '#c3fae8', '#96f2d7', '#63e6be', '#38d9a9'],
  yellow: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b'],
  orange: ['#fff4e6', '#ffe8cc', '#ffd8a8', '#ffc078', '#ffa94d'],
  red: ['#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b'],
};

const baseColors = [
  { key: 'q', color: 'transparent', palette: palettes.transparent },
  { key: 'w', color: '#ffffff', palette: palettes.white },
  { key: 'e', color: '#e9ecef', palette: palettes.gray },
  { key: 'r', color: '#000000', palette: palettes.black },
  { key: 't', color: '#eebefa', palette: palettes.beige },
  
  { key: 'a', color: '#99e9f2', palette: palettes.cyan },
  { key: 's', color: '#a5d8ff', palette: palettes.blue },
  { key: 'd', color: '#d0bfff', palette: palettes.purple },
  { key: 'f', color: '#fcc2d7', palette: palettes.pink },
  { key: 'g', color: '#ffa8a8', palette: palettes.salmon },
  
  { key: 'z', color: '#b2f2bb', palette: palettes.green },
  { key: 'x', color: '#96f2d7', palette: palettes.teal },
  { key: 'c', color: '#ffec99', palette: palettes.yellow },
  { key: 'v', color: '#ffd8a8', palette: palettes.orange },
  { key: 'b', color: '#ff8787', palette: palettes.red },
];

const selectedPalette = ref<string[]>([]);

const updateColor = (c: string) => {
  emit('update:modelValue', c);
};

const selectBaseColor = (item: any) => {
  selectedPalette.value = item.palette;
  updateColor(item.color);
};

// Try to infer the current palette based on the modelValue
watch(() => props.modelValue, (val) => {
  const currentVal = val?.toLowerCase();
  for (const group of Object.values(palettes)) {
    if (group.some(c => c.toLowerCase() === currentVal)) {
      selectedPalette.value = group;
      return;
    }
  }
}, { immediate: true });

const currentShades = computed(() => {
  return selectedPalette.value.length > 1 ? selectedPalette.value : null;
});

const isBaseColorActive = (color: string) => {
  if (props.modelValue === color) return true;
  if (selectedPalette.value && selectedPalette.value.includes(color) && selectedPalette.value.includes(props.modelValue)) {
    return true;
  }
  return false;
};

const onColorPickerChange = (val: string) => {
  if (val === '#00000000' || val === 'rgba(0, 0, 0, 0)') {
    updateColor('transparent');
  } else {
    updateColor(val);
  }
};
</script>

<style scoped>
.color-picker-flyout {
  width: 240px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--canvas-border-color, #f1f3f5);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 200;
  cursor: default;
}

.flyout-title {
  font-size: 13px;
  font-weight: 500;
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

.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.shade-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.color-box, .shade-box {
  aspect-ratio: 1;
  border-radius: 8px;
  border: 1px solid var(--canvas-border-color, rgba(0,0,0,0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s, box-shadow 0.1s;
}

.shade-box {
  aspect-ratio: auto;
  height: 32px;
  border-radius: 6px;
}

.color-box:hover, .shade-box:hover {
  transform: scale(1.1);
  z-index: 10;
}

.color-box.active, .shade-box.active {
  box-shadow: 0 0 0 2px var(--canvas-panel-bg, #fff), 0 0 0 4px var(--canvas-active-color, #748ffc);
  z-index: 5;
}

.color-key {
  font-size: 12px;
  font-weight: 500;
  color: rgba(0,0,0,0.5);
  position: absolute;
  bottom: 2px;
  right: 4px;
}

.shade-icon {
  font-size: 11px;
  color: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  gap: 2px;
}

.transparent {
  background: linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc),
    linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
  background-color: white;
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
