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
          <span class="el-name">{{ el.type }} - {{ el.id.substring(0, 8) }}</span>
          <div class="el-actions">
            <button class="action-btn" @click.stop="randomAnimation($event, el)" :title="t('tabs.random_enter_effect') || '随机入场动画'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3h5v5"></path>
                <path d="M4 20L21 3"></path>
                <path d="M21 16v5h-5"></path>
                <path d="M15 15l6 6"></path>
                <path d="M4 4l5 5"></path>
              </svg>
            </button>
            <button class="action-btn" @click.stop="setPrevStep($event, el)" title="上一步" :disabled="(el.enterStep || 0) <= 0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button class="action-btn" @click.stop="setNextStep($event, el)" title="下一步">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
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

const setNextStep = (e: Event, el: any) => {
  e.stopPropagation();
  ctx.api.elements.update(el.id, { enterStep: (el.enterStep || 0) + 1 });
};

const setPrevStep = (e: Event, el: any) => {
  e.stopPropagation();
  const nextVal = Math.max(0, (el.enterStep || 0) - 1);
  ctx.api.elements.update(el.id, { enterStep: nextVal });
};

const DEFAULT_ENTRANCE_ANIMATIONS = [
  'animate__fadeIn', 'animate__fadeInDown', 'animate__fadeInLeft', 'animate__fadeInRight',
  'animate__fadeInUp', 'animate__bounceIn', 'animate__bounceInDown', 'animate__bounceInLeft',
  'animate__bounceInRight', 'animate__bounceInUp', 'animate__zoomIn', 'animate__zoomInDown',
  'animate__zoomInLeft', 'animate__zoomInRight', 'animate__zoomInUp', 'animate__slideInDown',
  'animate__slideInLeft', 'animate__slideInRight', 'animate__slideInUp', 'animate__backInDown',
  'animate__backInLeft', 'animate__backInRight', 'animate__backInUp', 'animate__lightSpeedInRight',
  'animate__lightSpeedInLeft', 'animate__flipInX', 'animate__flipInY', 'animate__jackInTheBox',
  'animate__rollIn',
];

const randomAnimation = (e: Event, el: any) => {
  e.stopPropagation();
  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const inAnim = getRandom(DEFAULT_ENTRANCE_ANIMATIONS);
  const baseStep = el.enterStep || 0;
  
  const currentAnimations = Array.isArray(el.animations) ? [...el.animations] : [];
  currentAnimations.push({
    id: 'anim_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    type: 'in',
    animate: inAnim,
    duration: 1.0,
    delay: 0,
    step: baseStep,
    audio: ''
  });
  
  ctx.api.elements.update(el.id, { animations: currentAnimations });
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

.el-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}
.timeline-element:hover .el-actions {
  opacity: 1;
}
.action-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #868e96;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}
.action-btn:hover:not(:disabled) {
  background: #f1f3f5;
  color: #495057;
}
.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.dark .action-btn {
  color: #adb5bd;
}
.dark .action-btn:hover:not(:disabled) {
  background: #3a3a3a;
  color: #e9ecef;
}
</style>
