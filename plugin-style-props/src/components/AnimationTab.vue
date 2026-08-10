<template>
  <div class="animate-panel custom-scroll">
    <div class="panel-body">

      <!-- BGM -->
      <div class="collapse-item">
        <div class="collapse-header" @click="toggleSection('bgm')">
          <span class="title">{{ t('tabs.canvas_global_bgm') }}</span>
          <svg class="arrow" :class="{ open: activeSections.includes('bgm') }" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="activeSections.includes('bgm')" class="collapse-content space-y">
          <div class="input-row">
            <span class="input-label w-full">{{ t('tabs.select_music') }}</span>
            <div class="audio-select-group">
              <button class="anim-picker-btn" @click="toggleAudioPicker('bgm', null, $event)">
                {{ getAudioName(globalBgm, audios.bgm) }}
              </button>
              <button class="play-btn" @click="togglePlay(globalBgm)" :class="{ playing: isPlaying(globalBgm) }"
                :disabled="!globalBgm" :title="t('tabs.listen')">
                <svg v-if="!isPlaying(globalBgm)" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              </button>
            </div>
          </div>
          <div class="input-row">
            <span class="input-label w-full">{{ t('tabs.custom_url') }}</span>
            <div class="input-box" style="flex: 1;">
              <input type="text" v-model="globalBgm" @change="updateBgm(globalBgm)" :placeholder="t('tabs.input_music_url')" />
            </div>
          </div>
        </div>
      </div>

      <!-- 生命周期控制 -->
      <div class="collapse-item">
        <div class="collapse-header" @click="toggleSection('lifecycle')">
          <span class="title">{{ t('tabs.lifecycle_lifecycle') }}</span>
          <svg class="arrow" :class="{ open: activeSections.includes('lifecycle') }" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="activeSections.includes('lifecycle')" class="collapse-content space-y">
          <div class="prop-grid">
            <div class="input-box">
              <span class="input-label-sm">{{ t('tabs.enter_step') }}</span>
              <input type="number" min="0" v-model.number="lifecycleProps.enterStep"
                @change="updateLifecycle('enterStep', lifecycleProps.enterStep)" />
            </div>
            <div class="input-box">
              <span class="input-label-sm">{{ t('tabs.exit_step') }}</span>
              <input type="number" min="0" v-model.number="lifecycleProps.exitStep"
                @change="updateLifecycle('exitStep', lifecycleProps.exitStep)" />
            </div>
          </div>
          <div class="input-row" style="margin-top: 8px">
            <span class="input-label w-full">{{ t('tabs.auto_next_delay') }}</span>
            <div class="input-box" style="flex: 1;">
              <input type="number" step="0.1" min="0" v-model.number="lifecycleProps.delay"
                @change="updateLifecycle('delay', lifecycleProps.delay)" />
              <span class="unit">s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 动画序列 -->
      <div class="collapse-item">
        <div class="collapse-header" @click="toggleSection('animations')">
          <span class="title">{{ t('tabs.animation_sequence_animations') }}</span>
          <svg class="arrow" :class="{ open: activeSections.includes('animations') }" width="16" height="16"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div v-show="activeSections.includes('animations')" class="collapse-content space-y">

          <div v-for="(anim, index) in animationsList" :key="anim.id" class="anim-card">
            <div class="anim-card-header">
              <div class="anim-card-title">{{ t('tabs.animation') }} {{ index + 1 }}</div>
              <button class="remove-btn" @click="removeAnimation(index)" :title="t('tabs.delete_this_animation')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                  </path>
                </svg>
              </button>
            </div>

            <div class="space-y" style="margin-top: 12px">
              <div class="prop-grid">
                <div class="input-row" style="gap: 4px;">
                  <span class="input-label-sm">{{ t('tabs.trigger_step') }}</span>
                  <div class="input-box" style="flex: 1;">
                    <input type="number" min="0" v-model.number="anim.step" @change="updateAnimations" />
                  </div>
                </div>
                <div class="input-row" style="gap: 4px;">
                  <span class="input-label-sm">{{ t('tabs.action_type') }}</span>
                  <select class="custom-select" v-model="anim.type" @change="updateAnimations">
                    <option value="in">{{ t('tabs.enter_in') }}</option>
                    <option value="emphasis">{{ t('tabs.emphasize_emphasis') }}</option>
                    <option value="out">{{ t('tabs.exit_out') }}</option>
                  </select>
                </div>
              </div>

              <div class="input-row">
                <span class="input-label">{{ t('tabs.animation_effect') }}</span>
                <button class="anim-picker-btn" @click="toggleAnimPicker(index, $event)">
                  {{ (anim.animate && anim.animate !== '') ? (t('animations.effects.' + anim.animate.replace('animate__', '')) || anim.animate.replace('animate__', '')) : t('tabs.none_none') }}
                </button>
              </div>

              <div class="prop-grid">
                <div class="input-box">
                  <span class="input-label-sm">{{ t('tabs.duration') }}</span>
                  <input type="number" step="0.1" min="0" v-model.number="anim.duration" @change="updateAnimations" />
                  <span class="unit">s</span>
                </div>
                <div class="input-box">
                  <span class="input-label-sm">{{ t('tabs.delay_delay') }}</span>
                  <input type="number" step="0.1" min="0" v-model.number="anim.delay" @change="updateAnimations" />
                  <span class="unit">s</span>
                </div>
              </div>

              <div class="input-row">
                <span class="input-label">{{ t('tabs.bind_audio') }}</span>
                <div class="audio-select-group">
                  <button class="anim-picker-btn" @click="toggleAudioPicker('anim', index, $event)">
                    {{ getAudioName(getAnimAudioStr(anim.audio), audios.element) }}
                  </button>
                  <button class="play-btn" @click="togglePlay(getAnimAudioStr(anim.audio))"
                    :class="{ playing: isPlaying(getAnimAudioStr(anim.audio)) }"
                    :disabled="!getAnimAudioStr(anim.audio)" :title="t('tabs.listen')">
                    <svg v-if="!isPlaying(getAnimAudioStr(anim.audio))" width="14" height="14" viewBox="0 0 24 24"
                      fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="input-row">
                <span class="input-label">{{ t('tabs.custom_audio') }}</span>
                <div class="input-box" style="flex: 1;">
                  <input type="text" :value="getAnimAudioStr(anim.audio)"
                    @change="e => setAnimAudioStr(anim, (e.target as HTMLInputElement).value)" :placeholder="t('tabs.input_audio_url')" />
                </div>
              </div>
            </div>
          </div>

          <div class="add-anim-actions">
            <button class="add-anim-btn" @click="addAnimation">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>{{ t('tabs.add_animation_effect') }}</button>
            <button class="add-anim-btn random-btn" @click="addRandomAnimations">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3h5v5"></path>
                <path d="M4 20L21 3"></path>
                <path d="M21 16v5h-5"></path>
                <path d="M15 15l6 6"></path>
                <path d="M4 4l5 5"></path>
              </svg>{{ t('tabs.random_enter_effect') }}</button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <n-popover :show="activeAnimPicker !== null" :x="animPickerPos.left" :y="animPickerPos.top" trigger="manual" :show-arrow="false" placement="bottom-start" style="padding: 0;">
    <AnimationPickerPanel v-if="activeAnimPicker !== null" :type="animationsList[activeAnimPicker]?.type || 'in'"
      :model-value="animationsList[activeAnimPicker]?.animate || ''" @update:model-value="onAnimPickerUpdate"
      @close="closeAnimPicker" />
  </n-popover>

  <n-popover :show="activeAudioPickerType !== null" :x="audioPickerPos.left" :y="audioPickerPos.top" trigger="manual" :show-arrow="false" placement="bottom-start" style="padding: 0;">
    <AudioPickerPanel v-if="activeAudioPickerType !== null"
      :audios="activeAudioPickerType === 'bgm' ? audios.bgm : audios.element" :model-value="getAudioPickerModelValue()"
      :playing-audio="currentAudioFile" @update:model-value="onAudioPickerUpdate" @toggle-play="togglePlay"
      @close="closeAudioPicker" />
  </n-popover>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { audios } from '../assets/audio';
