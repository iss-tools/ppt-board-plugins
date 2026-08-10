<template>
  <div 
    class="library-item"
    :class="{ selected: isSelected }"
    draggable="true"
    @dragstart="handleDragStart"
    @click="$emit('insert', item.id)"
  >
    <div class="checkbox" @click.stop="$emit('toggle-select', item.id)">
      <svg v-if="isSelected" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    
    <div class="preview-box">
      <ComponentPreview :data="item.data" :boxSize="40" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LibraryComponent } from '../store';
import { ComponentPreview } from '@iss-ai/ppt-board';

const props = defineProps<{
  item: LibraryComponent;
  isSelected: boolean;
}>();

defineEmits(['toggle-select', 'insert']);



const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy';
    // We pass the raw json string
    e.dataTransfer.setData('application/vue-canvas-library-item', JSON.stringify(props.item.data));
  }
};
</script>

<style scoped>
.library-item {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: var(--canvas-bg-light, #f8f9fa);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  overflow: hidden;
  box-sizing: border-box;
}

.library-item:hover {
  background: #f1f3f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.library-item:active {
  cursor: grabbing;
}

.library-item.selected {
  background: #e7f5ff;
  border-color: #339af0;
}

.checkbox {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: transparent;
  border: 1.5px solid #ced4da;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  opacity: 0;
  transition: all 0.2s;
  cursor: pointer;
}

.library-item:hover .checkbox {
  opacity: 1;
}

.library-item.selected .checkbox {
  opacity: 1;
  background: #339af0;
  border-color: #339af0;
}

.checkbox:hover {
  border-color: #339af0;
}

.preview-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  /* 屏蔽点击和拖拽事件，让点击穿透到最外层触发 insert */
  pointer-events: none; 
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
}



/* Dark theme overrides */
.dark .library-item, :host-context(.dark) .library-item {
  background: #2a2a2a;
}
.dark .library-item:hover, :host-context(.dark) .library-item:hover {
  background: #333;
}
.dark .library-item.selected, :host-context(.dark) .library-item.selected {
  background: rgba(51, 154, 240, 0.15);
  border-color: #339af0;
}
.dark .checkbox, :host-context(.dark) .checkbox {
  border-color: #555;
}
.dark .checkbox:hover, :host-context(.dark) .checkbox:hover {
  border-color: #339af0;
}

</style>
