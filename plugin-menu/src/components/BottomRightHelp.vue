<template>
  <div v-show="!canvasState?.runtime?.isMobile" class="bottom-right-help" :class="{ dark: isDarkTheme }">
    <button class="icon-btn" @click="toggleFullscreen" :title="t('settings.fullscreen')">
      <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
      </svg>
      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
      </svg>
    </button>
    <button class="icon-btn" @click="previewCurrent" :title="t('controls.previewCurrent')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    </button>
    <button class="icon-btn" @click="previewPPT" :title="t('controls.previewPPT')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h20"></path><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"></path><path d="m7 21 5-5 5 5"></path>
      </svg>
    </button>

    <button class="icon-btn help-btn" @click="openHelp" :title="t('controls.help')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    </button>
    <HelpModal v-model="isHelpOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, h } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { createDiscreteApi, darkTheme } from 'naive-ui';
import HelpModal from './HelpModal.vue';
import { useI18n } from '../composables/useI18n';

const ctx = useCanvasContext();
const { t } = useI18n();
const canvasState = ctx.state;

const isHelpOpen = ref(false);

const isDarkTheme = computed(() => {
  return ctx.state?.editor?.theme === 'dark';
});

const { dialog } = createDiscreteApi(['dialog'], {
  configProviderProps: computed(() => ({
    theme: isDarkTheme.value ? darkTheme : undefined
  }))
});

const openHelp = () => {
  isHelpOpen.value = true;
};

const previewCurrent = () => {
  if (ctx.api?.presentation?.start) {
    ctx.api.presentation.start({ autoPlay: true, presentationMode: 'ppt' });
  } else {
    ctx.api?.editor?.setParams?.({ mode: 'preview' });
  }
};

const previewPPT = () => {
  if (ctx.api?.presentation?.start) {
    ctx.api.presentation.start({ autoPlay: true, presentationMode: 'ppt', startSlide: 0 });
  } else {
    ctx.api?.editor?.setParams?.({ mode: 'preview' });
  }
};



const isFullscreen = ref(!!document.fullscreenElement);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        isFullscreen.value = true;
        ctx.api?.editor?.setParams?.({ fullScreen: true });
      }).catch(() => {});
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen();
      isFullscreen.value = true;
      ctx.api?.editor?.setParams?.({ fullScreen: true });
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
        ctx.api?.editor?.setParams?.({ fullScreen: false });
      }).catch(() => {});
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
      isFullscreen.value = false;
      ctx.api?.editor?.setParams?.({ fullScreen: false });
    }
  }
};

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement;
});
</script>

<style scoped>
.bottom-right-help {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 9;
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--canvas-text-color, #495057);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid var(--canvas-border-color, #e9ecef);
}

.icon-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.icon-btn:active {
  transform: translateY(0);
}

/* Dark Theme Overrides */
.dark .icon-btn {
  background: #232324;
  color: #e5e7eb;
  border-color: #3f3f46;
}

.dark .icon-btn:hover {
  background: #3f3f46;
}
</style>