import { animTranslations, animates } from '../assets/animate';
import { NPopover } from 'naive-ui';
import AnimationPickerPanel from './AnimationPickerPanel.vue';
import AudioPickerPanel from './AudioPickerPanel.vue';
import { useCanvasContext, CanvasEventNames } from '@iss-ai/ppt-board';

const props = defineProps<{
  elements: any[]
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const pluginApi = ctx.api;
const canvasState = ctx.state;

const activeSections = ref(['lifecycle', 'animations']);

const toggleSection = (sec: string) => {
  if (activeSections.value.includes(sec)) {
    activeSections.value = activeSections.value.filter(s => s !== sec);
  } else {
    activeSections.value.push(sec);
  }
};

const globalBgm = ref('');

// --- Lifecycle Config ---
const lifecycleProps = ref({
  enterStep: 0,
  exitStep: 1000,
  delay: 0
});

const updateLifecycle = (key: string, value: any) => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  props.elements.forEach(el => {
    pluginApi.elements.update(el.id, { [key]: value !== '' ? Number(value) : undefined });
  });
};

// --- Animations List Config ---
interface AnimationConfig {
  id: string;
  type?: 'in' | 'emphasis' | 'out';
  animate?: string;
  duration?: number;
  delay?: number;
  step?: number;
  audio?: any;
}
const animationsList = ref<AnimationConfig[]>([]);

