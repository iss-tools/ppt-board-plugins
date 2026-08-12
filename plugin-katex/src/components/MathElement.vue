<template>
  <div class="vue-canvas-math-element" :style="mathStyle">
    <div v-if="!isEditing" class="math-content" v-html="renderedMath" @dragstart.prevent></div>
    <textarea
      v-else
      ref="textareaRef"
      class="math-input"
      :value="(element.props?.latex as string) || '\\frac{1}{2}'"
      @input="onInput"
      @blur="onBlur"
      @keydown.stop="onKeyDown"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { CanvasElementData } from '@iss-ai/ppt-board';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const props = defineProps<{
  element: CanvasElementData;
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', props: Record<string, any>, isTransient?: boolean): void;
  (e: 'finishEdit'): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const mathStyle = computed(() => {
  const p = props.element.props || {};

  return {
    color: (p.color as string) || 'inherit',
    fontSize: `${p.fontSize || 32}px`,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
});

const renderedMath = computed(() => {
  const latex = (props.element.props?.latex as string) || '\\frac{1}{2}';
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true,
      output: 'html',
    });
  } catch (err) {
    return `<span style="color: red;">${err}</span>`;
  }
});

watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
        const val = textareaRef.value.value;
        textareaRef.value.value = '';
        textareaRef.value.value = val;
      }
    });
  }
});

const onInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update', { latex: target.value }, true); // Transient update for real-time typing
};

const onBlur = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update', { latex: target.value }, false);
  emit('finishEdit');
};

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const target = e.target as HTMLTextAreaElement;
    emit('update', { latex: target.value }, false);
    emit('finishEdit');
  }
  if (e.key === 'Escape') {
    emit('finishEdit');
  }
};
</script>

<style scoped>
.vue-canvas-math-element {
  min-width: 100px;
  min-height: 50px;
  box-sizing: border-box;
}
.math-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: default;
}
/* Allow Katex to scale nicely */
.math-content :deep(.katex-display) {
  margin: 0;
}
.math-input {
  width: 100%;
  height: 100%;
  resize: none;
  border: 2px dashed #007bff;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 16px;
  font-family: monospace;
  padding: 8px;
  margin: 0;
  box-sizing: border-box;
  border-radius: 4px;
}
</style>
