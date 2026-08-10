<template>
  <Transition name="fade">
    <div v-if="modelValue" class="help-modal-backdrop" @click="closeHelp">
      <div class="help-modal" @click.stop :class="{ dark: isDarkTheme }">
        <div class="help-header">
          <h3>{{ t('help.title') }}</h3>
          <button class="close-btn" @click="closeHelp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="help-content custom-scroll">
          <div class="shortcut-group">
            <h4>{{ t('help.groups.tools') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.select') }}</span>
              <span class="keys"><kbd>1</kbd> {{ t('help.or') }} <kbd>V</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.rect') }}</span>
              <span class="keys"><kbd>2</kbd> {{ t('help.or') }} <kbd>R</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.diamond') }}</span>
              <span class="keys"><kbd>3</kbd> {{ t('help.or') }} <kbd>D</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.ellipse') }}</span>
              <span class="keys"><kbd>4</kbd> {{ t('help.or') }} <kbd>E</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.arrow') }}</span>
              <span class="keys"><kbd>5</kbd> {{ t('help.or') }} <kbd>A</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.line') }}</span>
              <span class="keys"><kbd>6</kbd> {{ t('help.or') }} <kbd>L</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.draw') }}</span>
              <span class="keys"><kbd>7</kbd> {{ t('help.or') }} <kbd>P</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.text') }}</span>
              <span class="keys"><kbd>8</kbd> {{ t('help.or') }} <kbd>T</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.image') }}</span>
              <span class="keys"><kbd>9</kbd> {{ t('help.or') }} <kbd>I</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.eraser') }}</span>
              <span class="keys"><kbd>0</kbd> {{ t('help.or') }} <kbd>X</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.laser') }}</span>
              <span class="keys"><kbd>K</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.hand') }}</span>
              <span class="keys"><kbd>H</kbd></span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>{{ t('help.groups.view') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.pan') }}</span>
              <span class="keys" v-html="t('help.items.panKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.zoom') }}</span>
              <span class="keys" v-html="t('help.items.zoomKey')"></span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>{{ t('help.groups.selection') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.marquee') }}</span>
              <span class="keys" v-html="t('help.items.marqueeKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.multiSelect') }}</span>
              <span class="keys" v-html="t('help.items.multiSelectKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.group') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>G</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.ungroup') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd></span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>{{ t('help.groups.edit') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.copy') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>C</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.paste') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>V</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.undoAction') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>Z</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.redoAction') }}</span>
              <span class="keys" v-html="t('help.items.redoKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.delete') }}</span>
              <span class="keys" v-html="t('help.items.deleteKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.save') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>S</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.nudge') }}</span>
              <span class="keys"><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.rotateSnap') }}</span>
              <span class="keys" v-html="t('help.items.rotateSnapKey')"></span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>{{ t('help.groups.presentation') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.startPres') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>P</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.startPreview') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.stopPres') }}</span>
              <span class="keys" v-html="t('help.items.stopPresKey')"></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.prevNext') }}</span>
              <span class="keys"><kbd>←</kbd> / <kbd>→</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.pauseResume') }}</span>
              <span class="keys" v-html="t('help.items.pauseResumeKey')"></span>
            </div>
          </div>

          <div class="shortcut-group">
            <h4>{{ t('help.groups.env') }}</h4>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.theme') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>T</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.autoStep') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>A</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.ruler') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>R</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.grid', '网格 (Grid)') }}</span>
              <span class="keys"><kbd>Cmd/Ctrl</kbd> + <kbd>'</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.toolbar') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>B</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.panel') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>C</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.fullscreen') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>F</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.bgm') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>M</kbd></span>
            </div>
            <div class="shortcut-item">
              <span class="action">{{ t('help.items.mute') }}</span>
              <span class="keys"><kbd>Alt/Opt</kbd> + <kbd>S</kbd></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const ctx = useCanvasContext();
const { t } = useI18n();

const isDarkTheme = computed(() => {
  return ctx.state?.editor?.theme === 'dark';
});

const closeHelp = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.help-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--canvas-overlay-bg, rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(2px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-modal {
  width: 760px;
  max-width: 90vw;
  max-height: 85vh;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--canvas-overlay-bg, rgba(0, 0, 0, 0.15));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--canvas-border-color, #e9ecef);
}

.help-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--canvas-border-color, #e9ecef);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--canvas-text-color, #333);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--canvas-text-muted, #868e96);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
  color: var(--canvas-text-color, #333);
}

.help-content {
  padding: 20px 24px;
  overflow-y: auto;
  column-count: 2;
  column-gap: 40px;
}

.shortcut-group {
  margin-bottom: 24px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.shortcut-group:last-child {
  margin-bottom: 0;
}

.shortcut-group h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--canvas-text-muted, #868e96);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dashed var(--canvas-border-color, #e9ecef);
}

.shortcut-item:last-child {
  border-bottom: none;
}

.action {
  font-size: 14px;
  color: var(--canvas-text-color, #495057);
}

.keys {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 13px;
}

kbd {
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid var(--canvas-border-color, #dee2e6);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--canvas-text-color, #495057);
  box-shadow: 0 1px 1px var(--canvas-overlay-bg, rgba(0, 0, 0, 0.05));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: var(--canvas-border-color, rgba(0, 0, 0, 0.15));
  border-radius: 3px;
}
</style>