const syncFromElements = () => {
  // Sync global BGM
  if (canvasState && canvasState.document && canvasState.document.config && canvasState.document.config.bgm !== undefined) {
    const bgm = canvasState.document.config.bgm;
    globalBgm.value = (typeof bgm === 'object' && bgm !== null ? ((bgm as any).file || '') : (bgm || '')) as string;
  }

  if (props.elements.length === 0) return;
  const first = props.elements[0];

  // Sync Lifecycle
  lifecycleProps.value.enterStep = first.enterStep ?? 0;
  lifecycleProps.value.exitStep = first.exitStep ?? 1000;
  lifecycleProps.value.delay = first.delay ?? 0;

  // Sync Animations
  if (first.animations && Array.isArray(first.animations)) {
    // deep clone to avoid modifying original ref before emitting update
    animationsList.value = JSON.parse(JSON.stringify(first.animations));
  } else {
    animationsList.value = [];
  }
};

watch(() => props.elements, syncFromElements, { deep: true, immediate: true });
watch(() => canvasState?.document?.config?.bgm, (bgm) => {
  if (canvasState) {
    globalBgm.value = (typeof bgm === 'object' && bgm !== null ? ((bgm as any).file || '') : (bgm || '')) as string;
  }
});

const updateBgm = (val: string) => {
  if (pluginApi && pluginApi.editor && pluginApi.editor.setParams) {
    pluginApi.editor.setParams({ bgm: val });
  } else if (canvasState && canvasState.document && canvasState.document.config) {
    canvasState.document.config.bgm = val;
  }
};

const updateAnimations = () => {
  if (!pluginApi || !pluginApi.elements || !pluginApi.elements.update) return;
  props.elements.forEach(el => {
    // We send a clone
    pluginApi.elements.update(el.id, { animations: JSON.parse(JSON.stringify(animationsList.value)) });
  });
};

const addAnimation = () => {
  animationsList.value.push({
    id: 'anim_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: 'in',
    animate: '',
    duration: 1.0,
    delay: 0,
    step: lifecycleProps.value.enterStep || 0,
    audio: ''
  });
  updateAnimations();
};

const DEFAULT_ENTRANCE_ANIMATIONS = [
  'animate__fadeIn',
  'animate__fadeInDown',
  'animate__fadeInLeft',
  'animate__fadeInRight',
  'animate__fadeInUp',
  'animate__bounceIn',
  'animate__bounceInDown',
  'animate__bounceInLeft',
  'animate__bounceInRight',
  'animate__bounceInUp',
  'animate__zoomIn',
  'animate__zoomInDown',
  'animate__zoomInLeft',
  'animate__zoomInRight',
  'animate__zoomInUp',
  'animate__slideInDown',
  'animate__slideInLeft',
  'animate__slideInRight',
  'animate__slideInUp',
  'animate__backInDown',
  'animate__backInLeft',
  'animate__backInRight',
  'animate__backInUp',
  'animate__lightSpeedInRight',
  'animate__lightSpeedInLeft',
  'animate__flipInX',
  'animate__flipInY',
  'animate__jackInTheBox',
  'animate__rollIn',
];

const addRandomAnimations = () => {
  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const inAnim = getRandom(DEFAULT_ENTRANCE_ANIMATIONS);

  const baseStep = lifecycleProps.value.enterStep || 0;

  animationsList.value.push({
    id: 'anim_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: 'in',
    animate: inAnim,
    duration: 1.0,
    delay: 0,
    step: baseStep,
    audio: ''
  });

  updateAnimations();
};

const removeAnimation = (index: number) => {
  animationsList.value.splice(index, 1);
  updateAnimations();
};

const getAnimAudioStr = (audio: any) => {
  if (!audio) return '';
  if (typeof audio === 'string') return audio;
  return audio.url || '';
};

