<template>
  <div class="audio-picker-flyout custom-scroll" :class="{ dark: isDarkTheme }" @mousedown.stop @touchstart.stop>
    <div class="flyout-header">
      <div class="flyout-title">{{ t('panel.select_audio') }}</div>
      <button class="close-btn" @click="$emit('close')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    
    <div class="audio-list">
      <div class="audio-item" :class="{ active: modelValue === '' }" @click="updateAudio('')">
        <span class="audio-name">{{ t('panel.none_none') }}</span>
      </div>
      
      <div class="audio-item" v-for="audio in audios" :key="audio.file" 
           :class="{ active: modelValue === audio.file }"
           @click="updateAudio(audio.file)">
        <span class="audio-name">{{ audio.name }}</span>
        <button class="play-btn" @click.stop="$emit('toggle-play', audio.file)" :class="{ playing: playingAudio === audio.file }">
          <svg v-if="playingAudio !== audio.file" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';import { useCanvasContext } from '@iss-ai/ppt-board';
import { useI18n } from '../composables/useI18n';

defineProps<{
  modelValue: string;
  audios: Array<{ name: string, file: string }>;
  playingAudio: string | null;
}>();

const emit = defineEmits(['update:modelValue', 'toggle-play', 'close']);

const ctx = useCanvasContext();
const { t } = useI18n();
const isDarkTheme = computed(() => ctx.state?.editor?.theme === 'dark');

const updateAudio = (val: string) => {
  emit('update:modelValue', val);
  emit('close');
};
</script>

<style scoped>
.audio-picker-flyout {
  width: 240px;
  max-height: 300px;
  background: var(--canvas-panel-bg, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--canvas-border-color, #f1f3f5);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.audio-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.audio-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid transparent;
}

.audio-item:hover {
  background: var(--canvas-btn-hover-bg, #f1f3f5);
}

.audio-item.active {
  background: var(--canvas-active-bg, #f3f0ff);
  border-color: var(--canvas-active-border, #d0bfff);
}

.audio-name {
  font-size: 12px;
  color: var(--canvas-text-color, #343a40);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.audio-item.active .audio-name {
  color: var(--canvas-active-text, #6e56cf);
  font-weight: 500;
}

.play-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: #adb5bd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 8px;
}

.play-btn:hover {
  color: var(--canvas-active-text, #6e56cf);
  background: var(--canvas-btn-hover-bg, #e9ecef);
}

.audio-item.active .play-btn {
  color: var(--canvas-active-text, #6e56cf);
}

.play-btn.playing {
  color: #ffffff;
  background: var(--canvas-active-text, #6e56cf);
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
