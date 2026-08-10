<template>
  <div class="settings-flyout" :class="{ dark: isDarkTheme }" @mousedown.stop @touchstart.stop>
    <div class="flyout-title">{{ t('settings.title') }}</div>

    <div class="flyout-section">
      <div class="flyout-section-title">{{ t('settings.resolution') }}</div>
      <div class="tile-grid ratio-grid">
        <div 
          v-for="opt in ratioOptions" 
          :key="opt.value"
          class="tile-btn small-btn"
          :class="{ active: currentRatio === opt.value }"
          @click="updateRatio(opt.value)"
        >
          {{ opt.label }}
        </div>
      </div>
    </div>

    <div class="flyout-section">
      <div class="flyout-section-title">{{ t('settings.screenRes') }}</div>
      <div class="tile-grid res-grid">
        <template v-for="opt in resolutionOptions" :key="opt.value">
          <n-popover v-if="opt.value === 'custom'" trigger="click" placement="bottom" :show-arrow="true">
            <template #trigger>
              <div 
                class="tile-btn small-btn"
                :class="{ active: currentResolution === 'custom' }"
              >
                <div class="res-label">{{ opt.shortLabel || opt.label }}</div>
              </div>
            </template>
            <div style="display: flex; gap: 8px; align-items: center; padding: 4px;">
              <n-input-number v-model:value="customWidth" size="small" style="width: 80px" :show-button="false" placeholder="宽" />
              <span>x</span>
              <n-input-number v-model:value="customHeight" size="small" style="width: 80px" :show-button="false" placeholder="高" />
              <n-button size="small" type="primary" @click="applyCustomResolution">确定</n-button>
            </div>
          </n-popover>

          <div 
            v-else
            class="tile-btn small-btn"
            :class="{ active: currentResolution === opt.value }"
            @click="updateResolution(opt.value)"
          >
            <div class="res-label">{{ opt.shortLabel || opt.label }}</div>
            <div v-if="opt.res" class="res-sub">{{ opt.res.width }}x{{ opt.res.height }}</div>
          </div>
        </template>
      </div>
    </div>

    <div class="flyout-section">
      <div class="flyout-section-title">{{ t('settings.zoom') }} ({{ Math.round(currentZoom * 100) }}%)</div>
      <div style="display: flex; gap: 12px; align-items: center;">
        <n-slider 
          style="flex: 1"
          :value="currentZoom" 
          :min="0.1" 
          :max="5" 
          :step="0.1" 
          :format-tooltip="formatZoom"
          @update:value="updateZoom"
        />
        <n-button size="tiny" tertiary @click="updateZoom(1)" title="重置为100%">
          <template #icon>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </template>
        </n-button>
      </div>
    </div>

    <div class="flyout-section">
      <div class="setting-item">
        <span class="setting-label">{{ t('settings.autoStep') }}</span>
        <n-switch :value="currentAutoStep" @update:value="updateAutoStep" size="small" />
      </div>
      <div class="setting-item">
        <span class="setting-label">{{ t('settings.roughToolbar') }}</span>
        <n-switch :value="currentRoughToolbar" @update:value="updateRoughToolbar" size="small" />
      </div>
      <div class="setting-item">
        <span class="setting-label">{{ t('settings.rulers') }}</span>
        <n-switch :value="currentRulers" @update:value="updateRulers" size="small" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';
import { NSlider, NSwitch, NSelect, NPopover, NInputNumber, NButton } from 'naive-ui';

const ctx = useCanvasContext();
const { t } = useI18n();

const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const ALL_RATIOS = ['16:9', '9:16', '4:3', '3:4', '1:1', '3:2', '2:3', '2:1', '1:2', '4:5', '5:4', 'auto'];

const ratioOptions = computed(() => ALL_RATIOS.map(r => {
  const key = `ratio${r.replace(':', '')}`;
  const localized = t(`settings.${key}`);
  return {
    label: (localized === `settings.${key}`) ? r : localized,
    value: r
  };
}));

const currentRatio = computed(() => ctx.state?.document?.config?.ratio || '16:9');
const updateRatio = (val: string) => {
  if (ctx.state?.document?.config) {
    ctx.state.document.config.ratio = val as any;
  }
};

// Resolution Logic
const COMMON_RESOLUTIONS = [
  { nameKey: 'resFHD', width: 1920, height: 1080, ratio: '16:9' },
  { nameKey: 'resHD', width: 1280, height: 720, ratio: '16:9' },
  { nameKey: 'resVertical', width: 1080, height: 1920, ratio: '9:16' },
  { nameKey: 'resClassic', width: 1024, height: 768, ratio: '4:3' },
  { nameKey: 'resSquare', width: 1080, height: 1080, ratio: '1:1' },
  { nameKey: 'resPortrait', width: 1080, height: 1350, ratio: '4:5' },
  { nameKey: 'resA4', width: 2480, height: 3508, ratio: '1:1.414' }
];

const currentResolution = computed(() => {
  const config = ctx.state?.document?.config;
  if (!config?.width || !config?.height) return 'custom';
  const match = COMMON_RESOLUTIONS.find(r => r.width === config.width && r.height === config.height);
  return match ? `${match.width}x${match.height}` : 'custom';
});

const screenWidth = ref(0);
const screenHeight = ref(0);

onMounted(() => {
  if (typeof window !== 'undefined') {
    screenWidth.value = window.screen.width;
    screenHeight.value = window.screen.height;
  }
});