const setAnimAudioStr = (anim: AnimationConfig, val: string) => {
  anim.audio = val;
  updateAnimations();
};

// --- Animation Picker Logic ---
const activeAnimPicker = ref<number | null>(null);
const animPickerPos = ref({ top: 0, left: 0 });

const toggleAnimPicker = (index: number, event: MouseEvent) => {
  if (activeAnimPicker.value === index) {
    activeAnimPicker.value = null;
    return;
  }
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  animPickerPos.value = {
    top: rect.bottom + 4,
    left: rect.left
  };
  activeAnimPicker.value = index;

  document.addEventListener('mousedown', closeAnimPickerOutside);
  document.addEventListener('touchstart', closeAnimPickerOutside);
};

const closeAnimPicker = () => {
  activeAnimPicker.value = null;
  document.removeEventListener('mousedown', closeAnimPickerOutside);
  document.removeEventListener('touchstart', closeAnimPickerOutside);
};

const closeAnimPickerOutside = (e: MouseEvent | TouchEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.anim-picker-btn') && !target.closest('.vue-canvas-popover')) {
    closeAnimPicker();
  }
};

const onAnimPickerUpdate = (val: string) => {
  if (activeAnimPicker.value !== null && animationsList.value[activeAnimPicker.value]) {
    animationsList.value[activeAnimPicker.value].animate = val;
    updateAnimations();
  }
};

// --- Audio Picker Logic ---
const activeAudioPickerType = ref<'bgm' | 'anim' | null>(null);
const activeAudioPickerIndex = ref<number | null>(null);
const audioPickerPos = ref({ top: 0, left: 0 });

const getAudioName = (file: string, audioList: any[]) => {
  if (!file) return t('tabs.none_none');
  const match = audioList.find(a => a.file === file);
  return match ? match.name : t('tabs.custom_custom');
};

const toggleAudioPicker = (type: 'bgm' | 'anim', index: number | null, event: MouseEvent) => {
  if (activeAudioPickerType.value === type && activeAudioPickerIndex.value === index) {
    activeAudioPickerType.value = null;
    activeAudioPickerIndex.value = null;
    return;
  }
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  audioPickerPos.value = {
    top: rect.bottom + 4,
    left: rect.left
  };
  activeAudioPickerType.value = type;
  activeAudioPickerIndex.value = index;

  document.addEventListener('mousedown', closeAudioPickerOutside);
  document.addEventListener('touchstart', closeAudioPickerOutside);
};

const closeAudioPicker = () => {
  activeAudioPickerType.value = null;
  activeAudioPickerIndex.value = null;
  document.removeEventListener('mousedown', closeAudioPickerOutside);
  document.removeEventListener('touchstart', closeAudioPickerOutside);
};

const closeAudioPickerOutside = (e: MouseEvent | TouchEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.anim-picker-btn') && !target.closest('.vue-canvas-popover')) {
    closeAudioPicker();
  }
};

const getAudioPickerModelValue = () => {
  if (activeAudioPickerType.value === 'bgm') return globalBgm.value;
  if (activeAudioPickerType.value === 'anim' && activeAudioPickerIndex.value !== null) {
    const anim = animationsList.value[activeAudioPickerIndex.value];
    return getAnimAudioStr(anim?.audio);
  }
  return '';
};

const onAudioPickerUpdate = (val: string) => {
  if (activeAudioPickerType.value === 'bgm') {
    globalBgm.value = val;
    updateBgm(val);
  } else if (activeAudioPickerType.value === 'anim' && activeAudioPickerIndex.value !== null) {
    const anim = animationsList.value[activeAudioPickerIndex.value];
    if (anim) {
      anim.audio = val;
      updateAnimations();
    }
  }
};

// --- Audio Player Logic ---
const currentAudioFile = ref<string | null>(null);
let audioElement: HTMLAudioElement | null = null;

const isPlaying = (file: string) => {
  return currentAudioFile.value === file;
};

const togglePlay = (file: string) => {
  if (!file) return;

  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;

    if (currentAudioFile.value === file) {
      currentAudioFile.value = null;
      return;
    }
  }

  currentAudioFile.value = file;
  audioElement = new Audio(file);
  audioElement.play().catch(e => console.error("Audio play failed:", e));

  audioElement.onended = () => {
    if (currentAudioFile.value === file) {
      currentAudioFile.value = null;
    }
  };
};

onMounted(() => {
  if (ctx.hooks) {
    ctx.hooks.on(CanvasEventNames.CHANGE, syncFromElements);
  }
});

