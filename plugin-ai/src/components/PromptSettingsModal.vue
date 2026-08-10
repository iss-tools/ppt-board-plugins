<template>
  <n-modal :show="show" @update:show="$emit('update:show', $event)" preset="dialog" :title="t('settings.title')"
    style="width: 600px;">
    <div class="prompt-settings-container">
      <div class="setting-group">
        <div class="group-title">{{ t('settings.visualStyle') }}</div>
        <div class="visual-container">
          <PromptTabVisual :form-data="formData" />
        </div>
      </div>
    </div>

    <template #action>
      <n-button @click="$emit('update:show', false)">{{ t('common.cancel') }}</n-button>
      <n-button type="primary" @click="handleConfirm">{{ t('common.confirm') }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { type AIPromptStyle } from '../composables/useAIStorage';
import { NModal, NRadioGroup, NRadioButton, NButton } from 'naive-ui';
import PromptTabVisual from './PromptTabVisual.vue';
import { useI18n } from '../composables/useI18n';

const props = defineProps({
  show: Boolean,

  initialStyleConfig: { type: Object, default: () => null }
});

const emit = defineEmits(['update:show', 'confirm']);

const { t } = useI18n();






const formData = ref({
  name: '',
  fullPrompt: '',
  template: {
    pageCount: 6,
    audience: ['none'],
    theme: ['none'],
    goal: ['none'],
    structure: ['none'],
    constraints: ['none']
  },
  styleConfig: {
    resolution: '1920x1080',
    aspectRatio: 'auto',
    layout: ['none'],
    colorPalette: ['none'],
    font: ['none'],
    style: ['none'],
    shadow: ['none'],
    textEffect: ['none'],
    shapes: ['none'],
    borderSketch: ['none'],
    fontSize: ['中等 (24-32px)'],
    language: ['Original / 原文'],
    bgm: false,
    supportImage: false,
    supportSound: true
  }
});

watch(() => props.show, (newVal) => {
  if (newVal) {

    if (props.initialStyleConfig) {
      formData.value.styleConfig = JSON.parse(JSON.stringify(props.initialStyleConfig));
    }
  }
});

const handleConfirm = () => {
  emit('confirm', {
    styleConfig: JSON.parse(JSON.stringify(formData.value.styleConfig))
  });
  emit('update:show', false);
};
</script>

<style scoped>
.prompt-settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-weight: bold;
  font-size: 14px;
}

.visual-container {
  height: 400px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  padding-top: 10px;
  padding-left: 8px;
  background: var(--ai-bg);
}

:global(.dark) .visual-container {
  background: #1e1e1e;
  border-color: var(--ai-text);
}

.scope-hint {
  font-size: 12px;
  color: var(--ai-text-muted);
  background: #f9f9f9;
  padding: 8px;
  border-radius: 6px;
  margin-top: 4px;
}

:global(.dark) .scope-hint {
  background: #2a2a2a;
  color: #aaa;
}
</style>