const resolutionOptions = computed(() => {
  const opts = COMMON_RESOLUTIONS.map(r => ({
    label: `${t(`settings.${r.nameKey}`)}`,
    shortLabel: t(`settings.${r.nameKey}`),
    value: `${r.width}x${r.height}`,
    res: r
  }));
  
  if (screenWidth.value && screenHeight.value) {
    opts.push({
      label: t('settings.currentScreen'),
      shortLabel: t('settings.currentScreen'),
      value: `${screenWidth.value}x${screenHeight.value}`,
      res: { name: 'currentScreen', width: screenWidth.value, height: screenHeight.value, ratio: 'auto' } as any
    });
  }

  opts.push({ label: t('settings.custom'), shortLabel: t('settings.custom'), value: 'custom', res: null as any });
  return opts;
});

const customWidth = ref(1920);
const customHeight = ref(1080);

const applyCustomResolution = () => {
  if (customWidth.value && customHeight.value) {
    if (ctx.api?.editor && typeof (ctx.api.editor as any).setResolution === 'function') {
      (ctx.api.editor as any).setResolution(customWidth.value, customHeight.value);
    } else if (ctx.state?.document?.config) {
      ctx.state.document.config.width = customWidth.value;
      ctx.state.document.config.height = customHeight.value;
    }
  }
};

const updateResolution = (val: string) => {
  if (val === 'custom') return;
  const match = resolutionOptions.value.find(r => r.value === val)?.res;
  if (match) {
    if (ctx.api?.editor && typeof (ctx.api.editor as any).setResolution === 'function') {
      (ctx.api.editor as any).setResolution(match.width, match.height, match.ratio);
    } else if (ctx.state?.document?.config) {
      ctx.state.document.config.width = match.width;
      ctx.state.document.config.height = match.height;
      if (match.ratio) ctx.state.document.config.ratio = match.ratio as any;
    }
  }
};

// Zoom logic
const currentZoom = computed(() => (ctx.state?.runtime as any)?.scale || 1);
const updateZoom = (val: number) => {
  if (ctx.api?.editor && typeof (ctx.api.editor as any).setScale === 'function') {
    (ctx.api.editor as any).setScale(val);
  }
};
const formatZoom = (val: number) => `${Math.round(val * 100)}%`;

// Auto Step
const currentAutoStep = computed(() => !!ctx.state?.editor?.autoStep);
const updateAutoStep = (val: boolean) => {
  if (ctx.api?.editor?.setParams) {
    ctx.api.editor.setParams({ autoStep: val });
  }
};

// Rough Toolbar
const currentRoughToolbar = computed(() => !!ctx.state?.editor?.showRoughToolbar);
const updateRoughToolbar = (val: boolean) => {
  if (ctx.api?.editor?.setParams) {
    ctx.api.editor.setParams({ showRoughToolbar: val });
  }
};

// Rulers
const currentRulers = computed(() => !!ctx.state?.editor?.showRulers);
const updateRulers = (val: boolean) => {
  if (ctx.api?.editor?.setParams) {
    ctx.api.editor.setParams({ showRulers: val });
  }
};

</script>

<style scoped>
.settings-flyout {
  width: 260px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--canvas-border-color, #f1f3f5);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 200;
  cursor: default;
}

.flyout-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--canvas-text-color, #333);
  margin-bottom: -4px;
}

.flyout-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flyout-section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--canvas-text-muted, #868e96);
}

.segmented-control {
  display: flex;
  background: var(--canvas-btn-bg, #f1f3f5);
  border-radius: 8px;
  padding: 2px;
  width: 100%;
}

.segment-btn {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 12px;
  padding: 6px 0;
  border-radius: 6px;
  color: var(--canvas-text-muted, #868e96);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.segment-btn:hover {
  color: var(--canvas-text-color, #333);
}

.segment-btn.active {
  background: var(--canvas-panel-bg, #fff);
  color: var(--canvas-text-color, #333);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
}

.setting-label {
  font-size: 13px;
  color: var(--canvas-text-color, #495057);
}

/* Make slider matching the style */
:deep(.n-slider-rail) {
  background-color: var(--canvas-border-color, #e9ecef) !important;
}

.tile-grid {
  display: grid;
  gap: 6px;
}

.ratio-grid {
  grid-template-columns: repeat(4, 1fr);
}

.res-grid {
  grid-template-columns: repeat(3, 1fr);
}

.tile-btn {
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 6px;
  padding: 6px;
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  color: var(--canvas-text-muted, #6c757d);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 28px;
}

.small-btn {
  padding: 4px;
  min-height: 24px;
}

.tile-btn:hover {
  background: var(--canvas-btn-hover, #f1f3f5);
  border-color: #dee2e6;
  color: var(--canvas-text-color, #343a40);
}

.tile-btn.active {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  color: #4f46e5;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.1);
}

.res-label {
  font-size: 10px;
  line-height: 1.1;
}

.res-sub {
  font-size: 8.5px;
  opacity: 0.6;
  margin-top: 1px;
  font-weight: normal;
}

/* Dark Theme Overrides */
.dark.settings-flyout {
  background: #232324;
  border-color: #3f3f46;
}

.dark .flyout-title {
  color: #e5e7eb;
}

.dark .flyout-section-title {
  color: #9ca3af;
}

.dark .setting-label {
  color: #e5e7eb;
}

.dark .tile-btn {
  background: #2c2c32;
  border-color: #3f3f46;
  color: #a1a1aa;
}

.dark .tile-btn:hover {
  background: #3f3f46;
  border-color: #52525b;
  color: #e5e7eb;
}

.dark .tile-btn.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
  color: #818cf8;
}
</style>