onUnmounted(() => {
  if (ctx.hooks) {
    ctx.hooks.off(CanvasEventNames.CHANGE, syncFromElements);
  }
  if (audioElement) {
    audioElement.pause();
  }
});
</script>

<style scoped>
.animate-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.panel-body {
  display: flex;
  flex-direction: column;
}

/* Accordion Common Styles */
.collapse-item {
  border-bottom: 1px solid #f1f3f5;
}

.collapse-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: transparent;
  transition: background 0.2s;
}

.collapse-header:hover {
  background: var(--canvas-btn-bg, #f8f9fa);
}

.collapse-header .title {
  font-size: 13px;
  font-weight: 600;
  color: var(--canvas-text-color, inherit);
}

.collapse-header .arrow {
  color: #adb5bd;
  transition: transform 0.2s;
}

.collapse-header .arrow.open {
  transform: rotate(180deg);
}

.collapse-content {
  padding: 4px 16px 16px 16px;
}

.space-y>*:not(:last-child) {
  margin-bottom: 12px;
}

/* Anim Card */
.anim-card {
  background: var(--canvas-btn-bg, #f8f9fa);
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.anim-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 8px;
  margin-bottom: 8px;
}

.anim-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--canvas-text-color, inherit);
}

.remove-btn {
  background: transparent;
  border: none;
  color: #fa5252;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #ffe3e3;
}

.add-anim-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.add-anim-btn {
  flex: 1;
  padding: 8px;
  background: #f3f0ff;
  border: 1px dashed #b197fc;
  color: #6e56cf;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-anim-btn.random-btn {
  border-style: solid;
  background: var(--canvas-btn-bg, #f8f9fa);
  color: #339af0;
  border-color: #a5d8ff;
}

.add-anim-btn.random-btn:hover {
  background: #e7f5ff;
  border-color: #74c0fc;
}

.add-anim-btn:hover {
  background: #e5dbff;
  border-style: solid;
}

/* Input Styles */
.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-label {
  font-size: 12px;
  color: var(--canvas-text-muted, #868e96);
  width: 60px;
  flex-shrink: 0;
}

.input-label-sm {
  font-size: 11px;
  color: var(--canvas-text-muted, #868e96);
  margin-right: 4px;
  flex-shrink: 0;
}

.input-label.w-full {
  width: auto;
  min-width: 60px;
}

.audio-select-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.custom-select {
  flex: 1;
  width: 100%;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #dee2e6);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--canvas-text-color, inherit);
  outline: none;
  transition: all 0.2s;
}

.custom-select:focus {
  border-color: #6e56cf;
  box-shadow: 0 0 0 2px rgba(110, 86, 207, 0.15);
}

.play-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--canvas-border-color, #e9ecef);
  background: var(--canvas-panel-bg, #ffffff);
  color: #6e56cf;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.play-btn:hover:not(:disabled) {
  background: #f3f0ff;
  border-color: #d0bfff;
}

.play-btn.playing {
  background: #6e56cf;
  color: #ffffff;
  border-color: #6e56cf;
}

.play-btn:disabled {
  color: #ced4da;
  cursor: not-allowed;
  background: var(--canvas-btn-bg, #f8f9fa);
}

/* Anim Picker Button */
.anim-picker-btn {
  flex: 1;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #dee2e6);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: var(--canvas-text-color, inherit);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.anim-picker-btn:hover {
  background: var(--canvas-btn-bg, #f8f9fa);
}

/* Grid for timing */
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.input-box {
  display: flex;
  align-items: center;
  background: var(--canvas-panel-bg, #ffffff);
  border: 1px solid var(--canvas-border-color, #dee2e6);
  border-radius: 6px;
  padding: 4px 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-box:focus-within {
  border-color: #6e56cf;
  box-shadow: 0 0 0 2px rgba(110, 86, 207, 0.15);
}

.input-box input {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--canvas-text-color, inherit);
  font-size: 12px;
  outline: none;
}

.unit {
  font-size: 12px;
  color: #adb5bd;
}

/* Dark Theme Overrides */
:global(.dark) .animate-panel {
  --canvas-panel-bg: #2c2c2c;
  --canvas-btn-bg: #3a3a3a;
  --canvas-btn-hover-bg: #4a4a4a;
  --canvas-border-color: #555;
  --canvas-text-color: #e0e0e0;
  --canvas-text-muted: #aaa;
  --canvas-input-bg: #1e1e1e;
}


</style>
