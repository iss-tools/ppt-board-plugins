<template>
  <div class="katex-formula-panel" :class="`theme-${theme}`">
    <div class="panel-header">
      <h4>{{ api?.editor?.t('katex.panel.title') || 'Formulas' }}</h4>
      <button class="close-btn" @click="emit('close')">&times;</button>
    </div>
    
    <div class="panel-tabs">
      <div 
        v-for="subject in PRESET_FORMULAS" 
        :key="subject.subject"
        class="tab-item"
        :class="{ active: currentSubject === subject.subject }"
        @click="currentSubject = subject.subject"
      >
        {{ api?.editor?.t(`katex.panel.subjects.${subject.subject}`) || subject.subject }}
      </div>
    </div>

    <div class="panel-body">
      <div v-if="activeSubjectData" class="grade-groups">
        <div v-for="group in activeSubjectData.groups" :key="group.grade" class="grade-group">
          <div class="grade-title">
            {{ api?.editor?.t(`katex.panel.grades.${group.grade}`) || group.grade }}
          </div>
          <div class="formulas-grid">
            <div 
              v-for="formula in group.formulas" 
              :key="formula.id"
              class="formula-item"
              draggable="true"
              @dragstart="onDragStart($event, formula.latex)"
              @click="insertFormula(formula.latex)"
              :title="formula.name"
            >
              <div class="formula-preview" v-html="renderPreview(formula.latex)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import katex from 'katex';
import { PRESET_FORMULAS } from '../data/formulas';

const props = defineProps<{
  ctx?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const api = computed(() => props.ctx?.api);
const state = computed(() => props.ctx?.state);

const theme = computed(() => state.value?.editor?.theme || 'light');

const currentSubject = ref(PRESET_FORMULAS[0].subject);

const activeSubjectData = computed(() => 
  PRESET_FORMULAS.find(s => s.subject === currentSubject.value)
);

const renderPreview = (latex: string) => {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: true });
  } catch (err) {
    return latex;
  }
};

const getCanvasCenter = () => {
  if (!state.value) return { x: 100, y: 100 };
  const viewWidth = state.value.runtime.width;
  const viewHeight = state.value.runtime.height;
  const scale = state.value.runtime.scale || 1;
  const offsetX = state.value.runtime.offsetX || 0;
  const offsetY = state.value.runtime.offsetY || 0;
  
  return {
    x: (viewWidth / 2 - offsetX) / scale - 100,
    y: (viewHeight / 2 - offsetY) / scale - 50,
  };
};

const insertFormula = (latex: string) => {
  if (!api.value || !api.value.elements) return;
  const center = getCanvasCenter();
  api.value.elements.add({
    id: `MathElement_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'MathElement',
    x: center.x,
    y: center.y,
    width: 200,
    height: 100,
    props: {
      latex,
      fontSize: 32,
    }
  });
};

const onDragStart = (e: DragEvent, latex: string) => {
  if (!e.dataTransfer) return;
  const payload = {
    type: 'MathElement',
    props: {
      latex,
      fontSize: 32,
    }
  };
  e.dataTransfer.setData('application/vue-canvas-shape', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'copy';
};
</script>

<style scoped>
.katex-formula-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 320px;
  max-height: 500px;
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
  border-radius: 8px;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: sans-serif;
  user-select: none;
}

.katex-formula-panel.theme-dark {
  background: var(--canvas-panel-bg, #2a2a2a);
  border-color: var(--canvas-border-color, #444);
  color: var(--canvas-text-color, #eee);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.panel-header {
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-dark .panel-header {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--canvas-border-color, #444);
}

.panel-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
}
.close-btn:hover {
  opacity: 1;
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}
.theme-dark .panel-tabs {
  border-color: #444;
}

.tab-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  opacity: 0.6;
}
.tab-item:hover {
  opacity: 1;
}
.tab-item.active {
  opacity: 1;
  border-bottom-color: var(--canvas-active-color, #007bff);
  color: var(--canvas-active-color, #007bff);
  font-weight: bold;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.grade-group {
  margin-bottom: 15px;
}

.grade-title {
  font-size: 12px;
  font-weight: bold;
  opacity: 0.6;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.formulas-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.formula-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  cursor: grab;
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.theme-dark .formula-item {
  border-color: #444;
  background: rgba(255, 255, 255, 0.05);
}

.formula-item:hover {
  border-color: var(--canvas-active-color, #007bff);
  background: rgba(0, 123, 255, 0.05);
}
.formula-item:active {
  cursor: grabbing;
}

.formula-preview {
  pointer-events: none;
  font-size: 12px;
}
.formula-preview :deep(.katex-display) {
  margin: 0;
}
</style>
