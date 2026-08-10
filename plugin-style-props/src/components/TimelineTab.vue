<template>
  <div class="timeline-tab-container">
    <div v-for="stepGroup in groupedElements" :key="stepGroup.step" class="step-group">
      <div class="step-header">
        Step {{ stepGroup.step }}
      </div>
      <div class="step-elements"
           @dragover.prevent
           @drop="onDrop($event, stepGroup.step)">
        <div v-for="el in stepGroup.elements" :key="el.id"
             class="timeline-element"
             :class="{ selected: selectedIds.includes(el.id) }"
             draggable="true"
             @dragstart="onDragStart($event, el.id)"
             @click="selectElement(el.id)">
          {{ el.type }} - {{ el.id.substring(0, 8) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import { computed } from 'vue';
import { useCanvasContext } from '@iss-ai/ppt-board';

const props = defineProps<{
  elements: any[]
}>();

const ctx = useCanvasContext();
const { t } = useI18n();
const state = ctx.state;
const selectedIds = computed(() => Array.from(state.runtime.selectedIds));

const groupedElements = computed(() => {
  const groups = new Map<number, any[]>();
  props.elements.forEach(el => {
    const step = el.enterStep || 0;
    if (!groups.has(step)) {
      groups.set(step, []);
    }
    groups.get(step)!.push(el);
  });
  
  return Array.from(groups.entries())
    .map(([step, elements]) => ({ step, elements }))
    .sort((a, b) => a.step - b.step);
});

const selectElement = (id: string) => {
  ctx.selection.setSelection([id]);
};

const onDragStart = (e: DragEvent, id: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', id);
  }
};

const onDrop = (e: DragEvent, targetStep: number) => {
  const id = e.dataTransfer?.getData('text/plain');
  if (id) {
    ctx.api.elements.update(id, { enterStep: targetStep });
  }
};
</script>

<style scoped>
.timeline-tab-container {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}
.step-group {
  margin-bottom: 12px;
}
.step-header {
  font-weight: bold;
  font-size: 13px;
  background: var(--canvas-btn-bg, #f8f9fa);
  padding: 6px 8px;
  border-radius: 4px;
  color: #495057;
  border-left: 3px solid #6e56cf;
}
.step-elements {
  min-height: 40px;
  padding: 8px 0;
}
.timeline-element {
  padding: 8px 12px;
  border: 1px solid var(--canvas-border-color, #e9ecef);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  background: var(--canvas-panel-bg, #ffffff);
  transition: all 0.2s;
  font-size: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.timeline-element:hover {
  border-color: #ced4da;
  transform: translateY(-1px);
}
.timeline-element.selected {
  border-color: #6e56cf;
  background: #f3f0ff;
  color: #6e56cf;
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
}


</style>
